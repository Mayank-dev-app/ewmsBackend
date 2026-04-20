import prisma from "../../db.js"

// GET all departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany();

    return res.json({
      success: true,
      departments,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// GET employees by department (by ID)
export const GetEmployee = async (req, res) => {
  try {
    const deptId = Number(req.params.dept); // 👈 convert to number

    const employees = await prisma.employee.findMany({
      where: {
        departmentId: deptId,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      employees,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//Assign Task
// export const assignTask = async (req, res) => {
//   try {
//     const { title, employee, department, dueDate, priority, description } = req.body;

//     if (!title || !employee || !department || !dueDate) {
//       return res.status(400).json({
//         success: false,
//         message: "Required fields missing",
//       });
//     }

//     // ✅ Convert IDs
//     const employeeId = Number(employee);
//     const departmentId = Number(department);

//     // ✅ Create Task
//     const newTask = await prisma.task.create({
//       data: {
//         title,
//         description,
//         dueDate: new Date(dueDate),
//         priority,

//         employee: {
//           connect: { id: employeeId },
//         },

//         department: {
//           connect: { id: departmentId },
//         },

//         createdBy: {
//           connect: { id: req.user.id }, // 👈 make sure relation exists
//         },
//       },

//       include: {
//         employee: {
//           select: { name: true, email: true },
//         },
//         department: {
//           select: { name: true },
//         },
//       },
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Task Assigned Successfully",
//       task: newTask,
//     });

//   } catch (error) {
//     console.log("Assign Task Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };

export const assignTask = async (req, res) => {
  try {
    const { title, employee, dueDate, priority, description } = req.body;

    if (!title || !employee || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const employeeId = Number(employee);

    // 🔥 1. Get logged-in manager
    const manager = await prisma.employee.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        departmentId: true,
      },
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    // 🔥 2. Get employee data
    const employeeData = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        departmentId: true,
      },
    });

    if (!employeeData) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // 🔥 3. Department restriction check
    if (employeeData.departmentId !== manager.departmentId) {
      return res.status(403).json({
        success: false,
        message: "You can only assign tasks to your department employees",
      });
    }

    // 🔥 4. Create Task (secure)
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        priority,
        status: "PENDING", // default safe status

        employee: {
          connect: { id: employeeId },
        },

        department: {
          connect: { id: manager.departmentId },
        },

        createdBy: {
          connect: { id: req.user.id },
        },
      },

      include: {
        employee: {
          select: { name: true, email: true },
        },
        department: {
          select: { name: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Task Assigned Successfully",
      task: newTask,
    });

  } catch (error) {
    console.log("Assign Task Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get All Tasks
export const getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      tasks,
    });
  } catch (err) {
    console.log("Get Tasks Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update Task
export const updateTask = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID",
      });
    }

    const { title, description, dueDate, priority, employee, department } = req.body;

    // ✅ Check task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // ✅ Update Task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: title || existingTask.title,
        description: description || existingTask.description,
        dueDate: dueDate ? new Date(dueDate) : existingTask.dueDate,
        priority: priority || existingTask.priority,

        ...(employee && {
          employee: {
            connect: { id: Number(employee) },
          },
        }),

        ...(department && {
          department: {
            connect: { id: Number(department) },
          },
        }),
      },

      include: {
        employee: {
          select: { name: true, email: true },
        },
        department: {
          select: { name: true },
        },
      },
    });

    return res.json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });

  } catch (err) {
    console.log("Update Task Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete Task
export const deleteTask = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID",
      });
    }

    // ✅ check exists
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await prisma.task.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Task deleted",
    });

  } catch (err) {
    console.log("Delete Task Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getTaskReports = async (req, res) => {
  try {
    const managerId = req.user.id;

    const tasks = await prisma.task.findMany({
      where: {
        createdById: managerId,
        status: {
          in: ["Pending", "In Progress", "Approved"],
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = tasks.map((t) => ({
      id: t.id,
      task: t.title,
      employee: t.employee,
      department: t.department?.name,
      status: t.status,
      date: t.createdAt,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.log("Task Reports Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
    });
  }
};