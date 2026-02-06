package main

import (
	"log"
	"os"
	"taskmanager-backend/backend/config"
	"taskmanager-backend/backend/models"
	"taskmanager-backend/backend/routes"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Connect to Database
	config.ConnectDB()

	// Run Migrations
	if err := models.Migrate(config.DB); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Seed Data
	// seeds.Seed(config.DB)

	// Setup Router
	r := routes.SetupRouter()

	// Start Server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
