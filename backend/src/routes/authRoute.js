import express from "express";
import {
  salonSignup,
  Login,
  Signup,
  getCurrentUser,
  logoutUser,
  allowRoles
} from "../controllers/authControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js"

const router = express.Router();

router.post("/salonSignup", salonSignup);
router.post("/login", Login);
router.post("/signup", Signup);
router.get("/me", verifyToken, getCurrentUser);
router.post("/logout", verifyToken, logoutUser);

export default router;

