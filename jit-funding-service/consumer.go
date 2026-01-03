package main

import (
	"encoding/json"
	"log"

	"github.com/streadway/amqp"
)

func (s *JITFundingService) ConsumeJITFundingQueue() {
	msgs, err := s.channel.Consume(
		"jit-funding-queue", // queue
		"",                  // consumer
		false,               // auto-ack
		false,               // exclusive
		false,               // no-local
		false,               // no-wait
		nil,                 // args
	)
	if err != nil {
		log.Printf("Failed to register a consumer: %v", err)
		return
	}

	log.Println("Waiting for JIT funding requests...")

	for msg := range msgs {
		var transaction Transaction
		if err := json.Unmarshal(msg.Body, &transaction); err != nil {
			log.Printf("Error parsing message: %v", err)
			msg.Nack(false, false) // Dead letter
			continue
		}

		decision := s.ProcessAuthorization(transaction)

		if err := s.publishDecision(decision); err != nil {
			log.Printf("Failed to publish decision: %v", err)
			msg.Nack(false, true) // Requeue
		} else {
			msg.Ack(false)
		}
	}
}

func (s *JITFundingService) publishDecision(decision AuthorizationDecision) error {
	body, err := json.Marshal(decision)
	if err != nil {
		return err
	}

	return s.channel.Publish(
		"transactions",      // exchange
		"jit-funding.decision", // routing key
		false,               // mandatory
		false,               // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		})
}
