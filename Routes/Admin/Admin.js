import express from "express";

import {
    AdminProfileData,
    GetAdminData,
    UpdateAdminProfile,
    SendOtp,
    VerifyOtp
} from "../../Controllers/AdminController/AdminProfile.js";
import { AdminDashboardCounts } from "../../Controllers/AdminController/AdminDashboardCount.js";
import { verifyToken , checkRole } from "../../Middleware/authmiddleware.js";

const router = express.Router();


// ==================== PUBLIC ROUTES (No Login Required) ====================

// Test Route
router.get("/test", (req, res) => {
    res.send("This is a Test Route.");
});

// Create admin (only first-time).
router.post("/create", AdminProfileData);

// Send OTP
router.post("/send-otp",verifyToken, SendOtp);

// OTP Verify
router.post("/verify-otp",verifyToken, VerifyOtp);


// ==================== PROTECTED ROUTES (Admin Login Required) ====================

// Get admin profile
router.get(
    "/get",
    verifyToken,
    checkRole("Admin"),
    GetAdminData
);

// Update admin profile
router.put(
    "/update-admin/:id",
    verifyToken,
    checkRole("Admin"),
    UpdateAdminProfile
);

// Dashboard calculation API
router.get(
    "/dashboard-counts",
    verifyToken,
    checkRole("Admin"),
    AdminDashboardCounts
);


export default router;
