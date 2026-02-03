# AWS Secrets Manager - All Application Secrets

# JWT Secrets
resource "aws_secretsmanager_secret" "jwt" {
  name                    = "${var.project_name}/production/jwt"
  recovery_window_in_days = 30
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id = aws_secretsmanager_secret.jwt.id
  secret_string = jsonencode({
    secret         = random_password.jwt_secret.result
    refresh_secret = random_password.jwt_refresh_secret.result
  })
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = true
}

resource "random_password" "jwt_refresh_secret" {
  length  = 64
  special = true
}

# Internal API Key for Service-to-Service Auth
resource "aws_secretsmanager_secret" "internal_api" {
  name                    = "${var.project_name}/production/internal"
  recovery_window_in_days = 30
}

resource "aws_secretsmanager_secret_version" "internal_api" {
  secret_id = aws_secretsmanager_secret.internal_api.id
  secret_string = jsonencode({
    api_key = random_password.internal_api_key.result
  })
}

resource "random_password" "internal_api_key" {
  length  = 64
  special = false
}

# Marqeta Secrets (Placeholder - Add real values via AWS Console)
resource "aws_secretsmanager_secret" "marqeta" {
  name                    = "${var.project_name}/production/marqeta"
  recovery_window_in_days = 30
}

resource "aws_secretsmanager_secret_version" "marqeta" {
  secret_id = aws_secretsmanager_secret.marqeta.id
  secret_string = jsonencode({
    app_token      = "REPLACE_WITH_REAL_MARQETA_APP_TOKEN"
    admin_token    = "REPLACE_WITH_REAL_MARQETA_ADMIN_TOKEN"
    webhook_secret = "REPLACE_WITH_REAL_MARQETA_WEBHOOK_SECRET"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# Stripe Secrets (Placeholder)
resource "aws_secretsmanager_secret" "stripe" {
  name                    = "${var.project_name}/production/stripe"
  recovery_window_in_days = 30
}

resource "aws_secretsmanager_secret_version" "stripe" {
  secret_id = aws_secretsmanager_secret.stripe.id
  secret_string = jsonencode({
    secret_key      = "REPLACE_WITH_REAL_STRIPE_SECRET_KEY"
    publishable_key = "REPLACE_WITH_REAL_STRIPE_PUBLISHABLE_KEY"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# SendGrid Secrets (Placeholder)
resource "aws_secretsmanager_secret" "sendgrid" {
  name                    = "${var.project_name}/production/sendgrid"
  recovery_window_in_days = 30
}

resource "aws_secretsmanager_secret_version" "sendgrid" {
  secret_id = aws_secretsmanager_secret.sendgrid.id
  secret_string = jsonencode({
    api_key = "REPLACE_WITH_REAL_SENDGRID_API_KEY"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# RabbitMQ Secrets
resource "aws_secretsmanager_secret" "rabbitmq" {
  name                    = "${var.project_name}/production/rabbitmq"
  recovery_window_in_days = 30
}

resource "aws_secretsmanager_secret_version" "rabbitmq" {
  secret_id = aws_secretsmanager_secret.rabbitmq.id
  secret_string = jsonencode({
    url      = "amqps://${random_password.rabbitmq_user.result}:${random_password.rabbitmq_password.result}@${aws_mq_broker.main.instances[0].endpoints[0]}"
    username = random_password.rabbitmq_user.result
    password = random_password.rabbitmq_password.result
  })
}

resource "random_password" "rabbitmq_user" {
  length  = 16
  special = false
}

resource "random_password" "rabbitmq_password" {
  length  = 32
  special = true
}

# Amazon MQ (RabbitMQ)
resource "aws_mq_broker" "main" {
  broker_name = "${var.project_name}-rabbitmq"

  engine_type        = "RabbitMQ"
  engine_version     = "3.11.20"
  host_instance_type = "mq.m5.large"
  deployment_mode    = "CLUSTER_MULTI_AZ"

  user {
    username = random_password.rabbitmq_user.result
    password = random_password.rabbitmq_password.result
  }

  subnet_ids         = [aws_subnet.private[0].id, aws_subnet.private[1].id]
  security_groups    = [aws_security_group.rabbitmq.id]
  publicly_accessible = false

  encryption_options {
    use_aws_owned_key = false
    kms_key_id        = aws_kms_key.rabbitmq.arn
  }

  logs {
    general = true
  }

  tags = {
    Name = "${var.project_name}-rabbitmq"
  }
}

resource "aws_security_group" "rabbitmq" {
  name        = "${var.project_name}-rabbitmq-sg"
  description = "Security group for Amazon MQ RabbitMQ"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "AMQPS from EKS"
    from_port       = 5671
    to_port         = 5671
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }

  ingress {
    description     = "RabbitMQ Management from EKS"
    from_port       = 443
    to_port         = 443
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
    Name = "${var.project_name}-rabbitmq-sg"
  }
}

resource "aws_kms_key" "rabbitmq" {
  description             = "KMS key for RabbitMQ encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

resource "aws_kms_alias" "rabbitmq" {
  name          = "alias/${var.project_name}-rabbitmq"
  target_key_id = aws_kms_key.rabbitmq.key_id
}

output "rabbitmq_endpoint" {
  description = "RabbitMQ broker endpoint"
  value       = aws_mq_broker.main.instances[0].endpoints[0]
  sensitive   = true
}
