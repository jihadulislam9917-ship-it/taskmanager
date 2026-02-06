package models

import "time"

type Transaction struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `json:"user_id"`
	Amount      int       `json:"amount"`      // Can be positive (add) or negative (deduct)
	Type        string    `json:"type"`        // "purchase", "usage", "admin_adjustment", "bonus"
	Description string    `json:"description"` // e.g. "Task creation", "Bought 10 credits"
	CreatedAt   time.Time `json:"created_at"`
}
