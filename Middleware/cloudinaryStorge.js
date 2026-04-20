import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "cloudinary";

// config
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// ======================
// 🔥 TASK STORAGE
// ======================
const taskStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: async (req, file) => {
    const ext = file.originalname.split(".").pop().toLowerCase();

    let resource_type = "auto";

    if (["pdf", "doc", "docx", "txt", "xlsx"].includes(ext)) {
      resource_type = "raw";
    }

    return {
      folder: "tasks",
      resource_type,
      format: ext,
    };
  },
});

export const uploadTask = multer({ storage: taskStorage });


// ======================
// 🔥 APPROVAL STORAGE
// ======================
const approvalStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: async (req, file) => {
    const ext = file.originalname.split(".").pop().toLowerCase();

    let resource_type = "auto";

    if (["pdf", "doc", "docx", "txt", "xlsx", "zip"].includes(ext)) {
      resource_type = "raw";
    }

    return {
      folder: "approvals",
      resource_type,
      format: ext,
    };
  },
});

export const uploadApproval = multer({ storage: approvalStorage });