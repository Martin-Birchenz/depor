const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage en memoria/Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "depor_socios",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const upload = multer({ storage });

router.post("/photo", upload.single("photo"), (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res
        .status(400)
        .json({ message: "No se subió ningún archivo de imagen." });
    }
    return res.status(200).json({ url: req.file.path });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Error al procesar imagen en Cloudinary",
        error: error.message,
      });
  }
});

module.exports = router;
