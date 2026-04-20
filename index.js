import "dotenv/config";
import cors from "cors";
import express from "express";
import prisma from "./db.js"

import AuthRoutes from "./Routes/Auth.js";

import router from "./Routes/Admin/Admin.js"
import DepartmentRoutes from "./Routes/Admin/AdminDepartment.js";
import AdminEmpRoutes from "./Routes/Admin/AdminEmpManager.js";
import AdminTasks from "./Routes/Admin/AdminTask.js"

import tasks from "./Routes/Manager/AssignTask.js"
import dashboard from "./Routes/Manager/Showlist.js"
import approvel from "./Routes/Manager/Approvel.js"

import employee from "./Routes/Employee/EmpTask.js"
const app = express();

app.use(cors({
  origin: ["http://localhost:5173", ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
))
app.use(express.json());

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Server is successfully running",
  });
});

// app.use((req, res, next) => {
//   console.log("REQUEST:", req.method, req.url);
//   next();
// });

// // ------------------ AUTH ROUTES ------------------
app.use("/api/auth", AuthRoutes);

// ------------------ ADMIN ROUTES ------------------
app.use("/api/admin", router);                        // Admin main routes
app.use("/api/admin/department", DepartmentRoutes);  // Admin Department
app.use("/api/admin/employee", AdminEmpRoutes);      //Admin Employee Routes
app.use("/api/admin/task", AdminTasks);

app.use("/api/manager", tasks);
app.use("/api/manager", dashboard);
app.use("/api/manager", approvel);

app.use("/api/employee", employee);

app.listen(process.env.PORT || 5000, async () => {
  try {
    console.log("Server is running on port 5000");
  } catch (error) {
    console.log("DB Connection Failed", error);
  }
});