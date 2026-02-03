# Phase 12+ Infrastructure Deployment Guide

This directory contains Infrastructure-as-Code (IaC) for deploying the Atlantic Freeway Card platform to production on AWS.

## 📁 Directory Structure

```
infrastructure/
├── terraform/          # AWS resource provisioning
│   ├── main.tf        # Provider and variable configuration
│   ├── vpc.tf         # VPC, subnets, NAT gateways
│   ├── eks.tf         # EKS cluster and node groups
│   ├── rds.tf         # PostgreSQL Multi-AZ database
│   ├── redis.tf       # ElastiCache Redis cluster
│   └── secrets.tf     # AWS Secrets Manager and RabbitMQ
├── kubernetes/        # K8s manifests
│   ├── api-deployment.yaml         # Node.js API deployment
│   ├── jit-service-deployment.yaml # Go JIT service deployment
│   ├── config.yaml                 # ConfigMaps, Ingress, PDBs
│   └── external-secrets.yaml       # Secrets sync from AWS
└── helm/              # Helm charts (future)
```

---

## 🚀 Deployment Steps

### Prerequisites

1. **AWS Account** with admin access
2. **AWS CLI** configured (`aws configure`)
3. **Terraform** >= 1.0 installed
4. **kubectl** installed
5. **Docker** for building images

### Step 1: Provision AWS Infrastructure

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Apply (creates VPC, EKS, RDS, Redis, Secrets Manager)
terraform apply
```

**Resources Created**:
- VPC with 3 public + 3 private subnets across 3 AZs
- EKS cluster with 2 node groups (general + JIT-optimized)
- PostgreSQL RDS Multi-AZ with read replica
- ElastiCache Redis cluster (3 nodes)
- Amazon MQ RabbitMQ (Multi-AZ)
- AWS Secrets Manager (all application secrets)

**Estimated Time**: 20-30 minutes  
**Estimated Cost**: ~$800-1200/month

---

### Step 2: Configure kubectl

```bash
# Update kubeconfig to connect to EKS
aws eks update-kubeconfig --name atlanticfrewaycard-cluster --region us-east-1
```

---

### Step 3: Install External Secrets Operator

```bash
# Add Helm repo
helm repo add external-secrets https://charts.external-secrets.io

# Install operator
helm install external-secrets \
  external-secrets/external-secrets \
  -n external-secrets-system \
  --create-namespace
```

---

### Step 4: Deploy Application

```bash
cd infrastructure/kubernetes

# Create production namespace
kubectl apply -f config.yaml

# Deploy External Secrets sync
kubectl apply -f external-secrets.yaml

# Wait for secrets to sync (check status)
kubectl get externalsecrets -n production

# Deploy API and JIT service
kubectl apply -f api-deployment.yaml
kubectl apply -f jit-service-deployment.yaml
```

---

### Step 5: Verify Deployment

```bash
# Check pod status
kubectl get pods -n production

# Check HPA status
kubectl get hpa -n production

# Get ingress URL
kubectl get ingress -n production

# View logs
kubectl logs -f deployment/atlanticfrewaycard-api -n production
```

---

## 🔐 Secrets Management

### Adding/Updating Secrets

Secrets are stored in AWS Secrets Manager and automatically synced to Kubernetes via External Secrets Operator.

**To update a secret**:

```bash
# Update via AWS CLI
aws secretsmanager update-secret \
  --secret-id atlanticfrewaycard/production/marqeta \
  --secret-string '{"app_token":"new_token","admin_token":"new_admin_token","webhook_secret":"new_secret"}'

# Secrets will auto-sync within 1 hour (or force refresh)
kubectl annotate externalsecret atlanticfrewaycard-secrets \
  force-sync=$(date +%s) -n production
```

**Required Secrets** (update placeholders in Terraform):
- `atlanticfrewaycard/production/marqeta` - Marqeta API credentials
- `atlanticfrewaycard/production/stripe` - Stripe API keys
- `atlanticfrewaycard/production/sendgrid` - SendGrid API key

---

## 📊 Monitoring & Observability

### Install Prometheus + Grafana

```bash
# Add Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# Install kube-prometheus-stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace

# Access Grafana
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
# Username: admin, Password: prom-operator
```

### Key Metrics to Monitor

- **JIT Latency**: p50, p95, p99 (target: <100ms)
- **API Response Time**: p95 (target: <200ms)
- **Database Connections**: Pool saturation
- **Redis Hit Rate**: Should be >70%
- **Pod CPU/Memory**: Autoscaling triggers

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/production-cicd.yml`) automates:

1. **Security Scanning**: Trivy + Gitleaks
2. **Testing**: Unit + Integration tests
3. **Build**: Docker images pushed to ECR
4. **Deploy Staging**: Automatic deployment to staging namespace
5. **Deploy Production**: Manual approval required

**Required GitHub Secrets**:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CODECOV_TOKEN`
- `SLACK_WEBHOOK` (optional)

---

## 🛡️ Security Checklist

- [x] Secrets stored in AWS Secrets Manager (not `.env`)
- [x] Database encryption at rest (KMS)
- [x] Redis encryption in transit (TLS)
- [x] RabbitMQ encryption (TLS)
- [x] Network isolation (private subnets)
- [x] Pod security contexts (non-root)
- [x] RBAC enabled on EKS
- [x] VPC Flow Logs enabled
- [ ] WAF on ALB (manual setup required)
- [ ] GuardDuty enabled (manual setup required)

---

## 💰 Cost Optimization

**Monthly Cost Breakdown** (estimated):
- EKS Control Plane: $73
- EC2 Nodes (8x t3.xlarge): ~$400
- RDS Multi-AZ (db.r6g.xlarge): ~$350
- ElastiCache (3x cache.r6g.large): ~$250
- Amazon MQ (mq.m5.large): ~$200
- NAT Gateways (3x): ~$100
- Data Transfer: ~$50

**Total**: ~$1,423/month

**Savings Tips**:
- Use Savings Plans for EC2/RDS (30% discount)
- Enable RDS auto-pause for non-prod
- Use Spot instances for non-critical workloads

---

## 🚨 Disaster Recovery

### Database Backups

- **Automated**: Daily snapshots (30-day retention)
- **Point-in-Time Recovery**: Up to 5 minutes before failure
- **Cross-Region Replication**: Enable for critical data

### Restore Procedure

```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier atlanticfrewaycard-db-restored \
  --db-snapshot-identifier <snapshot-id>

# Update DATABASE_URL secret
aws secretsmanager update-secret \
  --secret-id atlanticfrewaycard/production/database \
  --secret-string '{"url":"postgresql://..."}'
```

---

## 📞 Support

For infrastructure issues:
1. Check CloudWatch Logs: `/aws/eks/atlanticfrewaycard-cluster`
2. Review Terraform state: `terraform show`
3. EKS troubleshooting: `kubectl describe pod <pod-name> -n production`

---

**Last Updated**: February 3, 2026  
**Maintained By**: DevOps Team
