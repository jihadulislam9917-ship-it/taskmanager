package models

import "time"

type User struct {
	ID                    uint       `gorm:"primaryKey" json:"id"`
	Name                  string     `json:"name"`
	Email                 string     `gorm:"uniqueIndex;not null" json:"email"`
	Password              string     `json:"-"` // Don't return password in JSON
	Role                  string     `gorm:"default:'user'" json:"role"`
	Verified              bool       `gorm:"default:false" json:"verified"`
	SubscriptionPlan      string     `gorm:"default:'free'" json:"subscription_plan"`
	SubscriptionStatus    string     `gorm:"default:'active'" json:"subscription_status"`
	StripeCustomerID      string     `json:"stripe_customer_id"`
	SubscriptionExpiresAt *time.Time `json:"subscription_expires_at"`
	Credits               int        `gorm:"default:5" json:"credits"` // New field
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"`
}
