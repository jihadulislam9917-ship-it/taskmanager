package handler

import (
	"net/http"
	"taskmanager-backend/backend/config"
	"taskmanager-backend/backend/models"
	"taskmanager-backend/backend/routes"

	"github.com/gin-gonic/gin"
)

var app *gin.Engine

func init() {
	// Initialize Gin Mode
	gin.SetMode(gin.ReleaseMode)

	// Connect to Database
	// Note: In a serverless environment, managing DB connections can be tricky.
	// We rely on the global DB variable in config.
	config.ConnectDB()

	// Run Migrations (Safe for small apps, ensures DB is ready)
	if err := models.Migrate(config.DB); err != nil {
		// Log error but don't panic, let the app try to run
		println("Migration failed:", err.Error())
	}

	// Setup Router
	app = routes.SetupRouter()
}

// Handler is the entry point for Vercel
func Handler(w http.ResponseWriter, r *http.Request) {
	app.ServeHTTP(w, r)
}
