// apps/server/src/models/__tests__/user.model.test.js
// Run once mongodb-memory-server is in place (Task 1-12) — shown here for
// early manual verification via a standalone script in the meantime.
import User from "../user.model.js"

// Happy path: password is hashed, comparePassword works
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

// Duplicate email
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