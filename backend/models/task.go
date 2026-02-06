package models

import (
	"time"

	"gorm.io/gorm"
)

type Task struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"not null" json:"title" binding:"required"`
	Description string         `json:"description"`
	Status      string         `gorm:"default:'pending'" json:"status"`  // pending, in-progress, completed
	Priority    string         `gorm:"default:'medium'" json:"priority"` // low, medium, high
	DueDate     *time.Time     `json:"due_date"`
	Assignee    string         `json:"assignee"`
	UserID      uint           `json:"user_id"`
	User        User           `gorm:"foreignKey:UserID" json:"-"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(&User{}, &Task{}, &Transaction{})
}
