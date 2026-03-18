import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import userRoute from "./src/routes/UserRoute.js";
import salonRoute from "./src/routes/salonRoute.js";
import authRoute from "./src/routes/authRoute.js";
import employeeRoute from "./src/routes/employeeRoute.js";
import servicesRoute from "./src/routes/servicesRoute.js";
import bookingRoute from "./src/routes/bookingRoute.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", userRoute);
app.use("/api/auth", salonRoute);
app.use("/api/auth", authRoute);
app.use("/api/auth", employeeRoute);
app.use("/api/auth", servicesRoute);
app.use("/api/auth", bookingRoute);

connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
