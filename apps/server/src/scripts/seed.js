import { UserRole, ProductStatus } from "@shared/core"
import mongoose from "mongoose"

import { connectDB } from "../config/database.js"
import { config } from "../config/index.js"
import Category from "../models/category.model.js"
import Product from "../models/product.model.js"
import User from "../models/user.model.js"

if (config.NODE_ENV === "production") {
  console.error("Refusing to run seed script in production (NODE_ENV=production).")
  process.exit(1)
}

const ADMIN_EMAIL = "admin@cafe-ecommerce.local"
const ADMIN_PASSWORD = "Admin1234"

// Customer definitions
const CUSTOMERS = [
  { email: "customer1@cafe-ecommerce.local", firstName: "Ana", lastName: "Reyes" },
  { email: "customer2@cafe-ecommerce.local", firstName: "Ben", lastName: "Santos" },
  { email: "customer3@cafe-ecommerce.local", firstName: "Cara", lastName: "Cruz" },
]
const CUSTOMER_PASSWORD = "Customer1234"

const CATEGORY_DEFS = [
  { name: "Hot Drinks", displayOrder: 1 },
  { name: "Cold Drinks", displayOrder: 2 },
  { name: "Pastries", displayOrder: 3 },
  { name: "Merchandise", displayOrder: 4 },
]

// Product definitions with prices in COP (integers)
const PRODUCT_DEFS = {
  "Hot Drinks": [
    { name: "Cafe Americano", price: 12000 },
    { name: "Caramel Macchiato", price: 15000 },
    { name: "Spanish Latte", price: 14000 },
  ],
  "Cold Drinks": [
    { name: "Iced Caramel Macchiato", price: 16000 },
    { name: "Cold Brew", price: 13000 },
    { name: "Strawberry Refresher", price: 14500 },
  ],
  Pastries: [
    { name: "Butter Croissant", price: 9000 },
    { name: "Pain au Chocolat", price: 9500 },
    { name: "Blueberry Muffin", price: 8500 },
  ],
  Merchandise: [
    { name: "Ceramic Mug", price: 25000 },
    { name: "Tote Bag", price: 30000 },
    { name: "Whole Bean Coffee 250g", price: 45000 },
  ],
}

async function seed() {
  await connectDB(config.MONGODB_URI)

  console.log("Clearing existing users, categories, products...")
  await User.deleteMany({})
  await Category.deleteMany({})
  await Product.deleteMany({})

  console.log("Seeding admin user...")
  await User.create({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    firstName: "Admin",
    lastName: "User",
    role: UserRole.ADMIN,
  })

  console.log("Seeding customer users...")
  for (const customer of CUSTOMERS) {
    await User.create({
      ...customer,
      password: CUSTOMER_PASSWORD,
      role: UserRole.CUSTOMER,
    })
  }

  console.log("Seeding categories...")
  const categoryDocs = {}
  for (const def of CATEGORY_DEFS) {
    categoryDocs[def.name] = await Category.create({
      name: def.name,
      displayOrder: def.displayOrder,
    })
  }

  console.log("Seeding products...")
  for (const [categoryName, products] of Object.entries(PRODUCT_DEFS)) {
    const category = categoryDocs[categoryName]
    for (const productDef of products) {
      await Product.create({
        name: productDef.name,
        description: `${productDef.name} from our ${categoryName.toLowerCase()} menu.`,
        price: productDef.price,
        category: category._id,
        status: ProductStatus.ACTIVE,
        imageUrls: [],
        variants: [
          { name: "Small", priceModifier: 0, stock: 50 },
          { name: "Large", priceModifier: 2000, stock: 50 },
        ],
      })
    }
  }

  console.log("Seed complete.")
  console.log("Admin credentials:")
  console.log(`  email:    ${ADMIN_EMAIL}`)
  console.log(`  password: ${ADMIN_PASSWORD}`)

  await mongoose.connection.close()
  console.log("Disconnected.")
}

try {
  await seed()
} catch (err) {
  console.error("Seed failed:", err)
  process.exit(1)
}