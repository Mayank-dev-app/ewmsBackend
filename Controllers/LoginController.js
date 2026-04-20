import mailOption from "../Confige/mailconfig.js"
import prisma from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



export const UserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // ✅ Check user exists (Prisma)
    let user = await prisma.admin.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.employee.findUnique({
        where: { email },
        include: { department: true },
      });
    }

    // 3. Agar dono jagah nahi mila
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    // 5. Generate JWT token (Role based)
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role, // "Admin" , "Employee"
        departmentId: user.departmentId || null,
      },
      process.env.JWT_SECRET || "MY_SECRET_KEY_2025",
      { expiresIn: "7d" }
    );

    // 6. Response (Sensitive data filter karke)
    const { password: _, resetOtp: __, otpExpire: ___, ...userData } = user;

    return res.status(200).json({
      success: true,
      message: `${user.role} login successful`,
      token,
      user: userData,
    });

  } catch (err) {
    console.log("Login Error:", err.message);
    return res.status(500).json({ success: false, message: "Server Error from /login" });
  }
};

// ----------------------- Send OTP ------------------------ //

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please Fill All Fields",
      });
    }

    // 🔍 check admin first
    let user = await prisma.admin.findFirst({
      where: { email },
    });

    let userType = "admin";

    // 🔍 if not admin, check employee
    if (!user) {
      user = await prisma.employee.findFirst({
        where: { email },
      });
      userType = "employee";
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    // OTP generate
    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

    // ✅ UPDATE correct table
    if (userType === "admin") {
      await prisma.admin.update({
        where: { email },
        data: {
          otp: hashedOtp,
          otpExpire: new Date(Date.now() + 5 * 60 * 1000),
        },
      });
    } else {
      await prisma.employee.update({
        where: { email },
        data: {
          resetOtp: hashedOtp,
          otpExpire: new Date(Date.now() + 5 * 60 * 1000),
        },
      });
    }

    await mailOption(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP Sent Successfully",
    });

  } catch (error) {
    console.log("Send OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error - SendOtp API",
    });
  }
};

// // ------------------- Verify OTP -------------------------//

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // 🔍 check admin first
    let user = await prisma.admin.findUnique({
      where: { email },
    });

    let userType = "admin";

    // 🔍 if not admin, check employee
    if (!user) {
      user = await prisma.employee.findUnique({
        where: { email },
      });
      userType = "employee";
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 🔥 OTP EXPIRE CHECK (IMPORTANT FIX)
    const expiryTime = user.otpExpire;

    if (!expiryTime || new Date(expiryTime) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // 🔥 GET CORRECT OTP FIELD
    const storedOtp = userType === "admin" ? user.otp : user.resetOtp;

    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or already used",
      });
    }

    // 🔥 COMPARE OTP
    const match = await bcrypt.compare(String(otp), String(storedOtp));

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ✅ CLEAR OTP IN CORRECT TABLE
    if (userType === "admin") {
      await prisma.admin.update({
        where: { email },
        data: {
          otp: null,
          otpExpire: null,
          otpVerify: true,
        },
      });
    } else {
      await prisma.employee.update({
        where: { email },
        data: {
          resetOtp: null,
          otpExpire: null,
          otpVerify: true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully!",
    });

  } catch (error) {
    console.log("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ------------------- Change Password ------------------//

export const changePassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    // 🔍 check admin first
    let user = await prisma.admin.findUnique({
      where: { email },
    });

    let userType = "admin";

    // 🔍 if not admin, check employee
    if (!user) {
      user = await prisma.employee.findUnique({
        where: { email },
      });
      userType = "employee";
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ✅ OTP verification check (FIXED FIELD NAME)
    if (!user.otpVerify) {
      return res.status(400).json({
        success: false,
        message: "OTP verification required before password change",
      });
    }

    // 🔐 hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // ✅ update correct table
    if (userType === "admin") {
      await prisma.admin.update({
        where: { email },
        data: {
          password: hashPassword,
          otp: null,
          otpExpire: null,
          otpVerify: false,
        },
      });
    } else {
      await prisma.employee.update({
        where: { email },
        data: {
          password: hashPassword,
          resetOtp: null,
          otpExpire: null,
          otpVerify: false,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (error) {
    console.log("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error - changePassword API",
    });
  }
};