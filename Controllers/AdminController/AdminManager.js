import prisma from "../../db.js";

const ManagerListController = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || undefined;

    const managers = await prisma.employee.findMany({
      where: {
        role: "Manager", // ✅ FIXED
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
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
      ...(limit && { take: limit }),
    });

    return res.status(200).json({
      success: true,
      message: "Managers fetched successfully",
      managers,
    });

  } catch (error) {
    console.error("ManagerList Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message, // 👈 better debugging
    });
  }
};

export default ManagerListController;