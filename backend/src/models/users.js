import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["customer", "employee", "Admin"],

      default: "customer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("users", customerSchema);
export default User;
