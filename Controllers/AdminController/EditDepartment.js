import prisma from "../../db.js";

export const updateDepartment = async (req, res) => {
  try {
    const deptId = Number(req.params.id);
    const { name, description } = req.body;

    // ✅ Validate
    if (!deptId) {
      return res.status(400).json({
        success: false,
        message: "Valid Department ID is required",
      });
    }

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department name is required",
      });
    }

    // ✅ Check department exists
    const existingDept = await prisma.department.findUnique({
      where: { id: deptId },
    });

    if (!existingDept) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // ✅ Check duplicate name (optional but recommended)
    const duplicate = await prisma.department.findFirst({
      where: {
        name: name.trim(),
        NOT: { id: deptId },
      },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Department with this name already exists",
      });
    }

    // ✅ Image handling (Cloudinary)
    let iconUrl = existingDept.icon;

    if (req.file?.path) {
      iconUrl = req.file.path;
    }

    // ✅ Update
    const updatedDept = await prisma.department.update({
      where: { id: deptId },
      data: {
        name: name.trim(),
        description: description || existingDept.description,
        icon: iconUrl,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department: updatedDept,
    });

  } catch (error) {
    console.error("UPDATE DEPARTMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error during department update",
    });
  }
};