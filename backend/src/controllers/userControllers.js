import Customer from "../models/users.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
export const GetUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const users = await Customer.aggregate([
      
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
        $unwind: {
          path: "$salonDet",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          salon: {
            id: "$salonDet._id",
            name: "$salonDet.salonName",
            description: "$salonDet.description",
          },
          employeeId: "$employeeDetails._id",
          customerId: "$customerDetails._id",
          fullName: 1,
          email: 1,
          role: 1,
          phone: 1,
          createdAt: 1,
          isActive: 1,
        },
      },
    ]);
    res.status(200).json(users);
  } catch (error) {
    console.error("Get salon error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
