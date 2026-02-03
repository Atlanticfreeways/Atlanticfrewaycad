# ElastiCache Redis Cluster
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-redis-subnet-group"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_security_group" "redis" {
  name        = "${var.project_name}-redis-sg"
  description = "Security group for ElastiCache Redis"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Redis from EKS"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-redis-sg"
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${var.project_name}-redis"
  replication_group_description = "Redis cluster for Atlantic Freeway Card"

  engine               = "redis"
  engine_version       = "7.0"
  node_type            = var.redis_node_type
  num_cache_clusters   = 3
  parameter_group_name = aws_elasticache_parameter_group.main.name

  port                       = 6379
  subnet_group_name          = aws_elasticache_subnet_group.main.name
  security_group_ids         = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token_enabled         = true
  auth_token                 = random_password.redis_password.result

  automatic_failover_enabled = true
  multi_az_enabled           = true

  snapshot_retention_limit = 7
  snapshot_window          = "03:00-05:00"
  maintenance_window       = "sun:05:00-sun:07:00"

  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis_slow_log.name
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "slow-log"
  }

  tags = {
    Name = "${var.project_name}-redis-cluster"
  }
}

resource "aws_elasticache_parameter_group" "main" {
  name   = "${var.project_name}-redis-params"
  family = "redis7"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  parameter {
    name  = "timeout"
    value = "300"
  }

  parameter {
    name  = "tcp-keepalive"
    value = "300"
  }
}

resource "random_password" "redis_password" {
  length  = 32
  special = false
}

resource "aws_cloudwatch_log_group" "redis_slow_log" {
  name              = "/aws/elasticache/${var.project_name}/redis/slow-log"
  retention_in_days = 7
}

# Store Redis credentials in Secrets Manager
resource "aws_secretsmanager_secret" "redis_credentials" {
  name = "${var.project_name}/production/redis"
  recovery_window_in_days = 30
}

resource "aws_secretsmanager_secret_version" "redis_credentials" {
  secret_id = aws_secretsmanager_secret.redis_credentials.id
  secret_string = jsonencode({
    url      = "rediss://:${random_password.redis_password.result}@${aws_elasticache_replication_group.main.configuration_endpoint_address}:6379"
    host     = aws_elasticache_replication_group.main.configuration_endpoint_address
    port     = 6379
    password = random_password.redis_password.result
  })
}

output "redis_endpoint" {
  description = "Redis cluster endpoint"
  value       = aws_elasticache_replication_group.main.configuration_endpoint_address
  sensitive   = true
}
