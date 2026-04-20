import prisma from "../../db.js";

export const employeePerformance = async (req, res) => {
  try {
    const managerId = req.user.id;

    // 1. Get manager department
    const manager = await prisma.employee.findUnique({
      where: { id: managerId },
      select: { departmentId: true },
    });


    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // 2. Get employees only from same department + task stats
    const employees = await prisma.employee.findMany({
      where: {
        departmentId: manager.departmentId, // 🔥 IMPORTANT FILTER
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },

        // 🔥 TASK STATS
        tasks: {
          select: {
            status: true,
          },
        },

        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    // 3. Transform data (frontend friendly)
    const result = employees.map((emp) => {
      const total = emp._count.tasks;

      const approved = emp.tasks.filter(t => t.status === "Approved").length;
      const pending = emp.tasks.filter(t => t.status === "Pending").length;
      const progress = emp.tasks.filter(t => t.status === "In Progress").length;

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        department: emp.department,

        stats: {
          total,
          approved,
          pending,
          inProgress: progress,
        },
      };
    });

    return res.json({
      success: true,
      employees: result,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};