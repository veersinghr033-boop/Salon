import Employee from "../models/employeeModel.js";
import Salon from "../models/salonModel.js";
import Customer from "../models/users.js";
import Booking from "../models/bookingModel.js";
import bcrypt from "bcrypt";

export const getEmployee = async (req, res) => {
  try {
    const employees = await Employee.aggregate([
      {
        $lookup: {
          from: "services",
          localField: "Services",
          foreignField: "_id",
          as: "servicesDetails",
        },
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          as: "salonDetails",
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
        $unwind: {
          path: "$employeeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$salonDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          services: {
            $map: {
              input: "$servicesDetails",
              as: "service",
              in: {
                id: "$$service._id",
                name: "$$service.name",
                price: "$$service.price",
              },
            },
          },
          salonId: 1,
          fullName: 1,
          email: 1,
          role: 1,
          isActive: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addEmployee = async (req, res) => {
  try {
    const { fullName, email, salonId, Services, isActive } = req.body;
    // console.log(req.body)

    if (!fullName || !email || !salonId || !Services) {
      return res.status(400).json({
        message: "FullName, Email, SalonId, and Services required",
      });
    }

    const existing = await Employee.findOne({ email, salonId });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Email already exists for this salon" });
    }
    const User = await Customer.findOne({ email });
    if (User) {
      return res
        .status(409)
        .json({ message: "Customer already exists with this email" });
    }

    const defaultPassword = "Employee@123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const employee = await Employee.create({
      fullName,
      email,
      Services,
      salonId,
      isActive: isActive ?? true,
      password: hashedPassword,
      role: "employee",
    });

    const user = await Customer.create({
      fullName,
      email,
      phone: "0000000000",
      password: hashedPassword,
      isActive: isActive ?? true,
      role: "employee",
      salonId,
      employeeId: employee._id,
    });

    const salon = await Salon.findById(salonId);
    if (salon && salon.employees) {
      salon.employees.push(employee._id);
      await salon.save();
    }

    res.status(201).json({
      message: "Employee created successfully",
      employee,
      user,
      defaultPassword,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, salonId, Services, isActive } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { fullName, email, salonId, Services, isActive },
      { new: true },
    ).select("-password");

    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    await Employee.findByIdAndDelete(id);
    // res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const [employee, bookings] = await Promise.all([
      Employee.findById(id)
        .select("-password")
        .populate("Services", "name price"),

      Booking.find({ employeeId: id }).select("date time totalDuration"),
    ]);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.status(200).json({
      employee,
      bookedSlots: bookings.map((b) => ({
        date: b.date,
        time: b.time,
        duration: b.totalDuration,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};