import prisma from "../../db.js";

export const updateWork = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const { taskId } = req.params;

    const id = Number(taskId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID",
      });
    }

    // ✅ Check task exists
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // =============================
    // 1️⃣ STATUS UPDATE
    // =============================
    let updatedStatus = task.status;
    let completedAt = task.completedAt;

    if (status) {
      updatedStatus = status;
      if (status === "Completed") {
        completedAt = new Date();
      }
    }

    // =============================
    // 2️⃣ COMMENTS UPDATE (JSON)
    // =============================
    let updatedComments = task.comments || [];

    if (comment && comment.trim() !== "" && req.user?.id) {
      updatedComments.push({
        id: Date.now().toString(),
        text: comment,
        by: req.user.id,
        at: new Date(),
      });
    }

    // =============================
    // 3️⃣ FILE UPLOAD UPDATE (JSON)
    // =============================
    let updatedUploads = task.uploads || [];

    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map((file) => ({
        id: Date.now().toString() + Math.random(),
        name: file.originalname || "Unknown",
        url: file.path || file.secure_url || "",
        at: new Date(),
      }));

      updatedUploads = [...updatedUploads, ...newFiles];
    }

    // =============================
    // 4️⃣ FINAL UPDATE
    // =============================
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: updatedStatus,
        completedAt: completedAt,
        comments: updatedComments,
        uploads: updatedUploads,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask,
    });

  } catch (err) {
    console.error("UpdateWork Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};