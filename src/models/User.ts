import { Schema, model, models } from "mongoose"
import { ADMIN_ROLES } from "@/lib/admin-roles"

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, enum: [...ADMIN_ROLES], required: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
  },
  { timestamps: true }
)

export const User = models.User || model("User", UserSchema)
