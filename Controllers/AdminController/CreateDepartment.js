import prisma from "../../db.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "EWMS/Departments",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: (req, file) => "dept_" + Date.now(),
  },
});

export const upload = multer({ storage });

// Add Department
export const addDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    // ✅ Validation
    if (!name?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required",
      });
    }

    // ✅ Check duplicate
    const existingDept = await prisma.department.findFirst({
      where: {
        name: name.trim(),
      },
    });

    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: "Department with this name already exists",
      });
    }

    // ✅ Image handling
    let iconUrl = "";
    if (req.file?.path) {
      iconUrl = req.file.path;
    }

    // ✅ Create using Prisma
    const newDepartment = await prisma.department.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        icon: iconUrl,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      department: newDepartment,
    });

  } catch (err) {
    console.error("Add Department Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};