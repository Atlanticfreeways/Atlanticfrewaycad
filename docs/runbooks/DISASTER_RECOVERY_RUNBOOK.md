# Disaster Recovery Runbook & Incident Response Plan

**Version**: 1.0.0
**Last Updated**: 2026-02-05
**Status**: ACTIVE

---

## 1. Incident Classification

| Severity | Description | Response Time | Example |
|---|---|---|---|
| **SEV-1** | Critical system outage, data loss, or security breach. | **15 Minutes** | Database down, payment processing halted, active attack. |
| **SEV-2** | Major feature broken, degraded performance. | **1 Hour** | Login failing for some users, emails not sending. |
| **SEV-3** | Minor bug, cosmetic issue, internal tool down. | **24 Hours** | Admin dashboard slow, typo in UI. |

---

## 2. Roles & Responsibilities

- **Incident Commander (IC)**: Leads the response, communicates status. (Default: Lead Engineer)
- **Tech Lead**: Investigates root cause and implements fixes.
- **Comms Lead**: Updates stakeholders/users (Status Page, Emails).

---

## 3. Scenarios & Procedures

### A. Database Failure (PostgreSQL)

**Symptoms**: API returns 500 errors, "Connection refused", `pg_stat_activity` blocked.

**Recovery Steps**:
1.  **Check Status**: Log into AWS RDS Console. Check CPU, Memory, Connections.
2.  **Failover (If Multi-AZ)**:
    *   If Primary is unresponsive, force failover to Standby via AWS Console -> Actions -> Reboot -> Failover.
    *   *ETA*: 60-120 seconds.
3.  **Restore from Backup (Data Corruption/Deletion)**:
    *   Identify the "Point of Time" before corruption (e.g., 10:14 AM).
    *   Initiate **Point-in-Time Recovery (PITR)** to a NEW DB instance.
    *   Update `DATABASE_URL` secret in Secrets Manager to point to new instance.
    *   Restart API services.
4.  **Verification**: Run `/health` endpoint and verify ability to query critical tables.

### B. Redis Failure

**Symptoms**: Login fails (sessions), Performance drops (caching), JIT declines.

**Recovery Steps**:
1.  **Check Status**: `redis-cli -h <host> ping`.
2.  **Restart**: If stuck, reboot ElastiCache node.
3.  **Flush**: If cache is corrupted, run `FLUSHALL` (Warning: logs out all users).
4.  **Bypass**: If Redis is completely dead, set `ENABLE_REDIS=false` env var to force DB fallback for sessions/auth (Performance will degrade).

### C. Critical Security Breach (Key Leak)

**Symptoms**: Unauthorized API usage, strange transactions, Github alert for exposed key.

**Recovery Steps**:
1.  **Revoke**: Immediately revoke the compromised key (AWS IAM, Stripe/Marqeta Dashboard).
2.  **Rotate**: Generate new keys.
3.  **Update Secrets**: Update AWS Secrets Manager with new values.
4.  **Redeploy**: Force unexpected restart of all pods to pick up new secrets.
5.  **Audit**: Query `audit_logs` for any actions taken with the compromised key.
6.  **Notify**: Report to Privacy Officer if User Data was accessed (GDPR 72h rule).

### D. Kubernetes/API Outage

**Symptoms**: Pods crashing, `CrashLoopBackOff`, Load Balancer 502s.

**Recovery Steps**:
1.  **Check Logs**: `kubectl logs -l app=api --tail=100`.
2.  **Rollback**: If caused by recent deploy:
    *   `kubectl rollout undo deployment/atlantic-api`
3.  **Scale**: If resource exhaustion (OOMKilled):
    *   `kubectl scale deployment/atlantic-api --replicas=10`
4.  **Restart**: Force restart pods:
    *   `kubectl rollout restart deployment/atlantic-api`

---

## 4. Key Contacts

*   **AWS Support**: [Link to Console]
*   **Marqeta Support**: support@marqeta.com | +1-888-555-0199
*   **Onfido Support**: support@onfido.com
*   **Lead Engineer**: [Phone Number]

---

## 5. Post-Mortem

After every SEV-1 or SEV-2:
1.  Create a "Post-Mortem" doc.
2.  Timeline of events.
3.  Root Cause Analysis (5 Whys).
4.  Action Items to prevent recurrence.
