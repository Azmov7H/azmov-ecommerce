import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import productRoutes from "./routes/productRoutes.js";
import connectDB from "./config/db.js";

const app = express();

// اتصال بقاعدة البيانات
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // لجعل الصور متاحة للعامة

// استخدام مسارات المنتجات
app.use("/products", productRoutes);

// تشغيل السيرفر
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
