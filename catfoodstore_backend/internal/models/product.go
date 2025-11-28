package models

import "time"

type Product struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Weight      string    `json:"weight"`
	AgeGroup    string    `json:"age_group"`
	BreedType   []string  `json:"breed_type"`
	Category    string    `json:"category"`
	Stock 		int `json:"stock"`
	ImageURL    string    `json:"image_url"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

