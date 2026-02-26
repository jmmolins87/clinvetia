import { Schema, model, models } from "mongoose"
import { ADMIN_ROLES } from "@/lib/admin-roles"

const AdminSessionSchema = new Schema(
  {
    token: { type: String, required: true, unique: true },
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: [...ADMIN_ROLES], required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
)

export const AdminSession = models.AdminSession || model("AdminSession", AdminSessionSchema)
