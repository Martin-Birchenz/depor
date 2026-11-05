const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Guardamos temporalmente el archivo en memoria RAM
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Máximo 5MB
});

router.post("/photo", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No se subió ningún archivo de imagen." });
    }

    // Subida mediante stream nativo de Cloudinary v2
    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "depor_socios",
            transformation: [{ width: 500, height: 500, crop: "limit" }],
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        stream.end(req.file.buffer);
      });
    };

    const result = await uploadStream();
    return res.status(200).json({ url: result.secure_url });
  } catch (error) {
    console.error("Error al subir a Cloudinary:", error);
    return res.status(500).json({
      message: "Error al procesar imagen en Cloudinary",
      error: error.message,
    });
  }
});

module.exports = router;
