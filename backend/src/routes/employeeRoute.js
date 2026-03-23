import express from "express";
import {
  getEmployee,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
} from "../controllers/employeeControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/employees",  getEmployee);
router.post("/employees", verifyToken, addEmployee);
router.put("/employees/:id", verifyToken, updateEmployee);
router.delete("/employees/:id", verifyToken, deleteEmployee);
router.get("/employees/:id", verifyToken, getEmployeeById);


export default router;
