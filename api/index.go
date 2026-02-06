package handler

import (
	"log"
	"net/http"
	"taskmanager-backend/backend/config"
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

	// Setup Router
	app = routes.SetupRouter()
}

// Handler is the entry point for Vercel
func Handler(w http.ResponseWriter, r *http.Request) {
	app.ServeHTTP(w, r)
}
