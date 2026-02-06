package routes

import (
	"os"
	"strings"
	"taskmanager-backend/backend/handlers"
	"taskmanager-backend/backend/middlewares"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	allowedOrigins := []string{"http://localhost:3000", "http://localhost:5173"}
	if envOrigins := os.Getenv("ALLOWED_ORIGINS"); envOrigins != "" {
		allowedOrigins = strings.Split(envOrigins, ",")
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Global Middleware
	r.Use(middlewares.SecurityHeadersMiddleware())
	r.Use(middlewares.RateLimitMiddleware())

	api := r.Group("/api")

	// Auth routes
	auth := api.Group("/auth")
	{
		auth.POST("/signup", handlers.Register)
		auth.POST("/login", handlers.Login)
	}

	// Stripe Webhook (No Auth Middleware)
	api.POST("/webhook", handlers.HandleStripeWebhook)

	// Protected routes
	protected := api.Group("/")
	protected.Use(middlewares.JwtAuthMiddleware())
	{
		protected.GET("/auth/me", handlers.CurrentUser)
		protected.PUT("/auth/profile", handlers.UpdateProfile)

		protected.POST("/subscriptions/purchase", handlers.CreatePaymentIntent)

		protected.GET("/tasks", handlers.GetTasks)
		protected.POST("/tasks", handlers.CreateTask)
		protected.GET("/tasks/:id", handlers.GetTask)
		protected.PUT("/tasks/:id", handlers.UpdateTask)
		protected.DELETE("/tasks/:id", handlers.DeleteTask)
	}

	// Admin routes
	admin := api.Group("/admin")
	admin.Use(middlewares.JwtAuthMiddleware(), middlewares.AdminAuthMiddleware())
	{
		admin.GET("/users", handlers.GetAllUsers)
		admin.GET("/stats", handlers.GetAdminStats)
		admin.PUT("/users/:id", handlers.UpdateUserStatus)
		admin.POST("/users/:id/credits", handlers.AddUserCredits)
		admin.GET("/transactions", handlers.GetAllTransactions)
	}

	// Serve Admin UI
	r.Static("/admin", "../admin-panel/dist")

	return r
}
