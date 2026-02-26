import mongoose from "mongoose"
import { randomBytes, pbkdf2Sync } from "crypto"

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error("MONGODB_URI is not set")
  process.exit(1)
}

const demoPassword = process.env.SEED_DEMO_PASSWORD || "Demo1234!"
const adminPassword = process.env.SEED_SUPERADMIN_PASSWORD || "Admin1234!"
const adminEmail = process.env.SEED_SUPERADMIN_EMAIL || "info@clinvetia.com"

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex")
  const hash = pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["demo", "superadmin"], required: true },
  passwordHash: { type: String, required: true },
  status: { type: String, enum: ["active", "disabled"], default: "active" },
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model("User", userSchema)

async function run() {
  await mongoose.connect(uri)

  const demoEmail = "demo@clinvetia.com"
  await User.updateOne(
    { email: demoEmail },
    {
      $set: {
        email: demoEmail,
        name: "Demo",
        role: "demo",
        passwordHash: hashPassword(demoPassword),
        status: "active",
      },
    },
    { upsert: true }
  )

  await User.updateOne(
    { email: adminEmail },
    {
      $set: {
        email: adminEmail,
        name: "Superadmin",
        role: "superadmin",
        passwordHash: hashPassword(adminPassword),
        status: "active",
      },
    },
    { upsert: true }
  )

  await mongoose.disconnect()

  console.log("Seed complete")
  console.log(`Demo user: ${demoEmail}`)
  console.log(`Superadmin user: ${adminEmail}`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
