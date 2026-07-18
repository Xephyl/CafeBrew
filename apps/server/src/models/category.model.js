import { slugify } from '@shared/core'
import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, trim: true },
    imageUrl: { type: String },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Generate slug from name
categorySchema.pre("save", function generateSlug() {
  if (this.isModified("name")) {
    this.slug = slugify(this.name)
  }
})

const Category = mongoose.model('Category', categorySchema)
export default Category
