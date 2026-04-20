import prisma from "../../db.js";

export const AdminDashboardCounts = async (req, res) => {
  try {
    // Run all queries in parallel (faster 🚀)
    const [totalEmployees, totalDepartments, totalTasks] = await Promise.all([
      prisma.employee.count(),
      prisma.department.count(),
      prisma.task.count(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Dashboard counts fetched",
      totalEmployees,
      totalDepartments,
      totalTasks,
    });

  } catch (error) {
    console.log("Dashboard Count Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error - Dashboard Count API",
    });
  }
};