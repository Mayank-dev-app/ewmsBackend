import express from "express"
import  getAllTasks  from "../../Controllers/AdminController/AdminTask.js";
import { verifyToken, checkRole } from "../../Middleware/authmiddleware.js";

const router = express.Router();

// All tasks created by manager
router.get("/all", verifyToken, checkRole("Admin"), getAllTasks);

export default router;