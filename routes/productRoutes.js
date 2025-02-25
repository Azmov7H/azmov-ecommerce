import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Product from "../models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// إعدادات Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// إعداد Multer لتخزين الصور في Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "products",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});
const upload = multer({ storage });

// ✅ [POST] إضافة منتج جديد
router.post("/", upload.single("image"), async (req, res) => {
    try {
        const { title, price, desc } = req.body;
        const imagePath = req.file ? req.file.path : null;

        if (!title || !price || !desc || !imagePath) {
            return res.status(400).json({ message: "يجب إدخال جميع الحقول المطلوبة." });
        }

        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ message: "يجب أن يكون السعر رقمًا موجبًا." });
        }

        const newProduct = new Product({ title, price, image: imagePath, desc });
        await newProduct.save();

        res.status(201).json({ message: "✅ تم إنشاء المنتج بنجاح!", product: newProduct });
    } catch (error) {
        res.status(500).json({ message: "❌ حدث خطأ!", error });
    }
});

// ✅ [GET] جلب جميع المنتجات
router.get("/", async (req, res) => {
    try {
        let { limit, page } = req.query;
        limit = parseInt(limit) || 10;
        page = parseInt(page) || 1;

        const skip = (page - 1) * limit;

        const products = await Product.find().skip(skip).limit(limit);
        const totalProducts = await Product.countDocuments();

        res.status(200).json({
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            products
        });
    } catch (error) {
        res.status(500).json({ message: "❌ حدث خطأ أثناء جلب المنتجات!", error });
    }
});

// ✅ [GET] جلب منتج واحد
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "❌ المنتج غير موجود!" });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "❌ حدث خطأ أثناء جلب المنتج!", error });
    }
});

// ✅ [DELETE] حذف منتج
router.delete("/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "❌ المنتج غير موجود!" });
        }
        res.status(200).json({ message: "✅ تم حذف المنتج بنجاح!" });
    } catch (error) {
        res.status(500).json({ message: "❌ حدث خطأ أثناء حذف المنتج!", error });
    }
});

// ✅ [PUT] تحديث المنتج
router.put("/:id", async (req, res) => {
    try {
        const { title, price, desc } = req.body;
        const { id } = req.params;

        if (!title || !price || !desc) {
            return res.status(400).json({ message: "❌ يرجى إدخال جميع البيانات المطلوبة!" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { title, price, desc },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "⚠️ المنتج غير موجود!" });
        }

        res.json({ message: "✅ تم تحديث المنتج بنجاح!", product: updatedProduct });
    } catch (error) {
        console.error("❌ خطأ أثناء التحديث:", error);
        res.status(500).json({ message: "❌ خطأ في الخادم الداخلي!" });
    }
});

export default router;
