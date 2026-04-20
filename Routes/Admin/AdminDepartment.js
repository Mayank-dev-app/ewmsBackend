import express from "express";

import {
  getDepartments,
  getDepartmentById,
} from "../../Controllers/AdminController/AdminDepartment.js";

import {
  addDepartment,
} from "../../Controllers/AdminController/CreateDepartment.js";

import {
  updateDepartment,
} from "../../Controllers/AdminController/EditDepartment.js";

import {
  verifyToken,
  checkRole,
} from "../../Middleware/authmiddleware.js";
import { uploadTask } from "../../Middleware/cloudinaryStorge.js";

const router = express.Router();

// ====================== ADMIN PROTECTED ROUTES ======================

// Get all departments
router.get(
  "/all",
  verifyToken,
  checkRole("Admin"),
  getDepartments
);

// Get department by ID
router.get(
  "/:id",
  verifyToken,
  checkRole("Admin"),
  getDepartmentById
);

// Create department
router.post(
  "/create",
  verifyToken,
  checkRole("Admin"),
  uploadTask.single("icon"),
  addDepartment
);

// Update department
router.put(
  "/update/:id",
  verifyToken,
  checkRole("Admin"),
  uploadTask.single("icon"),
  updateDepartment
);

export default router;