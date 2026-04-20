import prisma from "../../db.js";

const getAllTasks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || undefined;

    const tasks = await prisma.task.findMany({
      include: {
        employee: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(limit && { take: limit }),
    });

    res.json({
      success: true,
      tasks,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export default getAllTasks;