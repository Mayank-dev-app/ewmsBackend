import mailOption from "../../Confige/mailconfig.js";
import prisma from "../../db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";


export const AdminProfileData = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // 1. Validate fields
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide all details",
      });
    }

    // 2. Check if email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin already exists with this email",
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create admin
    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: role || "Admin", // Default set kar sakte hain
      },
    });

    // --- FIX: Remove password before sending response ---
    const { password: _, ...adminWithoutPassword } = admin;

    // 5. Return success
    return res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: adminWithoutPassword, // <--- Ab password leak nahi hoga
    });

  } catch (error) {
    console.error("Admin Create Error:", error);
    
    // Agar Table nahi bani hogi toh ye error yahan pakda jayega
    return res.status(500).json({
      success: false,
      message: error.message || "Error in AdminData Controller",
    });
  }
};


//  Get Admin Data
export const GetAdminData = async (req, res) => {
  try {
    const admin = await prisma.admin.findMany();

    // Check if empty
    if (!admin || admin.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No admin found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin data fetched successfully",
      admin,
    });

  } catch (error) {
    console.error("Get Admin Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in getting admin data",
    });
  }
};


//Update Admin Profile
export const UpdateAdminProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password, role } = req.body;

    // 1. Check admin exists
    const adminExist = await prisma.admin.findUnique({
      where: { id: Number(id) },
    });

    if (!adminExist) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // 2. Check email already used by another admin
    const emailExists = await prisma.admin.findFirst({
      where: {
        email,
        NOT: {
          id: Number(id),
        },
      },
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already in use by another admin",
      });
    }

    // 3. Handle password
    let hashedPassword = adminExist.password;

    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 4. Update admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        phone,
        role,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      admin: updatedAdmin,
    });

  } catch (error) {
    console.error("Update Admin Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating admin profile",
    });
  }
};


// OTP store karne ke liye (TEMP memory)
export const SendOtp = async (req, res) => {
  try {
    const adminId = req.user.id; // 🔥 Take From JWT 
    const { email } = req.body;

    // ✅ Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // ✅ OTP generate
    const otp = crypto.randomInt(100000, 999999).toString();

    // ✅ Hash OTP (IMPORTANT 🔐)
    const hashedOtp = await bcrypt.hash(otp, 10);

    // ✅ Expiry (5 minutes)
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // ✅ Save in DB
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        tempEmail: email,     // 🔥 save new email
        otp: hashedOtp,       // 🔥 save hashed OTP
        otpExpire: otpExpiry, // 🔥 expiry set
      },
    });

    // ✅ Send mail
    await mailOption(email, otp);

    return res.json({
      success: true,
      message: "OTP sent successfully",
      otp, // ⚠️ only for testing (remove in production)
    });

  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};


//Verify OTP
export const VerifyOtp = async (req, res) => {
  try {
    const adminId = req.user.id; // 🔥 Take From JWT 
    const { otp } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin || !admin.tempEmail) {
      return res.status(400).json({
        message: "No email change request found",
      });
    }

    if (admin.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp.toString(), admin.otp);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // 🔥 FINAL UPDATE
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        email: admin.tempEmail,
        tempEmail: null,
        otp: null,
        otpExpire: null,
      },
    });

    return res.json({
      success: true,
      message: "Email updated successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verification failed" });
  }
};

