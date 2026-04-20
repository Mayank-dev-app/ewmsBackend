import express from "express";

import {  AddEmployeeController } from "../../Controllers/AdminController/CreateEmployee.js";

import { 
    GetAllEmployees, 
    getEmployeeById, 
    updateEmployee 
} from "../../Controllers/AdminController/ShowEmployee.js";

import ManagerListController from "../../Controllers/AdminController/AdminManager.js";

// Auth Middleware
import { verifyToken, verifyAdmin } from "../../Middleware/authmiddleware.js";
import { uploadTask } from "../../Middleware/cloudinaryStorge.js";

const Router = express.Router();

// ---------------- Admin → Employee CRUD ----------------

// Add New Employee
Router.post("/create", verifyToken, verifyAdmin, uploadTask.single("image"), AddEmployeeController);

// Get All Employees
Router.get("/list", verifyToken, GetAllEmployees);

// Get Employee By ID
Router.get("/:id", verifyToken, verifyAdmin, getEmployeeById);

// Update Employee
Router.put("/edit/:id", verifyToken, verifyAdmin, updateEmployee);

// Manager List
Router.get("/managers/list", verifyToken, verifyAdmin, ManagerListController);

export default Router;