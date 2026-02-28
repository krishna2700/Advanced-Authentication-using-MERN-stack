import mongoose from "mongoose";
import { ChatHistory } from "../models/chatHistory.model.js";

const DEFAULT_PAGE_SIZE = 20;

/**
 * GET /api/history?cursor=<updatedAt>_<id>&limit=20
 *
 * Cursor-based pagination for instant sidebar loading.
 * Returns lightweight summaries only (no messages array).
 * Uses compound index { userId, updatedAt, _id } for O(1) seek.
 */
export const getHistoryList = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = Math.min(parseInt(req.query.limit) || DEFAULT_PAGE_SIZE, 50);
    const cursor = req.query.cursor; // format: "<updatedAt_iso>_<objectId>"

    const query = { userId: new mongoose.Types.ObjectId(userId) };

    // Cursor-based seek: fetch items older than the cursor point
    if (cursor) {
      const [cursorDate, cursorId] = cursor.split("_");
      const cursorUpdatedAt = new Date(cursorDate);

      if (isNaN(cursorUpdatedAt.getTime()) || !mongoose.Types.ObjectId.isValid(cursorId)) {
        return res.status(400).json({ success: false, message: "Invalid cursor format" });
      }

      // Seek past the cursor: items with older updatedAt, or same updatedAt but smaller _id
      query.$or = [
        { updatedAt: { $lt: cursorUpdatedAt } },
        {
          updatedAt: cursorUpdatedAt,
          _id: { $lt: new mongoose.Types.ObjectId(cursorId) },
        },
      ];
    }

    const conversations = await ChatHistory.find(query)
      .select("_id title updatedAt createdAt") // Projection: no messages payload
      .sort({ updatedAt: -1, _id: -1 })
      .limit(limit + 1) // Fetch one extra to determine if there's a next page
      .lean(); // Skip Mongoose hydration for ~5x speed boost

    const hasMore = conversations.length > limit;
    const results = hasMore ? conversations.slice(0, limit) : conversations;

    // Build next cursor from the last item
    let nextCursor = null;
    if (hasMore && results.length > 0) {
      const last = results[results.length - 1];
      nextCursor = `${new Date(last.updatedAt).toISOString()}_${last._id}`;
    }

    return res.status(200).json({
      success: true,
      conversations: results,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("getHistoryList error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/history/:id
 *
 * Fetch a single conversation with full messages.
 * Only loaded on-demand when user clicks into a chat.
 */
export const getConversation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid conversation ID" });
    }

    const conversation = await ChatHistory.findOne({
      _id: id,
      userId: req.userId,
    }).lean();

    if (!conversation) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    return res.status(200).json({ success: true, conversation });
  } catch (error) {
    console.error("getConversation error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * POST /api/history
 *
 * Create a new conversation. Optionally include the first message.
 */
export const createConversation = async (req, res) => {
  try {
    const { title, message } = req.body;

    const messages = [];
    if (message?.role && message?.content) {
      messages.push({ role: message.role, content: message.content });
    }

    const conversation = await ChatHistory.create({
      userId: req.userId,
      title: title || (message?.content?.substring(0, 100) || "New Chat"),
      messages,
    });

    return res.status(201).json({
      success: true,
      conversation: {
        _id: conversation._id,
        title: conversation.title,
        updatedAt: conversation.updatedAt,
        createdAt: conversation.createdAt,
        messages: conversation.messages,
      },
    });
  } catch (error) {
    console.error("createConversation error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PUT /api/history/:id/message
 *
 * Append a message to an existing conversation.
 * Uses $push for atomic append without loading the full document.
 */
export const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, content } = req.body;

    if (!role || !content) {
      return res.status(400).json({ success: false, message: "role and content are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid conversation ID" });
    }

    // Atomic $push — no need to load the full messages array into memory
    const result = await ChatHistory.findOneAndUpdate(
      { _id: id, userId: req.userId },
      {
        $push: { messages: { role, content } },
        $set: { updatedAt: new Date() }, // Bump updatedAt so it rises to top of list
      },
      { new: true, projection: { messages: { $slice: -1 }, title: 1, updatedAt: 1 } }
    ).lean();

    if (!result) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    return res.status(200).json({
      success: true,
      message: result.messages[0],
      updatedAt: result.updatedAt,
    });
  } catch (error) {
    console.error("addMessage error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * DELETE /api/history/:id
 */
export const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid conversation ID" });
    }

    const result = await ChatHistory.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!result) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    return res.status(200).json({ success: true, message: "Conversation deleted" });
  } catch (error) {
    console.error("deleteConversation error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * PUT /api/history/:id
 *
 * Update conversation title.
 */
export const updateConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "title is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid conversation ID" });
    }

    const result = await ChatHistory.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { $set: { title } },
      { new: true, projection: { _id: 1, title: 1, updatedAt: 1 } }
    ).lean();

    if (!result) {
      return res.status(404).json({ success: false, message: "Conversation not found" });
    }

    return res.status(200).json({ success: true, conversation: result });
  } catch (error) {
    console.error("updateConversation error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
