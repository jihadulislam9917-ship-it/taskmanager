package handlers

import (
	"net/http"
	"taskmanager-backend/backend/config"
	"taskmanager-backend/backend/models"
	"time"

	"github.com/gin-gonic/gin"
)

type CreateTaskInput struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description"`
	Status      string `json:"status"`
	Priority    string `json:"priority"`
	DueDate     string `json:"due_date"`
	Assignee    string `json:"assignee"`
}

func parseDate(dateStr string) (*time.Time, error) {
	if dateStr == "" {
		return nil, nil
	}
	// Try parsing YYYY-MM-DD
	parsed, err := time.Parse("2006-01-02", dateStr)
	if err == nil {
		return &parsed, nil
	}
	// Try parsing RFC3339
	parsed, err = time.Parse(time.RFC3339, dateStr)
	if err == nil {
		return &parsed, nil
	}
	return nil, err
}

func CreateTask(c *gin.Context) {
	var input CreateTaskInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dueDate, err := parseDate(input.DueDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Expected YYYY-MM-DD or RFC3339"})
		return
	}

	task := models.Task{
		Title:       input.Title,
		Description: input.Description,
		Status:      input.Status,
		Priority:    input.Priority,
		DueDate:     dueDate,
		Assignee:    input.Assignee,
	}

	// Set defaults if empty
	if task.Status == "" {
		task.Status = "pending"
	}
	if task.Priority == "" {
		task.Priority = "medium"
	}

	// Assign user ID
	userID, exists := c.Get("user_id")
	if exists {
		task.UserID = userID.(uint)
	}

	// Start DB transaction
	tx := config.DB.Begin()

	// Check User Credits
	var user models.User
	if err := tx.First(&user, task.UserID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user"})
		return
	}

	if user.Credits < 1 {
		tx.Rollback()
		c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient credits"})
		return
	}

	// Deduct Credit
	user.Credits -= 1
	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update credits"})
		return
	}

	// Create Task
	if err := tx.Create(&task).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create task"})
		return
	}

	// Log Transaction
	transaction := models.Transaction{
		UserID:      user.ID,
		Amount:      -1,
		Type:        "usage",
		Description: "Created task: " + task.Title,
	}
	if err := tx.Create(&transaction).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log transaction"})
		return
	}

	tx.Commit()

	c.JSON(http.StatusCreated, task)
}

func GetTasks(c *gin.Context) {
	userID, exists := c.Get("user_id")
	var tasks []models.Task

	query := config.DB
	if exists {
		query = query.Where("user_id = ?", userID)
	}

	if err := query.Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tasks"})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

func GetTask(c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("user_id")

	var task models.Task
	query := config.DB.Where("id = ?", id)
	if exists {
		query = query.Where("user_id = ?", userID)
	}

	if err := query.First(&task).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	c.JSON(http.StatusOK, task)
}

func UpdateTask(c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("user_id")

	var task models.Task
	query := config.DB.Where("id = ?", id)
	if exists {
		query = query.Where("user_id = ?", userID)
	}

	if err := query.First(&task).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	var input CreateTaskInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dueDate, err := parseDate(input.DueDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Expected YYYY-MM-DD or RFC3339"})
		return
	}

	// Update fields
	task.Title = input.Title
	task.Description = input.Description
	task.Status = input.Status
	task.Priority = input.Priority
	task.DueDate = dueDate
	task.Assignee = input.Assignee

	if err := config.DB.Save(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update task"})
		return
	}

	c.JSON(http.StatusOK, task)
}

func DeleteTask(c *gin.Context) {
	id := c.Param("id")
	userID, exists := c.Get("user_id")

	var task models.Task
	query := config.DB.Where("id = ?", id)
	if exists {
		query = query.Where("user_id = ?", userID)
	}

	if err := query.First(&task).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	if err := config.DB.Delete(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete task"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}
