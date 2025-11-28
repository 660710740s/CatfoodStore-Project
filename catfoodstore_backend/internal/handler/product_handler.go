package handler

import (
    "strconv"

    "catfoodstore_backend/internal/models"
    "catfoodstore_backend/internal/service"

    "github.com/gin-gonic/gin"
)

type ProductHandler struct {
    svc service.ProductService
}

func NewProductHandler(s service.ProductService) *ProductHandler {
    return &ProductHandler{svc: s}
}

func (h *ProductHandler) RegisterRoutes(r *gin.Engine) {
    api := r.Group("/api/products")
    {
        api.GET("", h.GetAll)
        api.GET("/:id", h.GetByID)
        api.POST("", h.Create)
        api.PUT("/:id", h.Update)
        api.DELETE("/:id", h.Delete)
    }
}

//
// =============================
// GET ALL
// =============================
func (h *ProductHandler) GetAll(c *gin.Context) {
    list, err := h.svc.GetAll(c.Request.Context())
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }
    c.JSON(200, list)
}

//
// =============================
// GET BY ID
// =============================
func (h *ProductHandler) GetByID(c *gin.Context) {
    id, err := parseID(c)
    if err != nil {
        return
    }

    p, err := h.svc.GetByID(c.Request.Context(), id)
    if err == service.ErrProductNotFound {
        c.JSON(404, gin.H{"error": "product not found"})
        return
    }
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    c.JSON(200, p)
}

//
// =============================
// CREATE
// =============================
// JSON ตัวอย่างที่ต้องรองรับ:
// {
//   "name": "...",
//   "description": "...",
//   "price": 450.0,
//   "weight": "1kg",
//   "age_group": "kitten",
//   "breed_type": ["all"],
//   "category": "dry",
//   "image_url": "...",
//   "stock": 20     ←⭐ ตรงนี้เพิ่มเข้า API
// }
func (h *ProductHandler) Create(c *gin.Context) {
    var p models.Product
    if err := c.ShouldBindJSON(&p); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    id, err := h.svc.Create(c.Request.Context(), &p)
    if err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    c.JSON(201, gin.H{"id": id})
}

//
// =============================
// UPDATE
// =============================
func (h *ProductHandler) Update(c *gin.Context) {
    id, err := parseID(c)
    if err != nil {
        return
    }

    var p models.Product
    if err := c.ShouldBindJSON(&p); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    if err := h.svc.Update(c.Request.Context(), id, &p); err != nil {
        if err == service.ErrProductNotFound {
            c.JSON(404, gin.H{"error": "product not found"})
            return
        }
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    c.JSON(200, gin.H{"message": "updated"})
}

//
// =============================
// DELETE
// =============================
func (h *ProductHandler) Delete(c *gin.Context) {
    id, err := parseID(c)
    if err != nil {
        return
    }

    if err := h.svc.Delete(c.Request.Context(), id); err != nil {
        if err == service.ErrProductNotFound {
            c.JSON(404, gin.H{"error": "product not found"})
            return
        }
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    c.JSON(200, gin.H{"message": "deleted"})
}

//
// =============================
// HELPER: Parse ID
// =============================
func parseID(c *gin.Context) (int64, error) {
    idStr := c.Param("id")
    id, err := strconv.ParseInt(idStr, 10, 64)
    if err != nil {
        c.JSON(400, gin.H{"error": "invalid id"})
        return 0, err
    }
    return id, nil
}
