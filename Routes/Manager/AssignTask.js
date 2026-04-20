import express from "express"
import {
  getDepartments,
  GetEmployee,
  assignTask,
  getTasks,
  // getTaskDetails,
  updateTask,
  deleteTask,
  getTaskReports
} from "../../Controllers/ManagerController/AssignTask.js";

import { getDepartmentTaskSummary } from "../../Controllers/ManagerController/DeptByTask.js";

import { verifyToken, checkRole } from "../../Middleware/authmiddleware.js";
import { getEmployeePerformance } from "../../Controllers/ManagerController/FetchTaskEmpDept.js";
import { employeePerformance } from "../../Controllers/ManagerController/PerformanceController.js";

const router = express.Router();

// ===================== Manager Protected Routes =====================

// Get departments
router.get("/get-department", verifyToken, checkRole("Manager"), getDepartments);

// Get employees by department
router.get("/by-department/:dept", verifyToken, checkRole("Manager"), GetEmployee);

// Assign task
router.post("/assign-task", verifyToken, checkRole("Manager"), assignTask);

// All tasks created by manager
router.get("/tasks", verifyToken, checkRole("Manager"), getTasks);

// Task details
// router.get("/tasks/:id", verifyToken, checkRole("Manager"), getTaskDetails);

// Update task
router.put("/task/:id", verifyToken, checkRole("Manager"), updateTask);

// Delete task
router.delete("/task/:id", verifyToken, checkRole("Manager"), deleteTask);

// Task summary by department
router.get("/department-task-summary", verifyToken, checkRole("Manager"), getDepartmentTaskSummary);

router.get("/task-reports", verifyToken, checkRole("Manager"), getTaskReports);


//------------------------- Employee Performance ---------------------------

router.get("/employee-performance", verifyToken, checkRole("Manager"), employeePerformance);

export default router;
