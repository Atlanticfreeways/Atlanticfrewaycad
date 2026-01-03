package main

import (
	"encoding/json"
	"fmt"

	"github.com/go-redis/redis/v8"
)

type User struct {
	ID      string  `json:"id"`
	Status  string  `json:"status"`
	Balance float64 `json:"balance"`
}

func (s *JITFundingService) GetUserFromCache(userID string) (*User, error) {
	val, err := s.redis.Get(s.ctx, fmt.Sprintf("user:%s", userID)).Result()
	if err == redis.Nil {
		return nil, nil // Cache miss
	}
	if err != nil {
		return nil, err
	}

	var user User
	if err := json.Unmarshal([]byte(val), &user); err != nil {
		return nil, err
	}
	return &user, nil
}
