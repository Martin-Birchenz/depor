const cloudinary = require("../config/cloudinary.js");

const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No se envió ningún archivo de imagen" });
    }

    // Convertir el buffer en base64 para subirlo directamente a Cloudinary
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "el_depor/socios",
      transformation: [
        { width: 500, height: 500, crop: "fill", gravity: "face" }, // Recorte centrado en el rostro
      ],
    });

    return res.status(200).json({
      success: true,
      url: result.secure_url,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadPhoto };
