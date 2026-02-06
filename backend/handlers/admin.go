package handlers

import (
	"log"
	"net/http"
	"taskmanager-backend/backend/config"
	"taskmanager-backend/backend/models"

	"github.com/gin-gonic/gin"
)

func GetAllUsers(c *gin.Context) {
	var users []models.User
	if err := config.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	c.JSON(http.StatusOK, users)
}

func GetAdminStats(c *gin.Context) {
	var userCount int64
	var taskCount int64
	var activeSubscriptions int64

	config.DB.Model(&models.User{}).Count(&userCount)
	config.DB.Model(&models.Task{}).Count(&taskCount)
	config.DB.Model(&models.User{}).Where("subscription_status = ?", "active").Count(&activeSubscriptions)

	c.JSON(http.StatusOK, gin.H{
		"total_users":          userCount,
		"total_tasks":          taskCount,
		"active_subscriptions": activeSubscriptions,
	})
}

func UpdateUserStatus(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Verified           *bool   `json:"verified"`
		Role               *string `json:"role"`
		SubscriptionStatus *string `json:"subscription_status"`
		SubscriptionPlan   *string `json:"subscription_plan"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if input.Verified != nil {
		user.Verified = *input.Verified
	}
	if input.Role != nil {
		user.Role = *input.Role
	}
	if input.SubscriptionStatus != nil {
		user.SubscriptionStatus = *input.SubscriptionStatus
	}
	if input.SubscriptionPlan != nil {
		user.SubscriptionPlan = *input.SubscriptionPlan
	}

	config.DB.Save(&user)

	// Audit Log
	// log.Printf("Admin updated user %s status: verified=%v, role=%v, sub_status=%v, sub_plan=%v", id, user.Verified, user.Role, user.SubscriptionStatus, user.SubscriptionPlan)

	c.JSON(http.StatusOK, user)
}

func GetAllTransactions(c *gin.Context) {
	var transactions []models.Transaction
	if err := config.DB.Order("created_at desc").Find(&transactions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}
	c.JSON(http.StatusOK, transactions)
}

func AddUserCredits(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		Amount int `json:"amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Amount must be positive"})
		return
	}

	tx := config.DB.Begin()

	var user models.User
	if err := tx.First(&user, id).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.Credits += input.Amount
	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update credits"})
		return
	}

	// Log Transaction
	transaction := models.Transaction{
		UserID:      user.ID,
		Amount:      input.Amount,
		Type:        "admin_adjustment",
		Description: "Admin added credits",
	}
	if err := tx.Create(&transaction).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction record"})
		return
	}

	tx.Commit()

	// Audit Log
	log.Printf("Admin added %d credits to user %s", input.Amount, id)

	c.JSON(http.StatusOK, gin.H{"message": "Credits added successfully", "new_balance": user.Credits})
}
