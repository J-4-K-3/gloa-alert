import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiEye,
  FiMapPin,
  FiClock,
  FiSearch,
  FiPlus,
  FiCheck,
  FiAlertCircle,
  FiArrowLeft,
  FiShield,
  FiThumbsUp,
  FiAlertTriangle,
  FiActivity,
  FiTool,
  FiHelpCircle,
} from "react-icons/fi";
import {
  databases,
  APPWRITE_DATABASE_ID,
  COLLECTION_ANONYMOUS_TIPS_ID,
  Query,
} from "../../lib/Appwrite";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Category configuration with colors
const CATEGORIES = {
  safety: { label: "Safety Concern", color: "#ef4444", icon: FiShield },
  infrastructure: { label: "Infrastructure", color: "#f59e0b", icon: FiTool },
  crime: { label: "Crime/Security", color: "#8b5cf6", icon: FiAlertTriangle },
  health: { label: "Health Hazard", color: "#10b981", icon: FiActivity },
  other: { label: "Other", color: "#6b7280", icon: FiHelpCircle },
};

const AnonymousTipsPopup = ({ isOpen, onClose }) => {
  const [view, setView] = useState("list");
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [userUpvoted, setUserUpvoted] = useState({});

  // Upload form state
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    category: "safety",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Generate a simple user ID (in production, use actual user auth)
  const getUserId = () => {
    let userId = localStorage.getItem("groa_user_id");
    if (!userId) {
      userId = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("groa_user_id", userId);
    }
    return userId;
  };

  // Fetch tips from Appwrite
  const fetchTips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTION_ANONYMOUS_TIPS_ID,
        [Query.orderDesc("created_at"), Query.limit(50)],
      );

      const tipsData = response.documents.map((doc) => ({
        id: doc.$id,
        description: doc.description || "",
        location: doc.location || "",
        category: doc.category || "other",
        is_verified: doc.is_verified || false,
        upvotes: doc.upvotes || 0,
        upvoted_by: doc.upvoted_by || [],
        created_at: doc.created_at || doc.$createdAt,
      }));

      setTips(tipsData);

      // Check which tips user has upvoted
      const userId = getUserId();
      const upvotedMap = {};
      tipsData.forEach((tip) => {
        upvotedMap[tip.id] = tip.upvoted_by.includes(userId);
      });
      setUserUpvoted(upvotedMap);
    } catch (err) {
      console.error("Error fetching tips:", err);
      setError("Failed to load anonymous tips. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on open
  useEffect(() => {
    if (isOpen) {
      fetchTips();
      setView("list");
      setSearchQuery("");
    }
  }, [isOpen, fetchTips]);

  // Filter tips based on search query
  const filteredTips = tips.filter((tip) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      tip.description.toLowerCase().includes(query) ||
      tip.location.toLowerCase().includes(query) ||
      tip.category.toLowerCase().includes(query)
    );
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      setUploadError("Description is required");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_ANONYMOUS_TIPS_ID,
        "unique()",
        {
          description: formData.description.trim(),
          location: formData.location.trim() || "",
          category: formData.category,
          is_verified: false,
          upvotes: 0,
          upvoted_by: [],
          created_at: new Date().toISOString(),
        },
      );

      setUploadSuccess(true);
      setFormData({
        description: "",
        location: "",
        category: "safety",
      });

      await fetchTips();

      setTimeout(() => {
        setUploadSuccess(false);
        setView("list");
      }, 1500);
    } catch (err) {
      console.error("Submit error:", err);
      setUploadError("Failed to submit tip. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle upvote/unvote
  const handleUpvote = async (tipId) => {
    const userId = getUserId();
    const isCurrentlyUpvoted = userUpvoted[tipId];

    // Optimistic UI update
    setTips((prev) =>
      prev.map((tip) => {
        if (tip.id === tipId) {
          return {
            ...tip,
            upvotes: isCurrentlyUpvoted ? tip.upvotes - 1 : tip.upvotes + 1,
            upvoted_by: isCurrentlyUpvoted
              ? tip.upvoted_by.filter((id) => id !== userId)
              : [...tip.upvoted_by, userId],
          };
        }
        return tip;
      }),
    );
    setUserUpvoted((prev) => ({ ...prev, [tipId]: !isCurrentlyUpvoted }));

    try {
      const tip = tips.find((t) => t.id === tipId);
      if (!tip) return;

      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_ANONYMOUS_TIPS_ID,
        tipId,
        {
          upvotes: isCurrentlyUpvoted ? tip.upvotes - 1 : tip.upvotes + 1,
          upvoted_by: isCurrentlyUpvoted
            ? tip.upvoted_by.filter((id) => id !== userId)
            : [...tip.upvoted_by, userId],
        },
      );
    } catch (err) {
      console.error("Upvote error:", err);
      // Revert on error
      setTips((prev) =>
        prev.map((tip) => {
          if (tip.id === tipId) {
            return {
              ...tip,
              upvotes: isCurrentlyUpvoted ? tip.upvotes + 1 : tip.upvotes - 1,
              upvoted_by: isCurrentlyUpvoted
                ? [...tip.upvoted_by, userId]
                : tip.upvoted_by.filter((id) => id !== userId),
            };
          }
          return tip;
        }),
      );
      setUserUpvoted((prev) => ({ ...prev, [tipId]: isCurrentlyUpvoted }));
    }
  };

  // Render upload form
  const renderUploadForm = () => (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      {/* Back button */}
      <button
        onClick={() => {
          setView("list");
          setUploadError(null);
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
        <FiArrowLeft /> Back to Anonymous Tips
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
              background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
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
              Submit Anonymous Tip
            </h2>
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
              }}
            >
              Share information anonymously to help keep the community safe
            </p>
          </div>
        </div>

        {uploadSuccess ? (
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
              Tip Submitted!
            </h3>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              Your anonymous tip has been shared with the community.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
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
                  const Icon = cat.icon;
                  const isSelected = formData.category === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: key })}
                      style={{
                        padding: "0.6rem 0.5rem",
                        background: isSelected
                          ? `${cat.color}20`
                          : "rgba(255,255,255,0.05)",
                        border: isSelected
                          ? `2px solid ${cat.color}`
                          : "1px solid var(--border-color)",
                        borderRadius: "0.5rem",
                        color: isSelected ? cat.color : "var(--text-secondary)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        transition: "all 0.2s",
                      }}
                    >
                      <Icon style={{ fontSize: "1rem" }} />
                      {cat.label.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location (optional) */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Location{" "}
                <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>
                  (optional)
                </span>
              </label>
              <div style={{ position: "relative" }}>
                <FiMapPin
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-secondary)",
                  }}
                />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Downtown, Main St., Industrial Zone"
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem 0.75rem 2.75rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    color: "white",
                    fontSize: "0.95rem",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Description (required) */}
            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Description <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what you observed. Include specific details like location, time, and what you saw..."
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

            {/* Error message */}
            {uploadError && (
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
                {uploadError}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isUploading}
              style={{
                width: "100%",
                padding: "1rem",
                background: isUploading
                  ? "var(--border-color)"
                  : "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: isUploading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.2s",
              }}
            >
              {isUploading ? (
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
                  Submitting...
                </>
              ) : (
                <>
                  <FiCheck /> Submit Anonymously
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Privacy Notice */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1.25rem",
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          borderRadius: "0.75rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
        }}
      >
        <FiShield
          style={{ color: "#10b981", fontSize: "1.25rem", flexShrink: 0, marginTop: "0.1rem" }}
        />
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#10b981", marginBottom: "0.25rem" }}>
            Your Privacy is Protected
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            All submissions are completely anonymous. No IP addresses, device information, or personal data is collected or stored.
          </div>
        </div>
      </div>
    </div>
  );

  // Render tips list
  const renderTipsList = () => (
    <div style={{ display: "grid", gap: "0.75rem" }}>
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
              borderTopColor: "#8b5cf6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Loading anonymous tips...
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
            onClick={fetchTips}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              background: "#8b5cf6",
              border: "none",
              borderRadius: "0.5rem",
              color: "white",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      ) : filteredTips.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "1rem",
            border: "1px dashed var(--border-color)",
          }}
        >
          <FiEye
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
              ? "No tips match your search"
              : "No anonymous tips yet"}
          </h3>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            {searchQuery
              ? "Try a different search term"
              : "Be the first to share important information anonymously!"}
          </p>
        </div>
      ) : (
        filteredTips.map((tip, idx) => {
          const cat = CATEGORIES[tip.category] || CATEGORIES.other;
          const Icon = cat.icon;
          
          return (
            <motion.div
              key={tip.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                background: "var(--card-bg)",
                borderRadius: "0.75rem",
                border: "1px solid var(--border-color)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "1rem" }}>
                {/* Header Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.3rem 0.65rem",
                        background: `${cat.color}15`,
                        border: `1px solid ${cat.color}30`,
                        borderRadius: "2rem",
                        color: cat.color,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.3px",
                      }}
                    >
                      <Icon style={{ fontSize: "0.75rem" }} />
                      {cat.label}
                    </span>
                    {tip.is_verified && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.25rem 0.5rem",
                          background: "rgba(16, 185, 129, 0.15)",
                          borderRadius: "2rem",
                          color: "#10b981",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                        }}
                      >
                        <FiCheck style={{ fontSize: "0.7rem" }} />
                        Verified
                      </span>
                    )}
                  </div>
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
                    {dayjs(tip.created_at).fromNow()}
                  </span>
                </div>

                {/* Content */}
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    marginBottom: tip.location ? "0.75rem" : "0",
                  }}
                >
                  {tip.description}
                </p>

                {/* Location & Actions Row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--border-color)",
                  }}
                >
                  {tip.location ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                      }}
                    >
                      <FiMapPin style={{ fontSize: "0.85rem", color: "#8b5cf6" }} />
                      {tip.location}
                    </div>
                  ) : (
                    <div />
                  )}
                  
                  <button
                    onClick={() => handleUpvote(tip.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      background: userUpvoted[tip.id]
                        ? "rgba(139, 92, 246, 0.15)"
                        : "rgba(255,255,255,0.05)",
                      border: "none",
                      borderRadius: "2rem",
                      padding: "0.4rem 0.75rem",
                      color: userUpvoted[tip.id]
                        ? "#8b5cf6"
                        : "var(--text-secondary)",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      transition: "all 0.2s",
                    }}
                  >
                    <FiThumbsUp style={{ fontSize: "0.85rem" }} />
                    {tip.upvotes || 0}
                  </button>
                </div>
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
          maxWidth: "700px",
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
                ? "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(109, 40, 217, 0.05) 100%)"
                : "transparent",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                color: "white",
                boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
              }}
            >
              <FiEye />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
                Anonymous Tips
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                }}
              >
                Anonymous safety tips and reports from the community
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

        {/* Search & Add Button - Only in list view */}
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
              <FiSearch
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
                placeholder="Search words, places, categories..."
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
              onClick={() => setView("upload")}
              style={{
                padding: "0.65rem 1.25rem",
                background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
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
                boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)",
                transition: "all 0.2s",
              }}
            >
              <FiPlus style={{ fontSize: "1rem" }} />
              Add Tip
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
                {renderTipsList()}
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderUploadForm()}
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

export default AnonymousTipsPopup;

