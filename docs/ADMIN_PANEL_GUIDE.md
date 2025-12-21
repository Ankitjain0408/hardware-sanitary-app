# Admin Panel Guide

## Overview
Complete Admin Panel for managing Brands, Categories, Products, and Product Images for the SRI KRISHNA Hardware & Sanitary e-commerce website.

## Database Collections

### 1. Brand
- `_id`: ObjectId
- `name`: String (unique, required)
- `slug`: String (auto-generated, unique)
- `isActive`: Boolean (default: true)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

### 2. ProductCategory
- `_id`: ObjectId
- `brandId`: ObjectId (ref: Brand, required)
- `name`: String (required)
- `slug`: String (auto-generated)
- `isActive`: Boolean (default: true)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

### 3. Product
- `_id`: ObjectId
- `brandId`: ObjectId (ref: Brand, required)
- `categoryId`: ObjectId (ref: ProductCategory, required)
- `name`: String (required)
- `description`: String
- `price`: Number (required, min: 0)
- `stock`: Number (required, min: 0, default: 0)
- `isActive`: Boolean (default: true)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

### 4. ProductImage
- `_id`: ObjectId
- `productId`: ObjectId (ref: Product, required)
- `imageUrl`: String (required)
- `isPrimary`: Boolean (default: false)
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

## Backend API Endpoints

### Brand APIs
- `POST /api/admin/brands` - Create brand
  - Body: `{ name: string, isActive?: boolean }`
- `GET /api/admin/brands` - Get all brands
  - Query: `?isActive=true/false` (optional)
- `PUT /api/admin/brands/:id` - Update brand
  - Body: `{ name?: string, isActive?: boolean }`
- `DELETE /api/admin/brands/:id` - Delete brand (soft delete)

### Category APIs
- `POST /api/admin/categories` - Create category
  - Body: `{ brandId: string, name: string, isActive?: boolean }`
- `GET /api/admin/categories` - Get all categories
  - Query: `?brandId=xxx&isActive=true/false` (optional)
- `PUT /api/admin/categories/:id` - Update category
  - Body: `{ name?: string, isActive?: boolean }`
- `DELETE /api/admin/categories/:id` - Delete category (soft delete)

### Product APIs
- `POST /api/admin/products` - Create product
  - Body: `{ brandId: string, categoryId: string, name: string, description?: string, price: number, stock?: number, isActive?: boolean }`
- `GET /api/admin/products` - Get all products (with populated brand & category)
  - Query: `?brandId=xxx&categoryId=xxx&isActive=true/false` (optional)
- `PUT /api/admin/products/:id` - Update product
  - Body: `{ brandId?: string, categoryId?: string, name?: string, description?: string, price?: number, stock?: number, isActive?: boolean }`
- `DELETE /api/admin/products/:id` - Delete product (soft delete)

### Product Image APIs
- `POST /api/admin/products/:productId/images` - Upload product image
  - Body: `{ imageUrl: string, isPrimary?: boolean }`
- `GET /api/admin/products/:productId/images` - Get all images for a product
- `PUT /api/admin/products/:productId/images/:imageId/primary` - Set primary image
- `DELETE /api/admin/products/:productId/images/:imageId` - Delete image

## Frontend Admin Pages

### Access
1. Login to the application
2. Click "MENU" in the navbar
3. Click "Admin Panel" (visible only when logged in)
4. Or navigate directly to `/admin`

### Admin Dashboard (`/admin`)
- Overview cards for Brands, Categories, Products, and Images
- Quick navigation to all admin sections

### Brand Management (`/admin/brands`)
- View all brands in a table
- Add new brand
- Edit existing brand
- Delete brand (soft delete)
- Filter by active/inactive status

### Category Management (`/admin/categories`)
- View all categories in a table
- Filter categories by brand
- Add new category (requires selecting a brand)
- Edit existing category
- Delete category (soft delete)

### Product Management (`/admin/products`)
- View all products in a table with brand and category info
- Filter products by brand and/or category
- Add new product (requires brand and category selection)
- Edit existing product
- Delete product (soft delete)
- Manage product images (click "Manage Product Images" button)

### Product Image Management
- Upload images by providing image URL
- Set primary image
- Preview all images
- Delete images
- Note: Enter Product ID to manage images for a specific product

## Features

### Dynamic Dropdowns
- Category dropdown depends on selected brand
- When brand changes, category resets and shows only categories for that brand

### Soft Delete
- All delete operations set `isActive: false` instead of removing records
- Allows data recovery and maintains referential integrity

### Validation
- Frontend and backend validation
- Required fields enforced
- Price and stock must be >= 0
- Category must belong to selected brand

### Image Management
- Multiple images per product
- One primary image per product
- Image preview with error handling
- Easy primary image switching

## Project Structure

```
backend/
├── models/
│   ├── Brand.js
│   ├── ProductCategory.js
│   ├── Product.js
│   └── ProductImage.js
├── controllers/
│   ├── brandController.js
│   ├── categoryController.js
│   ├── productController.js
│   └── imageController.js
├── routes/
│   ├── brandRoutes.js
│   ├── categoryRoutes.js
│   ├── productRoutes.js
│   └── imageRoutes.js
└── server.js

frontend/
├── src/
│   ├── pages/admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── BrandPage.jsx
│   │   ├── CategoryPage.jsx
│   │   └── ProductPage.jsx
│   ├── components/admin/
│   │   ├── AdminNavbar.jsx
│   │   ├── BrandForm.jsx
│   │   ├── BrandTable.jsx
│   │   ├── CategoryForm.jsx
│   │   ├── CategoryTable.jsx
│   │   ├── ProductForm.jsx
│   │   ├── ProductTable.jsx
│   │   └── ProductImageManager.jsx
│   └── App.jsx
```

## Usage Example

### Creating a Brand
1. Go to `/admin/brands`
2. Click "+ Add Brand"
3. Enter brand name
4. Click "Create"

### Creating a Category
1. Go to `/admin/categories`
2. Click "+ Add Category"
3. Select a brand from dropdown
4. Enter category name
5. Click "Create"

### Creating a Product
1. Go to `/admin/products`
2. Click "+ Add Product"
3. Select brand (required)
4. Select category (depends on brand)
5. Enter product details (name, price, stock, etc.)
6. Click "Create"

### Managing Product Images
1. Go to `/admin/products`
2. Click "Manage Product Images"
3. Enter Product ID
4. Enter image URL and click "Upload Image"
5. Set primary image by clicking "Set Primary"
6. Delete images as needed

## Notes

- All API calls require authentication (session-based)
- CORS is configured for localhost on any port
- All timestamps are automatically managed by Mongoose
- Slug generation is automatic based on name
- Image URLs should be publicly accessible

