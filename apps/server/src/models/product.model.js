import { ProductStatus, slugify } from '@shared/core'
import mongoose from 'mongoose'

// Product variant schema
const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // priceModifier in PHP centavos – e.g., "Large" = +2000 (₱20.00)
    priceModifier: { type: Number, required: true, default: 0, validate: Number.isInteger },
    stock: { type: Number, required: true, default: 0, min: 0, validate: Number.isInteger },
  },
  { _id: true }
)

// Product schema
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, trim: true },
    // Price in PHP centavos
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'price must be an integer (PHP centavos), not a float',
      },
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    variants: { type: [variantSchema], default: [] },
    imageUrls: { type: [String], default: [] },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.ACTIVE,
    },
  },
  { timestamps: true }
)

// Generate slug before saving
productSchema.pre('save', function generateSlug() {
  if (this.isModified('name')) {
    this.slug = slugify(this.name)
  }
})

// Text index for search
productSchema.index({ name: 'text', description: 'text' })

// Compound index for category + status queries
productSchema.index({ category: 1, status: 1 })

const Product = mongoose.model('Product', productSchema)
export default Product
