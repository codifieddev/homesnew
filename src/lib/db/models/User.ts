import mongoose, { Schema, model, models, Document } from "mongoose";
import type { IUser } from "@/types";
import { USER_ROLES } from "@/lib/utils/constants";

export type UserDocument = IUser & Document;

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email address",
      },
    },
    phone: { type: String, trim: true },
    // Password stored as bcrypt hash — NEVER plaintext
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "agent",
      required: true,
    },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        // Always strip password from JSON output
        delete ret.password;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ─── INDEXES ──────────────────────────────────────────────────────────────────

UserSchema.index({ role: 1, isActive: 1 });

// ─── VIRTUALS ─────────────────────────────────────────────────────────────────

UserSchema.virtual("initials").get(function () {
  return this.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

// ─── EXPORT ───────────────────────────────────────────────────────────────────

const User =
  (models.User as mongoose.Model<UserDocument>) ||
  model<UserDocument>("User", UserSchema);

export default User;
