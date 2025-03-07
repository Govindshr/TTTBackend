const fs = require("fs");
const jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const secretKey = "kms-ak-node";
const multer = require("multer");
const path = require("path");

//========================== Function for Bcrypt and Decrypt Password =================================//

exports.bcryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log(hashedPassword);
    return hashedPassword;
};

exports.decryptPassword = async (getpassword, userpassword) => {
    const validPass = await bcrypt.compare(getpassword, userpassword);
    return validPass;
};

//====================================== Function For JWT ===============================================//

exports.verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized : Missing token" });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden : Invalid token" });
        }

        req.user = user;
        next();
    });
};

//========================== Multer Configuration for Image Uploads ===================================//

// **Storage Configuration**
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads"); // Ensure 'uploads' folder exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// **File Filter: Only Allow Image Files (JPEG, PNG, etc.)**
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

// **Upload Middleware: Handles All Fields Dynamically**
exports.upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: fileFilter
}).any(); // Accepts all fields (both predefined & dynamic)
