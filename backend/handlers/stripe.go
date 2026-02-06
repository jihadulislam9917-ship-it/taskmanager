package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"taskmanager-backend/backend/config"
	"taskmanager-backend/backend/models"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v74"
	"github.com/stripe/stripe-go/v74/paymentintent"
	"github.com/stripe/stripe-go/v74/webhook"
)

type PurchaseCreditsInput struct {
	Credits int `json:"credits" binding:"required"` // Number of credits to buy
}

func CreatePaymentIntent(c *gin.Context) {
	var input PurchaseCreditsInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")

	// Pricing logic: 10 credits = $5.00 ($0.50 per credit)
	// Amount is in cents
	amount := int64(input.Credits * 50)

	// Minimum amount for Stripe is usually $0.50 (50 cents)
	if amount < 50 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Minimum purchase is 1 credit"})
		return
	}

	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(amount),
		Currency: stripe.String(string(stripe.CurrencyUSD)),
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
	}
	params.AddMetadata("user_id", fmt.Sprintf("%d", userID.(uint)))
	params.AddMetadata("credits", fmt.Sprintf("%d", input.Credits))

	pi, err := paymentintent.New(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"clientSecret": pi.ClientSecret,
	})
}

func HandleStripeWebhook(c *gin.Context) {
	const MaxBodyBytes = int64(65536)
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, MaxBodyBytes)
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Error reading request body"})
		return
	}

	endpointSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	event, err := webhook.ConstructEventWithOptions(payload, c.GetHeader("Stripe-Signature"), endpointSecret, webhook.ConstructEventOptions{
		IgnoreAPIVersionMismatch: true,
	})

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error verifying webhook signature"})
		return
	}

	switch event.Type {
	case "payment_intent.succeeded":
		var paymentIntent stripe.PaymentIntent
		err := json.Unmarshal(event.Data.Raw, &paymentIntent)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Error parsing webhook JSON"})
			return
		}

		handlePaymentSuccess(paymentIntent)
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

func handlePaymentSuccess(pi stripe.PaymentIntent) {
	userIDStr := pi.Metadata["user_id"]
	creditsStr := pi.Metadata["credits"]

	if userIDStr == "" || creditsStr == "" {
		return // Missing metadata
	}

	userID, _ := strconv.Atoi(userIDStr)
	credits, _ := strconv.Atoi(creditsStr)

	tx := config.DB.Begin()

	var user models.User
	if err := tx.First(&user, userID).Error; err != nil {
		tx.Rollback()
		return
	}

	user.Credits += credits
	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		return
	}

	// Log Transaction
	transaction := models.Transaction{
		UserID:      user.ID,
		Amount:      credits,
		Type:        "purchase",
		Description: fmt.Sprintf("Purchased %d credits via Stripe", credits),
	}
	if err := tx.Create(&transaction).Error; err != nil {
		tx.Rollback()
		return
	}

	tx.Commit()
}
