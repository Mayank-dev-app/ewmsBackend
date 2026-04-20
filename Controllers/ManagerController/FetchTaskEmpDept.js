import prisma from "../../db.js";

export const getDashboardSummary = async (req, res) => {
  try {
    // ✅ Counts
    const totalEmployees = await prisma.employee.count();
    const totalDepartments = await prisma.department.count();
    const totalTasks = await prisma.task.count();

    // ✅ Today range
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const tasksToday = await prisma.task.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    res.json({
      success: true,
      data: {
        totalEmployees,
        totalDepartments,
        totalTasks,
        tasksToday,
      },
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getEmployeePerformance = async (req, res) => {
  try {
    // ✅ All employees + their tasks
    const employees = await prisma.employee.findMany({
      include: {
        tasks: true, // 👈 relation hona chahiye schema me
      },
    });

    const performance = employees.map((emp) => {
      const completedTasks = emp.tasks.filter(
        (t) => t.status === "Completed"
      ).length;

      return {
        name: emp.name,
        completedTasks,
      };
    });

    res.json({
      success: true,
      data: performance,
    });

  } catch (err) {
    console.error("Performance Error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};