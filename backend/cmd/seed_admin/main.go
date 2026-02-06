package main

import (
	"log"
	"taskmanager-backend/backend/config"
	"taskmanager-backend/backend/models"
	"taskmanager-backend/backend/utils"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on system env")
	}

	config.ConnectDB()

	// Create Admin User
	adminEmail := "admin@example.com"
	password := "admin123"

	var user models.User
	if err := config.DB.Where("email = ?", adminEmail).First(&user).Error; err == nil {
		log.Println("Admin user already exists")
		return
	}

	hashedPassword, _ := utils.HashPassword(password)
	admin := models.User{
		Name:               "Admin User",
		Email:              adminEmail,
		Password:           hashedPassword,
		Role:               "admin",
		Verified:           true,
		SubscriptionStatus: "active",
		SubscriptionPlan:   "enterprise",
	}

	if err := config.DB.Create(&admin).Error; err != nil {
		log.Fatalf("Failed to create admin user: %v", err)
	}

	log.Println("Admin user created successfully")
	log.Printf("Email: %s", adminEmail)
	log.Printf("Password: %s", password)
}
