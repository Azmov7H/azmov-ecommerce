import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// اتصال بقاعدة البيانات
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// استخدام مسارات المنتجات
app.use("/products", productRoutes);

// تشغيل السيرفر
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

