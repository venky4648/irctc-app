import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const paymentMethodSchems = new mongoose.Schema({
  type: {
    type: String,
    enum: ["debit_card", "credit_card", "net_banking", "upi"],
    required: true,
  },
  details: {
    type: String,
  },
});


const passengerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  berthPreference: String,
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    paymentMethods: [paymentMethodSchems],
    passengerMasterList: [passengerSchema],
  },
  { timestamps: true },
);



// exporting as default to match controller import
const User = mongoose.model("User", userSchema);
export default User;

