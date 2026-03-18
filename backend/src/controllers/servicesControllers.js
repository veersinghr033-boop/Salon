import serviceSchema from "../models/servicesModel.js";
import Salon from "../models/salonModel.js";

export const getServices = async (req, res) => {
  try {
    const services = await serviceSchema.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addService = async (req, res) => {
  try {
    const { name, price, duration, salonId, status } = req.body;
    console.log(name, price, duration, salonId, status);
    if (!name || !price || !salonId) {
      return res
        .status(400)
        .json({ message: "Name, price, and salonId are required" });
    }
    const existingService = await serviceSchema.findOne({ name, salonId });
    console.log(existingService);
    if (existingService) {
      return res
        .status(409)
        .json({ message: "Service name already exists for this salon" });
    }
    const newService = new serviceSchema({
      name,

      price,
      duration,
      salonId,
      status,
    });
    await newService.save();
    const salon = await Salon.findById(salonId);
    console.log(salon);
    if (salon && salon.services) {
      salon.services.push(newService._id);
      await salon.save();
    }

    res
      .status(201)
      .json({ message: "Service added successfully", service: newService });
  } catch (error) {
   

    res.status(500).json({ message: error.message });
    console.error(error);
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration, status } = req.body;
    // console.log(name, price, duration);
    const service = await serviceSchema.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    if (name) service.name = name;
    if (price) service.price = price;
    if (duration) service.duration = duration;
    if (status) service.status = status;
    await service.save();
    res.status(200).json({ message: "Service updated successfully", service });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// const employees = await Employee.aggregate([
//   {
//     $lookup: {
//       from: "services",
//       localField: "Services",
//       foreignField: "_id",
//       as: "servicesDetails",
//     },
//   },
//   {
//     $unwind: {
//       path: "$servicesDetails",
//       preserveNullAndEmptyArrays: true,
//     },
//   },
//   {
//     $project: {
//       // password: 1,
//       services: "$servicesDetails.name",
//       fullName: 1,
//       email: 1,
//       salonId: 1,
//       isActive: 1,
//     },
//   },
// ]);