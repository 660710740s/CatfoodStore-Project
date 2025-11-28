package repository

import (
	"context"
	"database/sql"
	"fmt"

	"catfoodstore_backend/internal/models"
	"github.com/lib/pq"
)

type ProductRepository interface {
	FindAll(ctx context.Context) ([]*models.Product, error)
	FindByID(ctx context.Context, id int64) (*models.Product, error)
	Create(ctx context.Context, p *models.Product) (int64, error)
	Update(ctx context.Context, p *models.Product) error
	Delete(ctx context.Context, id int64) error
}

type productRepo struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) ProductRepository {
	return &productRepo{db: db}
}

//
// ==============================
//  FIND ALL
// ==============================
func (r *productRepo) FindAll(ctx context.Context) ([]*models.Product, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT id, name, description, price, weight,
               age_group, breed_type, category, stock, image_url,
               created_at, updated_at
        FROM products ORDER BY id ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*models.Product

	for rows.Next() {
		var p models.Product
		var breeds pq.StringArray

		if err := rows.Scan(
			&p.ID, &p.Name, &p.Description, &p.Price, &p.Weight,
			&p.AgeGroup, &breeds, &p.Category, &p.Stock, &p.ImageURL,
			&p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, err
		}

		p.BreedType = []string(breeds)
		list = append(list, &p)
	}

	return list, rows.Err()
}

//
// ==============================
//  FIND BY ID
// ==============================
func (r *productRepo) FindByID(ctx context.Context, id int64) (*models.Product, error) {
	row := r.db.QueryRowContext(ctx, `
        SELECT id, name, description, price, weight,
               age_group, breed_type, category, stock, image_url,
               created_at, updated_at
        FROM products WHERE id = $1`, id)

	var p models.Product
	var breeds pq.StringArray

	if err := row.Scan(
		&p.ID, &p.Name, &p.Description, &p.Price, &p.Weight,
		&p.AgeGroup, &breeds, &p.Category, &p.Stock, &p.ImageURL,
		&p.CreatedAt, &p.UpdatedAt,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	p.BreedType = []string(breeds)
	return &p, nil
}

//
// ==============================
//  CREATE
// ==============================
func (r *productRepo) Create(ctx context.Context, p *models.Product) (int64, error) {
	var id int64
	breeds := pq.StringArray(p.BreedType)

	err := r.db.QueryRowContext(ctx, `
        INSERT INTO products
        (name, description, price, weight, age_group,
         breed_type, category, stock, image_url)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING id`,
		p.Name, p.Description, p.Price, p.Weight,
		p.AgeGroup, breeds, p.Category, p.Stock, p.ImageURL,
	).Scan(&id)

	if err != nil {
		return 0, fmt.Errorf("insert product: %w", err)
	}
	return id, nil
}

//
// ==============================
//  UPDATE
// ==============================
func (r *productRepo) Update(ctx context.Context, p *models.Product) error {
	breeds := pq.StringArray(p.BreedType)

	res, err := r.db.ExecContext(ctx, `
        UPDATE products SET
            name=$1, description=$2, price=$3, weight=$4,
            age_group=$5, breed_type=$6, category=$7,
            stock=$8, image_url=$9,
            updated_at=NOW()
        WHERE id=$10`,
		p.Name, p.Description, p.Price, p.Weight,
		p.AgeGroup, breeds, p.Category,
		p.Stock, p.ImageURL, p.ID,
	)

	if err != nil {
		return err
	}

	if affected, _ := res.RowsAffected(); affected == 0 {
		return sql.ErrNoRows
	}

	return nil
}

//
// ==============================
//   DELETE
// ==============================
func (r *productRepo) Delete(ctx context.Context, id int64) error {
	res, err := r.db.ExecContext(ctx, `DELETE FROM products WHERE id=$1`, id)
	if err != nil {
		return err
	}

	if affected, _ := res.RowsAffected(); affected == 0 {
		return sql.ErrNoRows
	}

	return nil
}
