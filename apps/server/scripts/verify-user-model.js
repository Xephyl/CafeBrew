// This script is used to verify the User model
import User from "../user.model.js"

// Create a test user
const u1 = new User({
  email: "test@cafe.com",
  password: "Password1",
  firstName: "Ana",
  lastName: "Cruz",
})
await u1.save()
console.assert(u1.password !== "Password1", "password must be hashed, not plain")
console.assert(await u1.comparePassword("Password1") === true, "correct password should match")
console.assert(await u1.comparePassword("wrong") === false, "wrong password should not match")

// toSafeObject strips sensitive fields
const safe = u1.toSafeObject()
console.assert(!("password" in safe) && !("refreshTokenHash" in safe), "safe object must strip sensitive fields")

// Test duplicate email
try {
  await new User({ email: "test@cafe.com", password: "Password1", firstName: "B", lastName: "C" }).save()
  console.assert(false, "duplicate email should have thrown")
} catch (err) {
  console.assert(err.code === 11000, "duplicate email must be a Mongo duplicate-key error (11000)")
}

// Invalid role
try {
  await new User({ email: "x@cafe.com", password: "Password1", firstName: "X", lastName: "Y", role: "SUPERADMIN" }).save()
  console.assert(false, "invalid role should have thrown a validation error")
} catch (err) {
  console.assert(err.name === "ValidationError", "invalid role must fail schema validation")
}