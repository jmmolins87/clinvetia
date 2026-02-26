import { Schema, model, models } from "mongoose"
import { ADMIN_ROLES } from "@/lib/admin-roles"

const AdminUserActionTokenSchema = new Schema(
  {
    token: { type: String, required: true, unique: true },
    type: { type: String, enum: ["invite_user", "reset_user_password"], required: true },
    status: { type: String, enum: ["pending", "used"], default: "pending" },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, required: false },
    requestedByAdminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requestedByRole: { type: String, enum: [...ADMIN_ROLES], required: true },
    payload: {
      email: { type: String, required: true },
      name: { type: String, required: false },
      role: { type: String, enum: [...ADMIN_ROLES], required: false },
      passwordHash: { type: String, required: true },
      targetUserId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    },
  },
  { timestamps: true }
)

export const AdminUserActionToken =
  models.AdminUserActionToken || model("AdminUserActionToken", AdminUserActionTokenSchema)

