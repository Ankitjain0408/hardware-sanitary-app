# Database Structure Documentation

## Overview
Your application uses **MongoDB** with **Mongoose ODM**. The database is connected via `MONGO_URL` environment variable.

## Database Connection
- **File**: `backend/config/db.js`
- **Connection**: MongoDB connection is established on server startup
- **Session Storage**: Sessions are stored in MongoDB using `connect-mongo`

---

## Database Models

### 1. **User Model** (`backend/models/user.js`)
**Collection**: `users`

**Schema Fields**:
- `username` (String, required, unique, trimmed)
- `email` (String, required, unique, lowercase, trimmed)
- `password` (String, required) - Hashed with bcrypt
- `isAdmin` (Boolean, default: false)
- `isEmailVerified` (Boolean, default: false)
- `createdAt` (Date, auto-generated)
- `updatedAt` (Date, auto-generated)

**Purpose**: Stores user accounts (both regular users and admin)

---

### 2. **Brand Model** (`backend/models/Brand.js`)
**Collection**: `brands`

**Schema Fields**:
- `name` (String, required, unique, trimmed)
- `slug` (String, required, unique, lowercase)
- `imageUrl` (String, optional) - URL to brand logo/image
- `cloudinaryPublicId` (String, optional) - For Cloudinary image management
- `isActive` (Boolean, default: true)
- `createdAt` (Date, auto-generated)
- `updatedAt` (Date, auto-generated)

**Purpose**: Stores product brands (e.g., "Alistocera", "Hindware", etc.)

---

### 3. **ProductCategory Model** (`backend/models/ProductCategory.js`)
**Collection**: `productcategories`

**Schema Fields**:
- `brandId` (ObjectId, required, ref: "Brand") - **Foreign Key** to Brand
- `name` (String, required, trimmed)
- `slug` (String, required, lowercase)
- `isActive` (Boolean, default: true)
- `createdAt` (Date, auto-generated)
- `updatedAt` (Date, auto-generated)

**Indexes**:
- Compound unique index on `(brandId, name)` - Ensures unique category names per brand

**Purpose**: Stores product categories within each brand (e.g., "Taps", "Pipes", "Faucets")

**Relationship**: 
- **Many-to-One** with Brand (many categories belong to one brand)

---

### 4. **Product Model** (`backend/models/Product.js`)
**Collection**: `products`

**Schema Fields**:
- `brandId` (ObjectId, required, ref: "Brand") - **Foreign Key** to Brand
- `categoryId` (ObjectId, required, ref: "ProductCategory") - **Foreign Key** to ProductCategory
- `name` (String, required, trimmed)
- `description` (String, optional, trimmed)
- `price` (Number, required, min: 0)
- `stock` (Number, required, min: 0, default: 0)
- `isActive` (Boolean, default: true)
- `createdAt` (Date, auto-generated)
- `updatedAt` (Date, auto-generated)

**Purpose**: Stores individual products

**Relationships**: 
- **Many-to-One** with Brand (many products belong to one brand)
- **Many-to-One** with ProductCategory (many products belong to one category)

---

### 5. **ProductImage Model** (`backend/models/ProductImage.js`)
**Collection**: `productimages`

**Schema Fields**:
- `productId` (ObjectId, required, ref: "Product") - **Foreign Key** to Product
- `imageUrl` (String, required) - URL to product image
- `cloudinaryPublicId` (String, optional) - For Cloudinary image management
- `isPrimary` (Boolean, default: false) - Marks the primary/featured image
- `createdAt` (Date, auto-generated)
- `updatedAt` (Date, auto-generated)

**Purpose**: Stores multiple images for each product

**Relationship**: 
- **Many-to-One** with Product (many images belong to one product)

---

### 6. **Experience Model** (`backend/models/Experience.js`)
**Collection**: `experiences`

**Schema Fields**:
- `userId` (ObjectId, required, ref: "User") - **Foreign Key** to User
- `username` (String, required, trimmed)
- `rating` (Number, optional, min: 1, max: 5)
- `message` (String, required, trimmed, maxlength: 1000)
- `createdAt` (Date, auto-generated)
- `updatedAt` (Date, auto-generated)

