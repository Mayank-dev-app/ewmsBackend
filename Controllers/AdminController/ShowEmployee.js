import prisma from "../../db.js";

// 👉 GET ALL EMPLOYEES
export const GetAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: {
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

    return res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });

  } catch (error) {
    console.error("Get Employees Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message, // 👈 better debugging
    });
  }
};


//Get Employee Byy Id
export const getEmployeeById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invalid Employee ID",
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      employee,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE EMPLOYEE BY ID
export const updateEmployee = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Employee ID",
      });
    }

    const { name, email, role, status, department } = req.body;

    // ✅ Check exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // ✅ Email check
    if (email && email !== existingEmployee.email) {
      const emailExists = await prisma.employee.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    const deptId = department
      ? Number(department)
      : existingEmployee.departmentId;

    if (role === "Manager") {
      const existingManager = await prisma.employee.findFirst({
        where: {
          departmentId: deptId, // ✅ correct dept
          role: "Manager",
          NOT: { id },
        },
      });

      if (existingManager) {
        return res.status(400).json({
          success: false,
          message: "This department already has a Manager!",
        });
      }
    }

    // ✅ Image
    let imageUrl = existingEmployee.image;
    if (req.file?.path) {
      imageUrl = req.file.path;
    }


    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        name: name || existingEmployee.name,
        email: email || existingEmployee.email,
        role: role || existingEmployee.role,
        status: status || existingEmployee.status,
        image: imageUrl,

        department: {
          connect: {
            id: deptId, // ✅ always safe
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });

  } catch (error) {
    console.error("Update Employee Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};