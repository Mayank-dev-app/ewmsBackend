import express from "express";
import {
  getDashboardSummary,
  getEmployeePerformance,
} from "../../Controllers/ManagerController/FetchTaskEmpDept.js";

import { verifyToken, checkRole } from "../../Middleware/authmiddleware.js";
import { departmentList } from "../../Controllers/ManagerController/DeptByTask.js";

const router = express.Router();

// Dashboard Summary
router.get(
  "/dashboard-summary",
  verifyToken,
  checkRole("Manager"),
  getDashboardSummary
);

// Employee Performance
router.get(
  "/employee-performance",
  verifyToken,
  checkRole("Manager"),
  getEmployeePerformance
);

router.get("/department/all",
  verifyToken,
  checkRole("Manager"),
  departmentList
)
export default router;