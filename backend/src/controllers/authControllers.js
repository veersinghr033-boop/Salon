import User from "../models/users.js";
import Customer from "../models/customerModel.js";
import Salon from "../models/salonModel.js";
import Employee from "../models/employeeModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const secret_key = process.env.JWT_SECRET;

export const Signup = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body missing" });
    }

    const { fullName, role, email, phone, password } = req.body;

    if (!fullName || !role || !email || !phone || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    const newUser = new User({
      fullName,
      role,
      email,
      phone,
      password: hashedPassword,
      customerId: customer._id,
    });

    await newUser.save();

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: newUser._id,
        role: newUser.role,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }
    console.log(email, password);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }
    console.log(user);

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      secret_key,
      { expiresIn: "1d" },
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      success: true,
      token,
      user: {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const salonSignup = async (req, res) => {
  try {
    const { salonName, ownerName, email, phone, address, password } = req.body;

    if (!salonName || !ownerName || !email || !phone || !address || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingSalon = await Salon.findOne({ email });
    if (existingSalon) {
      return res.status(409).json({ message: "Salon already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const workingHours = {
      Mon: "09:00 - 18:00",
      Tue: "09:00 - 18:00",
      Wed: "09:00 - 18:00",
      Thu: "09:00 - 16:00",
      Fri: "09:00 - 18:00",
      Sat: "10:00 - 18:00",
      Sun: "Closed",
    };

    const salon = await Salon.create({
      salonName,
      ownerName,
      email,
      phone,
      address,
      password: hashedPassword,
      role: "Admin",
      isApproved: false,
      hours: workingHours,
    });

    res.status(201).json({
      message: "Salon registered successfully. Await admin approval.",
      salon: {
        id: salon._id,
        salonName: salon.salonName,
        email: salon.email,
        role: salon.role,
        isApproved: salon.isApproved,
      },
    });
  } catch (error) {
    console.error("Salon signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const userDet = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(String(userId)),
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          as: "salonDet",
        },
      },

      {
        $unwind: {
          path: "$salonDet",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$employeeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$customerDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          salonId: "$salonDet._id",
          employeeId: "$employeeDetails._id",
          customerId: "$customerDetails._id",

        },
      },
    ]);
    if (req.user.role === "customer") {
      return res.status(200).send({
        success: true,
        user: {
          userId: req.user.id,
          fullName: req.user.fullName,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role,
          customerId: userDet[0].customerId || null,
        },
      });
    }
    if (req.user.role === "Admin") {
      return res.status(200).send({
        success: true,
        user: {
          userId: req.user.id,
          fullName: req.user.fullName,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role,
          salonId: userDet[0].salonId || null,
        },
      });
    }
    if (req.user.role === "employee") {
      return res.status(200).send({
        success: true,
        user: {
          userId: req.user.id,
          fullName: req.user.fullName,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role,
          employeeId: userDet[0].employeeId || null,
          salonId: userDet[0].salonId || null,
        },
      });
    }

    res.status(200).send({
      success: true,
      user: {
        userId: req.user.id,
        fullName: req.user.fullName,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ success: false, message: "Server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).send({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: "Server error" });
  }
};

export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({ success: false, message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).send({ success: false, message: "Forbidden" });
    }

    next();
  };
};
