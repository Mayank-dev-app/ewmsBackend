import prisma from "../../db.js";

export const getDepartments = async (req, res) => {
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


//----------------
// Get Single Department by ID
export const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Valid Department ID is required",
            });
        }

        const department = await prisma.department.findUnique({
            where: { id: Number(id) },
            include: {
                employees: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                _count: {
                    select: { employees: true },
                },
            },
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        return res.status(200).json({
            success: true,
            department,
        });

    } catch (error) {
        console.error("GET DEPARTMENT BY ID ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
        });
    }
};
