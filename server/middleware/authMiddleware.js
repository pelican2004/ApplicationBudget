const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Acces interzis. Trebuie să fii autentificat.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de autentificare lipsă.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.userId
    ).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Utilizatorul asociat acestui token nu mai există.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Eroare verificare JWT:",
      error.message
    );

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message:
          "Sesiunea a expirat. Autentifică-te din nou.",
      });
    }

    return res.status(401).json({
      success: false,
      message:
        "Token de autentificare invalid.",
    });
  }
};

module.exports = authMiddleware;