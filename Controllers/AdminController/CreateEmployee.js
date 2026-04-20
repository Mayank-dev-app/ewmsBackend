import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import bcrypt from "bcrypt";
import prisma from "../../db.js";

// 🔹 Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// 🔹 Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "EWMS/Employees",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: () => "EMP_" + Date.now(),
  },
});

export const upload = multer({ storage });

// 🔹 ADD EMPLOYEE
export const AddEmployeeController = async (req, res) => {
  try {
    const { name, email, password, role, department, phone, status } = req.body;
    console.log(req.body);

    // ✅ Validation
    if (!name?.trim() || !email?.trim() || !password || !role || !department || !phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const deptId = Number(department);

    // ✅ Check department exists
    const dept = await prisma.department.findUnique({
      where: { id: deptId },
    });

    if (!dept) {
      return res.status(400).json({
        success: false,
        message: "Department not found",
      });
    }

    // ✅ Check duplicate email
    const existing = await prisma.employee.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Employee with this email already exists",
      });
    }

    // ✅ Manager check
    // if (role === "Manager") {
    //   const existingManager = await prisma.employee.findFirst({
    //     where: {
    //       departmentId: deptId,
    //        role: "Manager",
    //     },
    //   });

    //   if (existingManager) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "This department already has a Manager!",
    //     });
    //   }
    // }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Image
    let imageUrl = "";
    if (req.file?.path) {
      imageUrl = req.file.path;
    }

    // ✅ Create Employee
    const newEmployee = await prisma.employee.create({
      data: {
        name: name.trim(),
        email,
        password: hashedPassword,
        role,
        phone,
        status: status || "Active",
        image: imageUrl,
        createdBy: req.adminId,

        // 🔥 Relation connect
        department: {
          connect: { id: deptId },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee: newEmployee,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error - AddEmployee API",
    });
  }
};