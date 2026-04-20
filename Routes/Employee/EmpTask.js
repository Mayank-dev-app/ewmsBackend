import express from "express";
import { uploadApproval, uploadTask } from "../../Middleware/cloudinaryStorge.js";
import * as auth from "../../Middleware/authmiddleware.js";

import {
  getMyTasks,
  updateTaskStatus,
  uploadFiles,
  addComment,
  removeUpload,
} from "../../Controllers/EmployeeController/TaskController.js";

import { updateWork } from "../../Controllers/EmployeeController/TaskUpload.js";

const router = express.Router();

// ✅ Roles array (clean & reusable)
const employeeRoles = [
  "Sales Executive",
  "Inventory Manager",
  "Web Developer",
  "Software Developer",
  "HR",
  "Accountant",
  "Designer",
  "Technician",
];

// ================= ROUTES =================

// 🔹 Get all tasks
router.get(
  "/my-tasks",
  auth.verifyToken,
  auth.checkRole(...employeeRoles),
  getMyTasks
);

// 🔹 Update task status
router.put(
  "/:taskId/status",
  auth.verifyToken,
  auth.checkRole(...employeeRoles),
  updateTaskStatus
);

// 🔹 Upload files
router.post(
  "/:taskId/upload",
  auth.verifyToken,
  auth.checkRole(...employeeRoles),
  uploadApproval.array("files", 5),
  uploadFiles
);

// 🔹 Add comment (Manager + Admin allowed)
router.post(
  "/:taskId/comment",
  auth.verifyToken,
  auth.checkRole(...employeeRoles, "Admin", "Manager"),
  addComment
);

// 🔹 Remove upload
router.delete(
  "/:taskId/upload/:uploadId",
  auth.verifyToken,
  auth.checkRole(...employeeRoles),
  removeUpload
);

// 🔹 Update work (optional - uncomment if needed)
router.put(
  "/:taskId/update-work",
  auth.verifyToken,
  auth.checkRole(...employeeRoles),
  uploadTask.single("files"),
  updateWork
);

export default router;

// //UPDATE FILE
// router.put(
//   "/:taskId/update-work",
//   auth.verifyToken,
//   auth.checkRole(
//     "Sales Executive",
//     "Inventory Manager",
//     "Web Developer",
//     "Software Developer",
//     "HR",
//     "Accountant",
//     "Designer",
//     "Technician"
//   ),
//   upload.array("files"),
//   updateWork
// );

