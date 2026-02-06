package seeds

import (
	"log"
	"taskmanager-backend/backend/models"
	"time"

	"gorm.io/gorm"
)

func Seed(db *gorm.DB) {
	var count int64
	db.Model(&models.Task{}).Count(&count)
	if count > 0 {
		return
	}

	tasks := []models.Task{
		{
			Title:       "Setup Project",
			Description: "Initialize Go backend and Next.js frontend",
			Status:      "completed",
			Priority:    "high",
			Assignee:    "Developer",
			DueDate:     getTimePtr(time.Now().AddDate(0, 0, -1)),
		},
		{
			Title:       "Implement API",
			Description: "Create CRUD endpoints for tasks",
			Status:      "in-progress",
			Priority:    "high",
			Assignee:    "Backend Team",
			DueDate:     getTimePtr(time.Now().AddDate(0, 0, 1)),
		},
		{
			Title:       "Design UI",
			Description: "Create a modern interface with Tailwind CSS",
			Status:      "pending",
			Priority:    "medium",
			Assignee:    "Frontend Team",
			DueDate:     getTimePtr(time.Now().AddDate(0, 0, 2)),
		},
	}

	if err := db.Create(&tasks).Error; err != nil {
		log.Printf("Failed to seed data: %v", err)
	} else {
		log.Println("Seed data added successfully")
	}
}

func getTimePtr(t time.Time) *time.Time {
	return &t
}
