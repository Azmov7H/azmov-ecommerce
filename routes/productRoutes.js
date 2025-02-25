import express from "express";
import multer from "multer";
import Product from "../models/Product.js";

const router = express.Router();

// إعداد Multer لحفظ الصور
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
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

        // تحويل القيم إلى أرقام مع تحديد القيم الافتراضية
        limit = parseInt(limit) || 10; // عدد المنتجات في كل طلب (افتراضي 10)
        page = parseInt(page) || 1; // الصفحة المطلوبة (افتراضي 1)

        const skip = (page - 1) * limit; // لحساب عدد المنتجات التي سيتم تخطيها

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
//✅حذف منتج من قاعدة البيانات
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

// ✅ تحديث بيانات المنتج
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, price } = req.body;

        // التأكد من إرسال بيانات صحيحة
        if (!title || !price) {
            return res.status(400).json({ message: "❌ يرجى إدخال جميع البيانات المطلوبة!" });
        }

        // البحث عن المنتج وتحديثه
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { title, price },
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
