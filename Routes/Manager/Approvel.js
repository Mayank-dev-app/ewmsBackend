import express from "express";
import {
  getCompletedApprovals,
  // createApproval,
  // getApprovals,
  // updateApprovalStatus,
  // addComment,
  // getComments,
  // getPendingApprovals,
  getSingleApproval,
  handleApproval,
  // handleRejected,
  rejectApproval,
} from "../../Controllers/ManagerController/ApprovelController.js";

import { verifyToken, checkRole } from "../../Middleware/authmiddleware.js";
// import { uploadApproval } from "../../Middleware/cloudinaryStorge.js";

const router = express.Router();

// // 🔥 Employee → create approval
// router.post(
//   "/approval",
//   verifyToken,
//   uploadApproval.array("files", 5),
//   createApproval
// );

// // 🔥 Manager → get all approvals
// router.get(
//   "/approvals",
//   verifyToken,
//   checkRole("Manager"),
//   getApprovals
// );

// // 🔥 Manager → approve/reject
// router.put(
//   "/approval/:id",
//   verifyToken,
//   checkRole("Manager"),
//   updateApprovalStatus
// );

// // 🔥 Add comment
// router.post(
//   "/approval/:id/comment",
//   verifyToken,
//   addComment
// );

// // 🔥 Get comments
// router.get(
//   "/approval/:id/comments",
//   verifyToken,
//   getComments
// );



router.get(
  "/approvals",
  verifyToken,
  checkRole("Manager"),
  getCompletedApprovals
);

router.put(
  "/approval/:id",
  verifyToken,
  checkRole("Manager"),
  handleApproval
);

router.get(
  "/approval/:id",
  verifyToken,
  checkRole("Manager"),
  getSingleApproval
);


router.put(
  "/reject/:id",
  verifyToken,
  checkRole("Manager"),
  rejectApproval
)
export default router;