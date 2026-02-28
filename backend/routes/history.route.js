import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  getHistoryList,
  getConversation,
  createConversation,
  addMessage,
  deleteConversation,
  updateConversation,
} from "../controllers/history.controller.js";

const router = express.Router();

// All history routes require authentication
router.use(verifyToken);

// GET  /api/history?cursor=<cursor>&limit=20  — fast paginated sidebar list
router.get("/", getHistoryList);

// GET  /api/history/:id  — full conversation loaded on-demand
router.get("/:id", getConversation);

// POST /api/history  — create new conversation
router.post("/", createConversation);

// PUT  /api/history/:id  — update conversation title
router.put("/:id", updateConversation);

// PUT  /api/history/:id/message  — append message to conversation
router.put("/:id/message", addMessage);

// DELETE /api/history/:id  — delete conversation
router.delete("/:id", deleteConversation);

export default router;
