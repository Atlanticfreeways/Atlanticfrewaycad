package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/streadway/amqp"
)

type JITFundingService struct {
	rabbitmq *amqp.Connection
	channel  *amqp.Channel
	redis    *redis.Client
	postgres *pgxpool.Pool
	ctx      context.Context
}

type Transaction struct {
	TransactionID string  `json:"transactionId"`
	UserID        string  `json:"userId"`
	CardID        string  `json:"cardId"`
	Amount        float64 `json:"amount"`
}

type AuthorizationDecision struct {
	TransactionID string `json:"transactionId"`
	Approved      bool   `json:"approved"`
	Reason        string `json:"reason"`
	ProcessTimeMs int64  `json:"processTimeMs"`
}

func main() {
	service := &JITFundingService{
		ctx: context.Background(),
	}

	if err := service.Initialize(); err != nil {
		log.Fatalf("Failed to initialize service: %v", err)
	}
	defer service.Close()

	log.Println("JIT Funding Service (Go) started")

	// Start consuming messages
	forever := make(chan bool)
	go service.ConsumeJITFundingQueue()
	<-forever
}

func (s *JITFundingService) Initialize() error {
	var err error

	// Connect to Redis
	redisAddr := os.Getenv("REDIS_URL")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}
	s.redis = redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})
	if err := s.redis.Ping(s.ctx).Err(); err != nil {
		return fmt.Errorf("failed to connect to Redis: %v", err)
	}

	// Connect to PostgreSQL
	pgUrl := os.Getenv("DATABASE_URL")
	if pgUrl == "" {
		pgUrl = "postgres://postgres:password@localhost:5432/atlanticfrewaycard"
	}
	s.postgres, err = pgxpool.Connect(s.ctx, pgUrl)
	if err != nil {
		return fmt.Errorf("failed to connect to PostgreSQL: %v", err)
	}

	// Connect to RabbitMQ
	amqpUrl := os.Getenv("RABBITMQ_URL")
	if amqpUrl == "" {
		amqpUrl = "amqp://guest:guest@localhost:5672/"
	}
	s.rabbitmq, err = amqp.Dial(amqpUrl)
	if err != nil {
		return fmt.Errorf("failed to connect to RabbitMQ: %v", err)
	}

	s.channel, err = s.rabbitmq.Channel()
	if err != nil {
		return fmt.Errorf("failed to open RabbitMQ channel: %v", err)
	}

	return nil
}

func (s *JITFundingService) Close() {
	if s.postgres != nil {
		s.postgres.Close()
	}
	if s.redis != nil {
		s.redis.Close()
	}
	if s.channel != nil {
		s.channel.Close()
	}
	if s.rabbitmq != nil {
		s.rabbitmq.Close()
	}
}

func (s *JITFundingService) ProcessAuthorization(transaction Transaction) AuthorizationDecision {
	start := time.Now()

	// Ultra-fast authorization logic
	// In a real scenario, this would check cache/db

	decision := AuthorizationDecision{
		TransactionID: transaction.TransactionID,
		Approved:      true,
		Reason:        "approved",
	}

	// Mock check logic
	if transaction.Amount > 10000 {
		decision.Approved = false
		decision.Reason = "amount_too_high"
	}

	decision.ProcessTimeMs = time.Since(start).Milliseconds()
	return decision
}
