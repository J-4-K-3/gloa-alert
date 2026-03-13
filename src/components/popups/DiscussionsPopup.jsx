import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiMessageCircle,
  FiTrendingUp,
  FiThumbsUp,
  FiMessageSquare,
  FiPlus,
  FiCheck,
  FiAlertCircle,
  FiArrowLeft,
  FiSend,
  FiClock,
  FiUser,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import {
  databases,
  APPWRITE_DATABASE_ID,
  COLLECTION_DISCUSSIONS_ID,
  COLLECTION_DISCUSSION_REPLIES_ID,
  Query,
} from "../../lib/Appwrite";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Discussion categories
const CATEGORIES = {
  preparedness: { label: "Preparedness", color: "#3b82f6" },
  response: { label: "Response", color: "#f59e0b" },
  recovery: { label: "Recovery", color: "#10b981" },
  community: { label: "Community", color: "#8b5cf6" },
  general: { label: "General", color: "#6b7280" },
};

const DiscussionsPopup = ({ isOpen, onClose }) => {
  const [view, setView] = useState("list"); // 'list', 'detail', 'create'
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userUpvoted, setUserUpvoted] = useState({});
  const [showReplies, setShowReplies] = useState({});

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "general",
    author_name: "",
  });
  const [replyData, setReplyData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [showReplyNameInput, setShowReplyNameInput] = useState(true);

  const getUserId = () => {
    let userId = localStorage.getItem("groa_user_id");
    if (!userId) {
      userId = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("groa_user_id", userId);
    }
    return userId;
  };

  const fetchDiscussions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTION_DISCUSSIONS_ID,
        [Query.orderDesc("created_at"), Query.limit(50)],
      );

      const discussionsData = response.documents.map((doc) => ({
        id: doc.$id,
        title: doc.title || "",
        content: doc.content || "",
        category: doc.category || "general",
        author_name: doc.author_name || "Anonymous",
        upvotes: doc.upvotes || 0,
        upvoted_by: doc.upvoted_by || [],
        reply_count: doc.reply_count || 0,
        created_at: doc.created_at || doc.$createdAt,
      }));

      setDiscussions(discussionsData);

      // Check user upvotes
      const userId = getUserId();
      const upvotedMap = {};
      discussionsData.forEach((disc) => {
        upvotedMap[disc.id] = disc.upvoted_by.includes(userId);
      });
      setUserUpvoted(upvotedMap);
    } catch (err) {
      console.error("Error fetching discussions:", err);
      setError("Failed to load discussions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReplies = useCallback(async (discussionId) => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTION_DISCUSSION_REPLIES_ID,
        [
          Query.equal("discussion_id", discussionId),
          Query.orderAsc("created_at"),
        ],
      );

      const repliesData = response.documents.map((doc) => ({
        id: doc.$id,
        discussion_id: doc.discussion_id,
        content: doc.content || "",
        author_name: doc.author_name || "Anonymous",
        created_at: doc.created_at || doc.$createdAt,
      }));

      setReplies(repliesData);
    } catch (err) {
      console.error("Error fetching replies:", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDiscussions();
      setView("list");
      setSearchQuery("");
      setSelectedDiscussion(null);
      setReplies([]);
    }
  }, [isOpen, fetchDiscussions]);

  const filteredDiscussions = discussions.filter((disc) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      disc.title.toLowerCase().includes(query) ||
      disc.content.toLowerCase().includes(query) ||
      disc.category.toLowerCase().includes(query)
    );
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setFormError("Title is required");
      return;
    }
    if (!formData.content.trim()) {
      setFormError("Content is required");
      return;
    }
    if (!formData.author_name.trim()) {
      setFormError("Your name is required");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_DISCUSSIONS_ID,
        "unique()",
        {
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
          author_name: formData.author_name.trim(),
          upvotes: 0,
          upvoted_by: [],
          reply_count: 0,
          created_at: new Date().toISOString(),
        },
      );

      setSubmitSuccess(true);
      setFormData({
        title: "",
        content: "",
        category: "general",
        author_name: "",
      });

      await fetchDiscussions();

      setTimeout(() => {
        setSubmitSuccess(false);
        setView("list");
      }, 1500);
    } catch (err) {
      console.error("Create error:", err);
      setFormError("Failed to create discussion. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!replyData.trim()) {
      setReplyError("Reply cannot be empty");
      return;
    }
    if (!formData.author_name.trim()) {
      setReplyError("Please enter your name first");
      return;
    }

    setIsSubmittingReply(true);
    setReplyError(null);

    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_DISCUSSION_REPLIES_ID,
        "unique()",
        {
          discussion_id: selectedDiscussion.id,
          content: replyData.trim(),
          author_name: formData.author_name.trim(),
          created_at: new Date().toISOString(),
        },
      );

      // Update reply count
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_DISCUSSIONS_ID,
        selectedDiscussion.id,
        {
          reply_count: (selectedDiscussion.reply_count || 0) + 1,
        },
      );

      setReplyData("");
      await fetchReplies(selectedDiscussion.id);
      await fetchDiscussions();
      setShowReplyNameInput(false);

      // Update selected discussion
      const updated = discussions.find((d) => d.id === selectedDiscussion.id);
      if (updated) {
        setSelectedDiscussion({
          ...updated,
          reply_count: (updated.reply_count || 0) + 1,
        });
      }
    } catch (err) {
      console.error("Reply error:", err);
      setReplyError("Failed to post reply. Please try again.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleUpvote = async (discussionId) => {
    const userId = getUserId();
    const isCurrentlyUpvoted = userUpvoted[discussionId];
    const discussion = discussions.find((d) => d.id === discussionId);
    if (!discussion) return;

    // Optimistic update
    setDiscussions((prev) =>
      prev.map((d) => {
        if (d.id === discussionId) {
          return {
            ...d,
            upvotes: isCurrentlyUpvoted ? d.upvotes - 1 : d.upvotes + 1,
            upvoted_by: isCurrentlyUpvoted
              ? d.upvoted_by.filter((id) => id !== userId)
              : [...d.upvoted_by, userId],
          };
        }
        return d;
      }),
    );
    setUserUpvoted((prev) => ({
      ...prev,
      [discussionId]: !isCurrentlyUpvoted,
    }));

    try {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_DISCUSSIONS_ID,
        discussionId,
        {
          upvotes: isCurrentlyUpvoted
            ? discussion.upvotes - 1
            : discussion.upvotes + 1,
          upvoted_by: isCurrentlyUpvoted
            ? discussion.upvoted_by.filter((id) => id !== userId)
            : [...(discussion.upvoted_by || []), userId],
        },
      );
    } catch (err) {
      console.error("Upvote error:", err);
      // Revert
      setDiscussions((prev) =>
        prev.map((d) => {
          if (d.id === discussionId) {
            return {
              ...d,
              upvotes: isCurrentlyUpvoted
                ? discussion.upvotes + 1
                : discussion.upvotes - 1,
            };
          }
          return d;
        }),
      );
      setUserUpvoted((prev) => ({
        ...prev,
        [discussionId]: isCurrentlyUpvoted,
      }));
    }
  };

  const openDiscussion = (discussion) => {
    setSelectedDiscussion(discussion);
    setShowReplies({});
    fetchReplies(discussion.id);
    setView("detail");
  };

  // Render create form
  const renderCreateForm = () => (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <button
        onClick={() => {
          setView("list");
          setFormError(null);
        }}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.9rem",
          cursor: "pointer",
          marginBottom: "1.5rem",
          padding: "0.5rem 0",
        }}
      >
        <FiArrowLeft /> Back to Discussions
      </button>

      <div
        style={{
          background: "var(--card-bg)",
          borderRadius: "1rem",
          border: "1px solid var(--border-color)",
          padding: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "2rem",
            paddingBottom: "1.5rem",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              color: "white",
            }}
          >
            <FiPlus />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>
              Start a Discussion
            </h2>
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
              }}
            >
              Share your thoughts, experiences, or questions
            </p>
          </div>
        </div>

        {submitSuccess ? (
          <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                color: "white",
                margin: "0 auto 1.5rem",
              }}
            >
              <FiCheck />
            </div>
            <h3 style={{ margin: "0 0 0.5rem 0", color: "#10b981" }}>
              Discussion Created!
            </h3>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              Your discussion has been posted.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateSubmit}>
            {/* Author Name */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Your Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) =>
                  setFormData({ ...formData, author_name: e.target.value })
                }
                placeholder="Enter your name"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  color: "white",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Category <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "0.5rem",
                }}
              >
                {Object.entries(CATEGORIES).map(([key, cat]) => {
                  const isSelected = formData.category === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, category: key })
                      }
                      style={{
                        padding: "0.5rem 0.25rem",
                        background: isSelected
                          ? `${cat.color}20`
                          : "rgba(255,255,255,0.05)",
                        border: isSelected
                          ? `2px solid ${cat.color}`
                          : "1px solid var(--border-color)",
                        borderRadius: "0.5rem",
                        color: isSelected ? cat.color : "var(--text-secondary)",
                        cursor: "pointer",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Title <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Discussion title"
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  color: "white",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>

            {/* Content */}
            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Content <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Share your thoughts, experiences, or questions..."
                required
                rows={5}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  color: "white",
                  fontSize: "0.95rem",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {formError && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "0.5rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#ef4444",
                  fontSize: "0.9rem",
                }}
              >
                <FiAlertCircle />
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "1rem",
                background: isSubmitting
                  ? "var(--border-color)"
                  : "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.2s",
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      border: "2px solid white",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Creating...
                </>
              ) : (
                <>
                  <FiSend /> Post Discussion
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  // Render discussion detail with replies
  const renderDiscussionDetail = () => {
    if (!selectedDiscussion) return null;
    const cat = CATEGORIES[selectedDiscussion.category] || CATEGORIES.general;

    return (
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <button
          onClick={() => {
            setView("list");
            setSelectedDiscussion(null);
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.9rem",
            cursor: "pointer",
            marginBottom: "1.5rem",
            padding: "0.5rem 0",
          }}
        >
          <FiArrowLeft /> Back to Discussions
        </button>

        {/* Discussion Content */}
        <div
          style={{
            background: "var(--card-bg)",
            borderRadius: "1rem",
            border: "1px solid var(--border-color)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {/* Category & Time */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                padding: "0.3rem 0.75rem",
                background: `${cat.color}15`,
                border: `1px solid ${cat.color}30`,
                borderRadius: "2rem",
                color: cat.color,
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              {cat.label}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                color: "var(--text-secondary)",
                fontSize: "0.8rem",
              }}
            >
              <FiClock style={{ fontSize: "0.8rem" }} />
              {dayjs(selectedDiscussion.created_at).fromNow()}
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              margin: "0 0 1rem 0",
              fontSize: "1.4rem",
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {selectedDiscussion.title}
          </h2>

          {/* Author */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
            }}
          >
            <FiUser style={{ fontSize: "0.9rem" }} />
            {selectedDiscussion.author_name}
          </div>

          {/* Content */}
          <p
            style={{
              margin: 0,
              color: "var(--text-primary)",
              fontSize: "0.95rem",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}
          >
            {selectedDiscussion.content}
          </p>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <button
              onClick={() => handleUpvote(selectedDiscussion.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: userUpvoted[selectedDiscussion.id]
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(255,255,255,0.05)",
                border: "none",
                borderRadius: "0.5rem",
                padding: "0.5rem 0.75rem",
                color: userUpvoted[selectedDiscussion.id]
                  ? "#10b981"
                  : "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
            >
              <FiThumbsUp style={{ fontSize: "0.9rem" }} />
              {selectedDiscussion.upvotes || 0}
            </button>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
              }}
            >
              <FiMessageSquare style={{ fontSize: "0.9rem" }} />
              {selectedDiscussion.reply_count || 0} replies
            </span>
          </div>
        </div>

        {/* Replies Section */}
        <div
          style={{
            background: "var(--card-bg)",
            borderRadius: "1rem",
            border: "1px solid var(--border-color)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <button
            onClick={() =>
              setShowReplies((prev) => ({
                ...prev,
                [selectedDiscussion.id]: !prev[selectedDiscussion.id],
              }))
            }
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              marginBottom: "1rem",
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FiMessageCircle /> Replies ({replies.length})
            </span>
            {showReplies[selectedDiscussion.id] ? (
              <FiChevronUp />
            ) : (
              <FiChevronDown />
            )}
          </button>

          <AnimatePresence>
            {showReplies[selectedDiscussion.id] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: "hidden" }}
              >
                {replies.length === 0 ? (
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                      textAlign: "center",
                      padding: "1rem",
                    }}
                  >
                    No replies yet. Be the first to reply!
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {replies.map((reply, idx) => (
                      <div
                        key={reply.id}
                        style={{
                          padding: "1rem",
                          background: "rgba(255,255,255,0.02)",
                          borderRadius: "0.5rem",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.35rem",
                            }}
                          >
                            <FiUser style={{ fontSize: "0.8rem" }} />
                            {reply.author_name}
                          </span>
                          <span
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.75rem",
                            }}
                          >
                            {dayjs(reply.created_at).fromNow()}
                          </span>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.9rem",
                            color: "var(--text-secondary)",
                            lineHeight: 1.5,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reply Form */}
        <div
          style={{
            background: "var(--card-bg)",
            borderRadius: "1rem",
            border: "1px solid var(--border-color)",
            padding: "1.5rem",
          }}
        >
          <h4
            style={{
              margin: "0 0 1rem 0",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Post a Reply
          </h4>

          {/* Name input if not set */}
          {showReplyNameInput && (
            <div style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) =>
                  setFormData({ ...formData, author_name: e.target.value })
                }
                placeholder="Your name (required for posting)"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  color: "white",
                  fontSize: "0.9rem",
                  outline: "none",
                  marginBottom: "0.5rem",
                }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                }}
              >
                Enter your name once - it will be remembered for future posts
              </p>
            </div>
          )}

          <form onSubmit={handleReplySubmit}>
            <textarea
              value={replyData}
              onChange={(e) => setReplyData(e.target.value)}
              placeholder="Write your reply..."
              rows={3}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.5rem",
                color: "white",
                fontSize: "0.9rem",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                marginBottom: "1rem",
              }}
            />

            {replyError && (
              <div
                style={{
                  padding: "0.5rem 0.75rem",
                  background: "rgba(239, 68, 68, 0.1)",
                  borderRadius: "0.5rem",
                  marginBottom: "1rem",
                  color: "#ef4444",
                  fontSize: "0.85rem",
                }}
              >
                {replyError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingReply || !formData.author_name.trim()}
              style={{
                padding: "0.75rem 1.5rem",
                background:
                  isSubmittingReply || !formData.author_name.trim()
                    ? "var(--border-color)"
                    : "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor:
                  isSubmittingReply || !formData.author_name.trim()
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s",
              }}
            >
              <FiSend style={{ fontSize: "0.9rem" }} />
              {isSubmittingReply ? "Posting..." : "Post Reply"}
            </button>
          </form>
        </div>
      </div>
    );
  };

  // Render discussions list
  const renderDiscussionsList = () => (
    <div style={{ display: "grid", gap: "1rem" }}>
      {isLoading ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "1rem",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid var(--border-color)",
              borderTopColor: "#06b6d4",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Loading discussions...
          </p>
        </div>
      ) : error ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 2rem",
            background: "rgba(239, 68, 68, 0.1)",
            borderRadius: "1rem",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          <FiAlertCircle
            style={{
              fontSize: "2.5rem",
              color: "#ef4444",
              marginBottom: "1rem",
            }}
          />
          <p style={{ color: "#ef4444", margin: 0 }}>{error}</p>
          <button
            onClick={fetchDiscussions}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              background: "#06b6d4",
              border: "none",
              borderRadius: "0.5rem",
              color: "white",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      ) : filteredDiscussions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "1rem",
            border: "1px dashed var(--border-color)",
          }}
        >
          <FiMessageCircle
            style={{
              fontSize: "2.5rem",
              color: "var(--text-secondary)",
              marginBottom: "1rem",
              opacity: 0.5,
            }}
          />
          <h3
            style={{ margin: "0 0 0.5rem 0", color: "var(--text-secondary)" }}
          >
            {searchQuery
              ? "No discussions match your search"
              : "No discussions yet"}
          </h3>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            {searchQuery
              ? "Try a different search term"
              : "Be the first to start a discussion!"}
          </p>
        </div>
      ) : (
        filteredDiscussions.map((disc, idx) => {
          const cat = CATEGORIES[disc.category] || CATEGORIES.general;
          return (
            <motion.div
              key={disc.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => openDiscussion(disc)}
              style={{
                background: "var(--card-bg)",
                borderRadius: "0.75rem",
                border: "1px solid var(--border-color)",
                padding: "1.25rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#06b6d450";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.75rem",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    padding: "0.25rem 0.6rem",
                    background: `${cat.color}15`,
                    border: `1px solid ${cat.color}30`,
                    borderRadius: "2rem",
                    color: cat.color,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  {cat.label}
                </span>
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <FiClock style={{ fontSize: "0.7rem" }} />
                  {dayjs(disc.created_at).fromNow()}
                </span>
              </div>

              <h3
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  lineHeight: 1.3,
                }}
              >
                {disc.title}
              </h3>

              <p
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {disc.content}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--border-color)",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.8rem",
                  }}
                >
                  <FiUser style={{ fontSize: "0.8rem" }} />
                  {disc.author_name}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    color: userUpvoted[disc.id]
                      ? "#10b981"
                      : "var(--text-secondary)",
                    fontSize: "0.8rem",
                  }}
                >
                  <FiThumbsUp style={{ fontSize: "0.8rem" }} />
                  {disc.upvotes || 0}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.8rem",
                  }}
                >
                  <FiMessageSquare style={{ fontSize: "0.8rem" }} />
                  {disc.reply_count || 0} replies
                </span>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "2rem",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{
          width: "90%",
          maxWidth: "800px",
          maxHeight: "90vh",
          background: "var(--bg-color)",
          borderRadius: "1.5rem",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background:
              view === "list"
                ? "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.05) 100%)"
                : "transparent",
            flexShrink: 0,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                color: "white",
                boxShadow: "0 4px 12px rgba(6, 182, 212, 0.3)",
              }}
            >
              <FiMessageCircle />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
                Discussions
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                }}
              >
                Community conversations about emergency preparedness
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "var(--hover-bg)")
            }
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            <FiX />
          </button>
        </div>

        {/* Search & Create Button - Only in list view */}
        {view === "list" && (
          <div
            style={{
              padding: "1rem 1.5rem",
              background: "rgba(255,255,255,0.01)",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              gap: "1rem",
              flexShrink: 0,
            }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <FiTrendingUp
                style={{
                  position: "absolute",
                  left: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-secondary)",
                }}
              />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.65rem 0.875rem 0.65rem 2.5rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  color: "white",
                  outline: "none",
                  fontSize: "0.875rem",
                }}
              />
            </div>
            <button
              onClick={() => setView("create")}
              style={{
                padding: "0.65rem 1.25rem",
                background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(6, 182, 212, 0.3)",
                transition: "all 0.2s",
              }}
            >
              <FiPlus style={{ fontSize: "1rem" }} />
              New Discussion
            </button>
          </div>
        )}

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: view === "list" ? "1.5rem" : "1.5rem 0",
          }}
        >
          <AnimatePresence mode="wait">
            {view === "list" ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {renderDiscussionsList()}
              </motion.div>
            ) : view === "create" ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderCreateForm()}
              </motion.div>
            ) : (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderDiscussionDetail()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Animation keyframes */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
};

export default DiscussionsPopup;