**Purpose**: Stores user reviews/experiences/testimonials

**Relationship**: 
- **Many-to-One** with User (many experiences belong to one user)

---

### 7. **OTP Model** (`backend/models/OTP.js`)
**Collection**: `otps`

**Schema Fields**:
- `email` (String, required, lowercase, trimmed)
- `otp` (String, required)
- `expiresAt` (Date, required, default: 10 minutes from creation)
- `isUsed` (Boolean, default: false)
- `createdAt` (Date, auto-generated)
- `updatedAt` (Date, auto-generated)

**Indexes**:
- Compound index on `(email, expiresAt)` for faster lookups

**Purpose**: Stores OTP codes for password reset and email verification

**Note**: OTPs expire after 10 minutes. Expiration is handled manually (no TTL index)

---

## Database Relationships Diagram

```
User (Independent)
  └─ No relationships

Brand (Independent)
  ├─ Has many → ProductCategory
  └─ Has many → Product

ProductCategory
  ├─ Belongs to → Brand (brandId)
  └─ Has many → Product

Product
  ├─ Belongs to → Brand (brandId)
  ├─ Belongs to → ProductCategory (categoryId)
  └─ Has many → ProductImage

ProductImage
  └─ Belongs to → Product (productId)

Experience
  └─ Belongs to → User (userId)

OTP (Independent)
  └─ No relationships
```

---

## Data Flow

### Product Hierarchy:
1. **Brand** → Top level (e.g., "Alistocera")
2. **ProductCategory** → Second level, belongs to Brand (e.g., "Taps" under "Alistocera")
3. **Product** → Third level, belongs to both Brand and Category (e.g., "Alistocera Tap Model X")
4. **ProductImage** → Multiple images per Product

### Example Data Structure:
```
Brand: "Alistocera"
  └─ Category: "Taps"
      └─ Product: "Alistocera Premium Tap"
          ├─ Image 1 (primary)
          ├─ Image 2
          └─ Image 3
```

---

## Key Features

### 1. **Soft Delete Pattern**
- All main models use `isActive` flag instead of hard deletion
- Allows reactivation of deactivated items

### 2. **Timestamps**
- All models automatically track `createdAt` and `updatedAt`

### 3. **Image Management**
- Supports Cloudinary integration via `cloudinaryPublicId`
- Falls back to direct `imageUrl` if Cloudinary not configured

### 4. **Search Functionality**
- Products can be searched by:
  - Product name
  - Product description
  - Brand name (via brandId lookup)
  - Category name (via categoryId lookup)

### 5. **Session Storage**
- User sessions stored in MongoDB via `connect-mongo`
- Guest sessions use `isGuest` flag in session (not in database)

---

## Indexes

### Automatic Indexes:
- `users`: `username` (unique), `email` (unique)
- `brands`: `name` (unique), `slug` (unique)
- `productcategories`: `(brandId, name)` (compound unique)

### Recommended Indexes (for performance):
- `products.brandId` - For filtering by brand
- `products.categoryId` - For filtering by category
- `products.isActive` - For filtering active products
- `productimages.productId` - For fetching product images
- `productimages.isPrimary` - For finding primary images

---

## Environment Variables Required

```env
MONGO_URL=mongodb://localhost:27017/your-database-name
# OR for MongoDB Atlas:
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

---

## Common Queries

### Get all active products with brand and category:
```javascript
Product.find({ isActive: true })
  .populate('brandId', 'name imageUrl')
  .populate('categoryId', 'name')
```

### Get products by brand:
```javascript
Product.find({ brandId: brandId, isActive: true })
```

### Get products by category:
```javascript
Product.find({ categoryId: categoryId, isActive: true })
```

### Search products:
```javascript
Product.find({
  $or: [
    { name: regex },
    { description: regex },
    { brandId: { $in: matchingBrandIds } },
    { categoryId: { $in: matchingCategoryIds } }
  ]
})
```

---

## Notes

- All foreign key relationships use Mongoose `populate()` for joining
- Images are stored separately in `ProductImage` collection for flexibility
- Primary images are marked with `isPrimary: true` flag
- Guest users don't have database entries (session-only)

