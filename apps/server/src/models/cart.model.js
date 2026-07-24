import mongoose from "mongoose"

// Cart item schema
const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, min: 1, validate: Number.isInteger },
    unitPrice: { type: Number, required: true, min: 0, validate: Number.isInteger },
  },
  { _id: true }
)

const cartSchema = new mongoose.Schema(
  {
    // Unique per user - only one active cart per user
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

// Virtual totalAmount – computed from items array
cartSchema.virtual("totalAmount").get(function computeTotalAmount() {
  return this.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
})

const Cart = mongoose.model("Cart", cartSchema)

export default Cart