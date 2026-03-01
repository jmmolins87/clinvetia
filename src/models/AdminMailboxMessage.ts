import { Schema, model, models } from "mongoose"

const AdminMailboxMessageSchema = new Schema(
  {
    mailboxType: { type: String, enum: ["shared", "user"], required: true },
    mailboxEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    folder: { type: String, enum: ["inbox", "sent", "trash"], default: "inbox", index: true },
    direction: { type: String, enum: ["inbound", "outbound"], required: true },
    status: { type: String, enum: ["received", "sent", "failed"], required: true },
    from: {
      email: { type: String, required: true, lowercase: true, trim: true },
      name: { type: String, default: null },
    },
    to: {
      type: [
        new Schema(
          {
            email: { type: String, required: true, lowercase: true, trim: true },
            name: { type: String, default: null },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    preview: { type: String, default: "" },
    relatedType: { type: String, default: null },
    relatedId: { type: String, default: null },
    error: { type: String, default: null },
    createdBy: {
      adminId: { type: String, default: null },
      email: { type: String, default: null },
      name: { type: String, default: null },
      role: { type: String, default: null },
    },
  },
  { timestamps: true }
)

AdminMailboxMessageSchema.index({ mailboxEmail: 1, folder: 1, createdAt: -1 })
AdminMailboxMessageSchema.index({ relatedType: 1, relatedId: 1 })

export const AdminMailboxMessage =
  models.AdminMailboxMessage || model("AdminMailboxMessage", AdminMailboxMessageSchema)

