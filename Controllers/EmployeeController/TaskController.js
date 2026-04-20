import prisma from "../../db.js";
import crypto from "crypto";

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        employee: {
          id: Number(req.user.id),
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

    return res.json({
      success: true,
      tasks,
    });

  } catch (err) {
    console.error("GetMyTasks Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ⭐ 2. Update task status

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { taskId } = req.params;

    const id = Number(taskId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID",
      });
    }

    const allowedStatus = ["Pending", "In Progress", "Completed"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (existingTask.employeeId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ✅ STEP 1: Update Task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status,
        completedAt: status === "Completed" ? new Date() : null,
      },
    });

    // ✅ STEP 2: Auto Sync Approval (IMPORTANT 🔥)
    await prisma.approval.updateMany({
      where: {
        taskId: existingTask.id,
        employeeId: req.user.id,
      },
      data: {
        status: status === "Completed" ? "Completed" : "Pending",
        description: existingTask.description,
        files: existingTask.uploads || [],
      },
    });

    // ✅ STEP 3: Agar approval exist nahi karta → create karo
    if (status === "Completed") {
      const alreadyExists = await prisma.approval.findFirst({
        where: {
          taskId: existingTask.id,
          employeeId: req.user.id,
        },
      });

      if (!alreadyExists) {
        await prisma.approval.create({
          data: {
            type: "submission",
            status: "Completed",
            employeeId: req.user.id,
            departmentId: existingTask.departmentId,
            taskId: existingTask.id, // ✅ MOST IMPORTANT
            description: existingTask.description,
            files: existingTask.uploads || [],
            employeeComment: "Task completed, please review",
            updatedAt: new Date(),
          },
        });
      }
    }

    return res.json({
      success: true,
      message: "Task & Approval synced successfully",
      task: updatedTask,
    });

  } catch (err) {
    console.error("UpdateTaskStatus Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ⭐ 3. Upload files
export const uploadFiles = async (req, res) => {
  try {
    const { taskId } = req.params;
    const id = Number(taskId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // ✅ Authorization
    if (task.employeeId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ✅ Safe existing uploads
    const existingUploads = Array.isArray(task.uploads)
      ? task.uploads
      : [];

    // ✅ Create uploads
    const uploads = req.files.map((file) => ({
      id: crypto.randomUUID(), // 🔥 better than Date.now
      name: file.originalname,
      url: file.path,
    }));

    const updatedUploads = [...existingUploads, ...uploads];

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        uploads: updatedUploads // ✅ sync here
      },
    });

    await prisma.approval.updateMany({
      where: {
        taskId: id,
      },
      data: {
        files: updatedUploads,
      },
    });
    
    return res.json({
      success: true,
      message: "Files uploaded successfully",
      task: updatedTask,
    });

  } catch (err) {
    console.error("UploadFiles Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ⭐ 4. Add comment
export const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Comment text required",
      });
    }

    const id = Number(taskId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID",
      });
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // ✅ Authorization
    if (task.employeeId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ✅ Existing comments
    const existingComments = Array.isArray(task.comments)
      ? task.comments
      : [];

    // ✅ New comment object
    const comment = {
      id: crypto.randomUUID(),
      text,
      author: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role,
      },
      at: new Date(),
    };

    const updatedComments = [...existingComments, comment];

    // ✅ STEP 1: Update Task
    // ✅ Task update
    await prisma.task.update({
      where: { id },
      data: {
        comments: updatedComments,
      },
    });

    // ✅ Approval comment create (BEST)
    const approvals = await prisma.approval.findMany({
      where: {
        taskId: id,
        employeeId: req.user.id,
      },
    });

    for (const approval of approvals) {
      await prisma.approvalcomment.create({
        data: {
          approvalId: approval.id,
          userId: req.user.id,
          message: text,
          role: req.user.role,
        },
      });
    }

    return res.json({
      success: true,
      message: "Comment added & synced to approval",
      comment,
      task: updatedComments,
    });

  } catch (err) {
    console.error("AddComment Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ⭐ 5. Remove uploaded file
export const removeUpload = async (req, res) => {
  try {
    const { taskId, uploadId } = req.params;
    const id = Number(taskId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID",
      });
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // ✅ Authorization
    if (task.employeeId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const existingUploads = Array.isArray(task.uploads)
      ? task.uploads
      : [];

    // ✅ check upload exists
    const fileToDelete = existingUploads.find(u => u.id === uploadId);

    if (!fileToDelete) {
      return res.status(404).json({
        success: false,
        message: "Upload not found",
      });
    }

    // ✅ (Optional) delete from cloudinary
    if (fileToDelete.url) {
      const publicId = fileToDelete.url.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const updatedUploads = existingUploads.filter(
      (u) => u.id !== uploadId
    );

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        uploads: updatedUploads,
      },
    });

    return res.json({
      success: true,
      message: "Upload removed successfully",
      uploads: updatedTask.uploads,
    });

  } catch (err) {
    console.error("RemoveUpload Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};