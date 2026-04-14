import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import connectDB from "./service/mongodb.js";
import authRoutes from "./Routes/authRoutes.js";
import router from "./Routes/newRoute.js";
import contentRoutes from "./Routes/contentRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:8080",
    credentials: true,
  }),
);
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/", (_req, res) => {
  res.send("api working");
});

app.use("/api/auth", authRoutes);
app.use("/api/data", router);
app.use("/api/content", contentRoutes);

app.listen(port, () => console.log(`server listening on port ${port}`));