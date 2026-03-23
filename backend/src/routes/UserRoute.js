import express from "express";
import { GetUsers, changePassword } from "../controllers/userControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router =express.Router();

router.get("/users/:userId",verifyToken,GetUsers)
router.post("/:userId/change-password",verifyToken,changePassword)



export default router