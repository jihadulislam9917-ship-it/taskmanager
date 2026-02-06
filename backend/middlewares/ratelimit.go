package middlewares

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type clientLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type IPRateLimiter struct {
	ips map[string]*clientLimiter
	mu  *sync.RWMutex
	r   rate.Limit
	b   int
}

func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
	i := &IPRateLimiter{
		ips: make(map[string]*clientLimiter),
		mu:  &sync.RWMutex{},
		r:   r,
		b:   b,
	}

	// Cleanup routine
	go func() {
		for {
			time.Sleep(1 * time.Minute)
			i.mu.Lock()
			for ip, client := range i.ips {
				if time.Since(client.lastSeen) > 3*time.Minute {
					delete(i.ips, ip)
				}
			}
			i.mu.Unlock()
		}
	}()

	return i
}

func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
	i.mu.Lock()
	defer i.mu.Unlock()

	client, exists := i.ips[ip]
	if !exists {
		client = &clientLimiter{
			limiter: rate.NewLimiter(i.r, i.b),
		}
		i.ips[ip] = client
	}
	
	client.lastSeen = time.Now()
	return client.limiter
}

func RateLimitMiddleware() gin.HandlerFunc {
	// 5 requests per second with burst of 10
	limiter := NewIPRateLimiter(5, 10)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !limiter.GetLimiter(ip).Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "Too many requests. Please try again later.",
			})
			return
		}
		c.Next()
	}
}
