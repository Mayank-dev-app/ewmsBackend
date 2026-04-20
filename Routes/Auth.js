import express from "express";
import { UserLogin, changePassword, sendOtp, verifyOtp } from "../Controllers/LoginController.js"

const authRoutes = express.Router();

authRoutes.get("/", (req, res) => {
    try {
        return res.json({
            success: true,
            message: 'Auth Routing is Working',
        })
    } catch (error) {
        console.log("authRoutes have an error ", error);
    }
})

authRoutes.post("/login", UserLogin);
authRoutes.post("/send-otp", sendOtp);
authRoutes.post("/verifyOtp", verifyOtp);
authRoutes.post("/changePassword", changePassword);

export default authRoutes;
