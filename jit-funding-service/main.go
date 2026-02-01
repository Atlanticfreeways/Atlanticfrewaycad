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
	TransactionID    string  `json:"transactionId"`
	UserID           string  `json:"userId"`
	CardID           string  `json:"cardId"`
	Amount           float64 `json:"amount"`
	Currency         string  `json:"currency"` // Usually USD
	MerchantName     string  `json:"merchantName"`
	MerchantCategory string  `json:"merchantCategory"`
}

type AuthorizationDecision struct {
	TransactionID string  `json:"transactionId"`
	Approved      bool    `json:"approved"`
	Reason        string  `json:"reason"`
	ProcessTimeMs int64   `json:"processTimeMs"`
	Currency      string  `json:"currency"`
	Amount        float64 `json:"amount"`
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

	decision := AuthorizationDecision{
		TransactionID: transaction.TransactionID,
		Approved:      false,
		Reason:        "system_error",
		Amount:        transaction.Amount,
		Currency:      "USD",
	}

	// 1. Get User
	user, err := s.GetUserFromCache(transaction.UserID)
	if err != nil || user == nil {
		// Fallback to Postgres if cache miss
		user, err = s.GetUserFromDB(transaction.UserID)
		if err != nil || user == nil {
			decision.Reason = "USER_NOT_FOUND"
			return decision
		}
	}

	// 2. Multi-Currency Check
	fundingSource := "USD"
	if user.PreferredCurrency != "" && user.PreferredCurrency != "USD" {
		fundingSource = user.PreferredCurrency
	}

	transactionAmount := transaction.Amount
	if fundingSource != "USD" {
		// Convert to funding currency
		rate, err := s.GetExchangeRate("USD", fundingSource)
		if err != nil {
			decision.Reason = "EXCHANGE_RATE_ERROR"
			return decision
		}

		// Apply spread (Simplified for Go demo - 0.5% for fiat, 2% for crypto)
		spread := 0.005
		if fundingSource == "BTC" || fundingSource == "ETH" {
			spread = 0.02
		}

		effectiveRate := rate * (1 - spread)
		transactionAmount = transaction.Amount / effectiveRate
		decision.Amount = transactionAmount
		decision.Currency = fundingSource

		// Log conversion for compliance (Async in background)
		go s.LogConversion(user.ID, "USD", fundingSource, transaction.Amount, transactionAmount, rate, spread)
	}

	// 3. Merchant & Category Enrichment
	enrichment := EnrichMerchant(transaction.MerchantName, transaction.MerchantCategory)
	transaction.MerchantName = enrichment.Name
	transaction.MerchantCategory = enrichment.Category

	// 4. Check Merchant Restrictions (Placeholder)
	if enrichment.Group == "Gambling" {
		decision.Approved = false
		decision.Reason = "MERCHANT_CATEGORY_BLOCKED"
		return decision
	}

	// 5. Check Balance
	balance, err := s.GetBalance(user.ID, fundingSource)
	if err != nil {
		decision.Reason = "BALANCE_CHECK_ERROR"
		return decision
	}

	if balance < transactionAmount {
		decision.Approved = false
		decision.Reason = "INSUFFICIENT_FUNDS"
		return decision
	}

	decision.Approved = true
	decision.Reason = "approved"
	decision.ProcessTimeMs = time.Since(start).Milliseconds()
	return decision
}

func (s *JITFundingService) GetUserFromDB(userID string) (*User, error) {
	var user User
	err := s.postgres.QueryRow(s.ctx, "SELECT id, status, preferred_display_currency, account_type FROM users WHERE id = $1", userID).Scan(&user.ID, &user.Status, &user.PreferredCurrency, &user.AccountType)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *JITFundingService) GetBalance(userID, currency string) (float64, error) {
	var balance float64
	err := s.postgres.QueryRow(s.ctx, "SELECT balance FROM wallet_balances WHERE user_id = $1 AND currency = $2", userID, currency).Scan(&balance)
	return balance, err
}

func (s *JITFundingService) GetExchangeRate(from, to string) (float64, error) {
	// Simple lookup for now - in production would fetch all rates from Redis at once
	// 1 USD = rate TO
	rateKey := fmt.Sprintf("rate:%s", to)
	val, err := s.redis.Get(s.ctx, rateKey).Result()
	if err == redis.Nil {
		// Fallback to a default if crypto
		if to == "BTC" {
			return 0.00002, nil
		}
		return 1.0, nil
	}
	if err != nil {
		return 0, err
	}

	var rate float64
	fmt.Sscanf(val, "%f", &rate)
	return rate, nil
}

func (s *JITFundingService) LogConversion(userId, from, to string, sourceAmt, targetAmt, rate, spread float64) {
	_, err := s.postgres.Exec(s.ctx, `
		INSERT INTO currency_conversion_logs 
		(user_id, from_currency, to_currency, amount_source, amount_target, rate_applied, spread_fee) 
		VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		userId, from, to, sourceAmt, targetAmt, rate, spread)
	if err != nil {
		log.Printf("Failed to log conversion: %v", err)
	}
}
