import Booking from "../models/bookingModel.js";

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $lookup: {
          from: "salons",
          localField: "salonId",
          foreignField: "_id",
          as: "salon",
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "_id",
          as: "employee",
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "services",
          foreignField: "_id",
          as: "services",
        },
      },

      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$salon", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },

      {
        $project: {
          id: 1,
          bookingId: 1,
          date: 1,
          time: 1,
          totalPrice: 1,
          totalDuration: 1,
          status: 1,

          customer: {
            _id: "$customer._id",
            fullName: "$customer.fullName",
          },

          salon: {
            _id: "$salon._id",
            salonName: "$salon.salonName",
            address: "$salon.address",
            email: "$salon.email",
            phone: "$salon.phone",
          },

          employee: {
            _id: "$employee._id",
            fullName: "$employee.fullName",
          },

          services: {
            $map: {
              input: "$services",
              as: "service",
              in: {
                _id: "$$service._id",
                name: "$$service.name",
              },
            },
          },
        },
      },
    ]);

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const createBooking = async (req, res) => {
  try {
    const {
      customerId,
      salonId,
      employeeId,
      serviceId,
      date,
      time,
      totalPrice,
      totalDuration,
    } = req.body;
    if (
      !customerId ||
      !salonId ||
      !employeeId ||
      !serviceId ||
      (Array.isArray(serviceId) && serviceId.length === 0) ||
      !date ||
      !time ||
      !totalPrice ||
      !totalDuration
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("Creating booking with serviceId:", serviceId);
    // Generate a unique bookingId using uuid to avoid collisions between requests
    const bookingId = `BK-${Math.floor(Math.random() * 10000)}`;
    console.log("Generated bookingId:", bookingId);
    const newBooking = await Booking.create({
      customerId,
      bookingId,
      salonId,
      employeeId,
      services: Array.isArray(serviceId) ? serviceId : [serviceId],
      date,
      time,
      totalPrice,
      totalDuration,
    });
    res
      .status(201)
      .json({ message: "Booking created successfully", booking: newBooking });
  } catch (e) {
    res.status(500).json({ message: e.message });
    console.error(e);
  }
};
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
