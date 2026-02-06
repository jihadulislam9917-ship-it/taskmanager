package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"taskmanager-backend/backend/config"
	"taskmanager-backend/backend/models"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func setupTestDB() {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	db.AutoMigrate(&models.User{}, &models.Task{})
	config.DB = db

	// Seed user
	user := models.User{
		Name:     "Test User",
		Email:    "test@example.com",
		Password: "hashedpassword",
	}
	user.ID = 1
	db.Create(&user)
}

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()

	// Mock Auth Middleware
	mockAuth := func(c *gin.Context) {
		c.Set("user_id", uint(1))
		c.Next()
	}

	api := r.Group("/api")
	api.Use(mockAuth)
	{
		api.POST("/tasks", CreateTask)
		api.GET("/tasks", GetTasks)
		api.GET("/tasks/:id", GetTask)
		api.PUT("/tasks/:id", UpdateTask)
		api.DELETE("/tasks/:id", DeleteTask)
	}
	return r
}

func TestCreateTask(t *testing.T) {
	setupTestDB()
	r := setupRouter()

	task := models.Task{
		Title:       "Test Task",
		Description: "Test Description",
		Status:      "pending",
		Priority:    "medium",
	}
	jsonValue, _ := json.Marshal(task)

	req, _ := http.NewRequest("POST", "/api/tasks", bytes.NewBuffer(jsonValue))
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var createdTask models.Task
	json.Unmarshal(w.Body.Bytes(), &createdTask)
	assert.Equal(t, "Test Task", createdTask.Title)
}

func TestGetTasks(t *testing.T) {
	setupTestDB()
	r := setupRouter()

	// Seed data
	config.DB.Create(&models.Task{Title: "Task 1", Status: "pending", UserID: 1})
	config.DB.Create(&models.Task{Title: "Task 2", Status: "completed", UserID: 1})

	req, _ := http.NewRequest("GET", "/api/tasks", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var tasks []models.Task
	json.Unmarshal(w.Body.Bytes(), &tasks)
	assert.Equal(t, 2, len(tasks))
}
