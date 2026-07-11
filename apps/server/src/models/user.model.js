import { UserRole } from "@shared"
import bcrypt from "bcryptjs"
import mongoose from "mongoose"

const SALT_ROUNDS = 10

// Address schema for embedded addresses
const addressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
)

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't return password by default
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
    isActive: { type: Boolean, default: true },
    addresses: { type: [addressSchema], default: [] },
    refreshTokenHash: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
)

// Hash password before saving
userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next()

  try {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS)
    next()
  } catch (err) {
    next(err)
  }
})

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  // Check if password exists
  if (!this.password) return false
  return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject()
  delete obj.password
  delete obj.refreshTokenHash
  return obj
}

userSchema.statics.findByEmail = function findByEmail(email) {
  if (!email) throw new Error("email is required")
  return this.findOne({ email: email.toLowerCase().trim() }).select("+password")
}

const User = mongoose.model("User", userSchema)

export default User