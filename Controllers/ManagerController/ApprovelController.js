import prisma from "../../db.js";

// // ==============================
// // 🔥 1. CREATE APPROVAL (Employee)
// // ==============================
// export const createApproval = async (req, res) => {
//   try {
//     const {
//       type,
//       reason,
//       from,
//       to,
//       task,
//       description,
//       requestTitle,
//       employeeComment,
//     } = req.body;

//     // validation
//     if (!type) {
//       return res.status(400).json({ message: "Type is required" });
//     }

//     const allowedTypes = ["leave", "submission", "request"];
//     if (!allowedTypes.includes(type)) {
//       return res.status(400).json({ message: "Invalid type" });
//     }

//     // files
//     const files = req.files?.map((file) => file.filename) || [];

//     const approval = await prisma.approval.create({
//       data: {
//         type,
//         employeeId: req.user.id,
//         departmentId: req.user.departmentId,

//         ...(reason && { reason }),
//         ...(from && { from: new Date(from) }),
//         ...(to && { to: new Date(to) }),

//         ...(task && { task }),
//         ...(description && { description }),

//         ...(requestTitle && { requestTitle }),
//         ...(employeeComment && { employeeComment }),

//         ...(files.length > 0 && { files }),
//       },
//     });

//     res.json({
//       success: true,
//       message: "Approval submitted successfully",
//       data: approval,
//     });
//   } catch (err) {
//     console.log("Create Approval Error:", err);
//     res.status(500).json({ message: "Create approval failed" });
//   }
// };

// // ==============================
// // 🔥 2. GET ALL APPROVALS
// // ==============================
// export const getApprovals = async (req, res) => {
//   try {
//     const approvals = await prisma.approval.findMany({
//       include: {
//         employee: { select: { id: true, name: true } },
//         department: { select: { id: true, name: true } },
//         comments: {
//           include: {
//             user: { select: { id: true, name: true } }
//           }
//         }
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     res.json(approvals);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Fetch failed" });
//   }
// };

// // ==============================
// // 🔥 3. APPROVE / REJECT
// // ==============================
// export const updateApprovalStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, managerComment } = req.body;

//     const allowed = ["Pending", "Approved", "Rejected"];
//     if (!allowed.includes(status)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const updated = await prisma.approval.update({
//       where: { id: Number(id) },
//       data: {
//         status,
//         managerComment,
//       },
//     });

//     res.json({
//       success: true,
//       message: "Status updated",
//       data: updated,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Update failed" });
//   }
// };

// // ==============================
// // 🔥 4. COMMENT SYSTEM (CHAT STYLE)
// // ==============================
// export const addComment = async (req, res) => {
//   try {
//     const { approvalId, message } = req.body;

//     const comment = await prisma.approvalComment.create({
//       data: {
//         approvalId: Number(approvalId),
//         userId: req.user.id,
//         role: req.user.role,
//         message,
//       },
//     });

//     res.json({
//       success: true,
//       message: "Comment added",
//       data: comment,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Comment failed" });
//   }
// };

// // ==============================
// // 🔥 5. GET COMMENTS (CHAT HISTORY)
// // ==============================
// export const getComments = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const comments = await prisma.approvalComment.findMany({
//       where: { approvalId: Number(id) },
//       include: {
//         user: {
//           select: { id: true, name: true },
//         },
//       },
//       orderBy: { createdAt: "asc" },
//     });

//     res.json(comments);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Fetch comments failed" });
//   }
// };

export const getCompletedApprovals = async (req, res) => {
  try {
    const approvals = await prisma.approval.findMany({
      where: {
        status: "Completed",
        departmentId: req.user.departmentId,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
          },
        },

        // ✅ Agar files relation hai (recommended)
        //  files: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      approvals,
    });

  } catch (err) {
    console.error("Get Completed Approvals Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const handleApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, managerComment } = req.body;

    const approval = await prisma.approval.findUnique({
      where: { id: Number(id) },
    });

    if (!approval) {
      return res.status(404).json({ message: "Approval not found" });
    }

    // 🔥 ONE TRANSACTION FOR BOTH
    await prisma.$transaction([
      prisma.approval.update({
        where: { id: Number(id) },
        data: {
          status,
          managerComment, // ✅ after schema fix
        },
      }),

      prisma.task.update({
        where: {
          id: approval.taskId,
        },
        data: {
          status, // ✅ only this
        },
      }),
    ]);

    return res.json({
      success: true,
      message: "Approval + Task updated successfully",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating approval" });
  }
};

export const getSingleApproval = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const approval = await prisma.approval.findUnique({
      where: { id: Number(id) },
      include: {
        employee: true,
        comments: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    return res.json({
      success: true,
      approval,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
};

export const rejectApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerComment } = req.body;

    const approvalId = Number(id);

    // ❌ validate id
    if (isNaN(approvalId)) {
      return res.status(400).json({ message: "Invalid approval ID" });
    }

    // ❌ validate comment
    if (!managerComment || !managerComment.trim()) {
      return res.status(400).json({ message: "Manager comment is required" });
    }

    // 🔍 find approval
    const approval = await prisma.approval.findUnique({
      where: { id: approvalId },
    });

    if (!approval) {
      return res.status(404).json({ message: "Approval not found" });
    }

    if (!approval.taskId) {
      return res.status(400).json({
        message: "No task linked with this approval",
      });
    }

    // 🔥 TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      
      // 1️⃣ Update Approval
      const updatedApproval = await tx.approval.update({
        where: { id: approvalId },
        data: {
          status: "In Progress",
          managerComment,
        },
      });

      // 2️⃣ Update Task safely (IMPORTANT FIX)
      const existingTask = await tx.task.findUnique({
        where: { id: approval.taskId },
      });

      const updatedTask = await tx.task.update({
        where: { id: approval.taskId },
        data: {
          status: "In Progress",

          // ✅ SAFE comments handling
          comments: [
            ...(Array.isArray(existingTask?.comments)
              ? existingTask.comments
              : []),

            {
              id: crypto.randomUUID(),
              text: managerComment,
              by: {
                id: req.user.id,
                name: req.user.name,
                role: "Manager",
              },
              at: new Date(),
            },
          ],
        },
      });

      return { updatedApproval, updatedTask };
    });

    console.log("RESULT:", result);

    return res.json({
      success: true,
      message: "Moved to In Progress successfully",
      data: result,
    });

  } catch (err) {
    console.error("REJECT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Server error while rejecting approval",
      error: err.message,
    });
  }
};