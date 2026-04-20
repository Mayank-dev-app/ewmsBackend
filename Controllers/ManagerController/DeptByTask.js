import prisma from "../../db.js";

export const getDepartmentTaskSummary = async (req, res) => {
  try {
    // ✅ group by departmentId + status
    const grouped = await prisma.task.groupBy({
      by: ["departmentId", "status"],
      _count: {
        status: true,
      },
    });

    // ✅ get department names
    const departments = await prisma.department.findMany();

    // ✅ format response
    const summary = departments.map((dept) => {
      const deptData = grouped.filter(
        (g) => g.departmentId === dept.id
      );

      const pending =
        deptData.find((d) => d.status === "Pending")?._count.status || 0;

      const inProgress =
        deptData.find((d) => d.status === "In Progress")?._count.status || 0;

      const completed =
        deptData.find((d) => d.status === "Completed")?._count.status || 0;

      return {
        department: dept.name,
        pending,
        inProgress,
        completed,
        total: pending + inProgress + completed,
      };
    });

    res.json({
      success: true,
      data: summary,
    });

  } catch (err) {
    console.error("Error fetching department task summary:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const departmentList = async (req, res) => {
    try {
        const departments = await prisma.department.findMany({
            include: {
                _count: {
                    select: { employees: true },
                },
            },
        });

        const formatted = departments.map((dept) => ({
            id: dept.id,
            name: dept.name,
            icon: dept.icon || "Users",
            employeesCount: dept._count.employees,
        }));

        res.status(200).json({
            success: true,
            departments: formatted,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};