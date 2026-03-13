import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiCheckSquare,
  FiPlus,
  FiCheck,
  FiAlertCircle,
  FiArrowLeft,
  FiSearch,
  FiClock,
  FiUsers,
  FiBarChart2,
  FiFilter,
} from "react-icons/fi";
import {
  databases,
  APPWRITE_DATABASE_ID,
  COLLECTION_VOTINGS_ID,
  Query,
} from "../../lib/Appwrite";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// Voting categories
const CATEGORIES = {
  emergency: { label: "Emergency", color: "#ef4444" },
  feature: { label: "Feature", color: "#06b6d4" },
  resource: { label: "Resource", color: "#8b5cf6" },
  governance: { label: "Governance", color: "#10b981" },
};

const VotingsPopup = ({ isOpen, onClose }) => {
  const [view, setView] = useState("list"); // 'list', 'detail', 'create'
  const [votings, setVotings] = useState([]);
  const [selectedVoting, setSelectedVoting] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [userVoted, setUserVoted] = useState({});

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "feature",
    options: ["", ""],
    end_date: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const getUserId = () => {
    let userId = localStorage.getItem("groa_user_id");
    if (!userId) {
      userId = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("groa_user_id", userId);
    }
    return userId;
  };

  const fetchVotings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTION_VOTINGS_ID,
        [Query.orderDesc("created_at"), Query.limit(50)],
      );

      const votingsData = response.documents.map((doc) => ({
        id: doc.$id,
        title: doc.title || "",
        description: doc.description || "",
        category: doc.category || "feature",
        options: typeof doc.options === "string" ? JSON.parse(doc.options) : doc.options || [],
        votes: typeof doc.votes === "string" ? JSON.parse(doc.votes) : doc.votes || {},
        voted_by: doc.voted_by || [],
        end_date: doc.end_date || null,
        status: doc.status || "active",
        created_at: doc.created_at || doc.$createdAt,
      }));

      // Determine status based on end_date
      const now = new Date();
      votingsData.forEach((v) => {
        if (v.end_date && new Date(v.end_date) < now) {
          v.status = "closed";
        }
      });

      setVotings(votingsData);

      // Check user votes
      const userId = getUserId();
      const votedMap = {};
      votingsData.forEach((v) => {
        votedMap[v.id] = v.voted_by.includes(userId);
      });
      setUserVoted(votedMap);
    } catch (err) {
      console.error("Error fetching votings:", err);
      setError("Failed to load polls. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchVotings();
      setView("list");
      setSearchQuery("");
      setCategoryFilter("all");
      setSelectedVoting(null);
    }
  }, [isOpen, fetchVotings]);

  const filteredVotings = votings.filter((v) => {
    const matchesSearch =
      !searchQuery.trim() ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeVotings = filteredVotings.filter((v) => v.status === "active");
  const closedVotings = filteredVotings.filter((v) => v.status === "closed");

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setFormError("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Description is required");
      return;
    }
    const validOptions = formData.options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      setFormError("At least 2 options are required");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const votesObj = {};
      validOptions.forEach((opt) => {
        votesObj[opt.trim()] = 0;
      });

      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_VOTINGS_ID,
        "unique()",
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          options: JSON.stringify(validOptions.map((o) => o.trim())),
          votes: JSON.stringify(votesObj),
          voted_by: [],
          end_date: formData.end_date || null,
          status: "active",
          created_at: new Date().toISOString(),
        },
      );

      setSubmitSuccess(true);
      setFormData({
        title: "",
        description: "",
        category: "feature",
        options: ["", ""],
        end_date: "",
      });

      await fetchVotings();

      setTimeout(() => {
        setSubmitSuccess(false);
        setView("list");
      }, 1500);
    } catch (err) {
      console.error("Create error:", err);
      setFormError("Failed to create poll. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (votingId, option) => {
    const userId = getUserId();
    const voting = votings.find((v) => v.id === votingId);
    if (!voting || userVoted[votingId]) return;

    // Optimistic update
    const newVotes = { ...voting.votes };
    newVotes[option] = (newVotes[option] || 0) + 1;

    setVotings((prev) =>
      prev.map((v) => {
        if (v.id === votingId) {
          return { ...v, votes: newVotes, voted_by: [...v.voted_by, userId] };
        }
        return v;
      })
    );
    setUserVoted((prev) => ({ ...prev, [votingId]: true }));

    try {
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_VOTINGS_ID,
        votingId,
        {
          votes: JSON.stringify(newVotes),
          voted_by: [...voting.voted_by, userId],
        },
      );
    } catch (err) {
      console.error("Vote error:", err);
      // Revert
      setVotings((prev) =>
        prev.map((v) => {
          if (v.id === votingId) {
            return voting;
          }
          return v;
        })
      );
      setUserVoted((prev) => ({ ...prev, [votingId]: false }));
    }
  };

  const getTotalVotes = (voting) => {
    return Object.values(voting.votes).reduce((a, b) => a + b, 0);
  };

  const getPercentage = (votes, total) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const openVoting = (voting) => {
    setSelectedVoting(voting);
    setView("detail");
  };

  // Option input handler
  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ""] });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) return;
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
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
        <FiArrowLeft /> Back to Polls
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
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
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
              Create New Poll
            </h2>
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
              }}
            >
              Ask the community to vote on important decisions
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
              Poll Created!
            </h3>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              Your poll is now live.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateSubmit}>
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
                Question <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="What do you want to ask?"
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

            {/* Description */}
            <div style={{ marginBottom: "1.5rem" }}>
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
                placeholder="Provide context and details about the poll..."
                required
                rows={3}
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
                Category
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
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

            {/* Options */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Options <span style={{ color: "#ef4444" }}>*</span> (min 2)
              </label>
              {formData.options.map((option, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <input
                    type="text"
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(index, e.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      color: "white",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      style={{
                        padding: "0.5rem",
                        background: "rgba(239, 68, 68, 0.2)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "0.5rem",
                        color: "#ef4444",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                style={{
                  padding: "0.5rem 1rem",
                  background: "transparent",
                  border: "1px dashed var(--border-color)",
                  borderRadius: "0.5rem",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  width: "100%",
                  marginTop: "0.5rem",
                }}
              >
                + Add Option
              </button>
            </div>

            {/* End Date */}
            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                End Date <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
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
                  : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
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
                  <FiCheckSquare /> Create Poll
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  // Render voting detail
  const renderVotingDetail = () => {
    if (!selectedVoting) return null;
    const cat = CATEGORIES[selectedVoting.category] || CATEGORIES.feature;
    const totalVotes = getTotalVotes(selectedVoting);
    const hasVoted = userVoted[selectedVoting.id];
    const isClosed = selectedVoting.status === "closed" ||
      (selectedVoting.end_date && new Date(selectedVoting.end_date) < new Date());

    return (
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <button
          onClick={() => {
            setView("list");
            setSelectedVoting(null);
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
          <FiArrowLeft /> Back to Polls
        </button>

        <div
          style={{
            background: "var(--card-bg)",
            borderRadius: "1rem",
            border: "1px solid var(--border-color)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "1rem",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
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
                  display: "inline-flex",
                  padding: "0.3rem 0.75rem",
                  background: isClosed ? "rgba(107, 114, 128, 0.2)" : "rgba(16, 185, 129, 0.15)",
                  border: `1px solid ${isClosed ? "rgba(107, 114, 128, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                  borderRadius: "2rem",
                  color: isClosed ? "#6b7280" : "#10b981",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                {isClosed ? "Closed" : "Active"}
              </span>
            </div>
            {selectedVoting.end_date && (
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
                {isClosed
                  ? `Ended ${dayjs(selectedVoting.end_date).fromNow()}`
                  : `Ends ${dayjs(selectedVoting.end_date).fromNow()}`}
              </span>
            )}
          </div>

          {/* Title & Description */}
          <h2
            style={{
              margin: "0 0 0.75rem 0",
              fontSize: "1.4rem",
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {selectedVoting.title}
          </h2>
          <p
            style={{
              margin: 0,
              color: "var(--text-secondary)",
              fontSize: "0.95rem",
              lineHeight: 1.6,
              marginBottom: "1.5rem",
            }}
          >
            {selectedVoting.description}
          </p>

          {/* Options */}
          <div style={{ display: "grid", gap: "1rem" }}>
            {selectedVoting.options.map((option, idx) => {
              const votes = selectedVoting.votes[option] || 0;
              const percentage = getPercentage(votes, totalVotes);
              const isSelected = false; // For highlighting user's vote

              return (
                <div key={idx}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {option}
                    </span>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: cat.color,
                      }}
                    >
                      {percentage}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "12px",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "6px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      style={{
                        height: "100%",
                        background: cat.color,
                        borderRadius: "6px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "0.35rem",
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span>{votes} votes</span>
                    {!isClosed && !userVoted[selectedVoting.id] && (
                      <button
                        onClick={() => handleVote(selectedVoting.id, option)}
                        style={{
                          background: "none",
                          border: "none",
                          color: cat.color,
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          padding: 0,
                        }}
                      >
                        Vote this
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Votes */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border-color)",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
            }}
          >
            <FiUsers style={{ fontSize: "0.9rem" }} />
            {totalVotes} total votes
          </div>

          {/* User voted indicator */}
          {userVoted[selectedVoting.id] && (
            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#10b981",
                fontSize: "0.85rem",
              }}
            >
              <FiCheck /> You have voted on this poll
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render polls list
  const renderVotingsList = () => (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* Active Polls Section */}
      {activeVotings.length > 0 && (
        <div>
          <h3
            style={{
              margin: "0 0 1rem 0",
              fontSize: "1rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#10b981",
              }}
            />
            Active Polls ({activeVotings.length})
          </h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            {activeVotings.map((voting, idx) => (
              <VotingCard
                key={voting.id}
                voting={voting}
                onClick={() => openVoting(voting)}
                userVoted={userVoted[voting.id]}
                getTotalVotes={getTotalVotes}
                getPercentage={getPercentage}
                delay={idx * 0.05}
              />
            ))}
          </div>
        </div>
      )}

      {/* Closed Polls Section */}
      {closedVotings.length > 0 && (
        <div>
          <h3
            style={{
              margin: "0 0 1rem 0",
              fontSize: "1rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--text-secondary)",
            }}
          >
            <FiBarChart2 style={{ fontSize: "1rem" }} />
            Past Results ({closedVotings.length})
          </h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            {closedVotings.map((voting, idx) => (
              <VotingCard
                key={voting.id}
                voting={voting}
                onClick={() => openVoting(voting)}
                userVoted={userVoted[voting.id]}
                getTotalVotes={getTotalVotes}
                getPercentage={getPercentage}
                isClosed
                delay={idx * 0.05}
              />
            ))}
          </div>
        </div>
      )}

      {filteredVotings.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "1rem",
            border: "1px dashed var(--border-color)",
          }}
        >
          <FiCheckSquare
            style={{
              fontSize: "2.5rem",
              color: "var(--text-secondary)",
              marginBottom: "1rem",
              opacity: 0.5,
            }}
          />
          <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--text-secondary)" }}>
            {searchQuery || categoryFilter !== "all"
              ? "No polls match your filters"
              : "No polls yet"}
          </h3>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            {searchQuery || categoryFilter !== "all"
              ? "Try different search terms or filters"
              : "Be the first to create a poll!"}
          </p>
        </div>
      )}
    </div>
  );

  // Voting Card Component
  const VotingCard = ({
    voting,
    onClick,
    userVoted,
    getTotalVotes,
    getPercentage,
    isClosed = false,
    delay = 0,
  }) => {
    const cat = CATEGORIES[voting.category] || CATEGORIES.feature;
    const totalVotes = getTotalVotes(voting);
    
    // Find leading option
    const leadingOption = voting.options.reduce((a, b) => {
      return (voting.votes[a] || 0) > (voting.votes[b] || 0) ? a : b;
    }, voting.options[0]);
    const leadingPercentage = getPercentage(voting.votes[leadingOption] || 0, totalVotes);

    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay }}
        onClick={onClick}
        style={{
          background: "var(--card-bg)",
          borderRadius: "0.75rem",
          border: "1px solid var(--border-color)",
          padding: "1.25rem",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#f59e0b50";
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
          <div style={{ display: "flex", gap: "0.5rem" }}>
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
                display: "inline-flex",
                padding: "0.25rem 0.6rem",
                background: isClosed ? "rgba(107, 114, 128, 0.2)" : "rgba(16, 185, 129, 0.15)",
                border: `1px solid ${isClosed ? "rgba(107, 114, 128, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                borderRadius: "2rem",
                color: isClosed ? "#6b7280" : "#10b981",
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              {isClosed ? "Closed" : "Active"}
            </span>
          </div>
          {userVoted && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#10b981",
                fontSize: "0.7rem",
                fontWeight: 500,
              }}
            >
              <FiCheck style={{ fontSize: "0.7rem" }} /> Voted
            </span>
          )}
        </div>

        <h3
          style={{
            margin: "0 0 0.5rem 0",
            fontSize: "1.05rem",
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          {voting.title}
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
          {voting.description}
        </p>

        {/* Mini progress bar */}
        <div
          style={{
            marginBottom: "0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.75rem",
              marginBottom: "0.35rem",
            }}
          >
            <span style={{ color: "var(--text-secondary)" }}>Leading: {leadingOption}</span>
            <span style={{ fontWeight: 600, color: cat.color }}>{leadingPercentage}%</span>
          </div>
          <div
            style={{
              height: "6px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${leadingPercentage}%`,
                height: "100%",
                background: cat.color,
                borderRadius: "3px",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid var(--border-color)",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <FiUsers style={{ fontSize: "0.8rem" }} />
            {totalVotes} votes
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <FiClock style={{ fontSize: "0.8rem" }} />
            {dayjs(voting.created_at).fromNow()}
          </span>
          <span style={{ marginLeft: "auto", fontSize: "0.75rem" }}>
            {voting.options.length} options
          </span>
        </div>
      </motion.div>
    );
  };

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
                ? "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)"
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
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                color: "white",
                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
              }}
            >
              <FiCheckSquare />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
                Community Polls
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                }}
              >
                Democratic decision-making for the community
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

        {/* Search & Filters - Only in list view */}
        {view === "list" && (
          <div
            style={{
              padding: "1rem 1.5rem",
              background: "rgba(255,255,255,0.01)",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              gap: "1rem",
              flexShrink: 0,
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
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
                placeholder="Search polls..."
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
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setCategoryFilter("all")}
                style={{
                  padding: "0.65rem 1rem",
                  background:
                    categoryFilter === "all"
                      ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                      : "rgba(255,255,255,0.05)",
                  border: `1px solid ${
                    categoryFilter === "all" ? "#f59e0b" : "var(--border-color)"
                  }`,
                  borderRadius: "0.5rem",
                  color: categoryFilter === "all" ? "white" : "var(--text-secondary)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <FiFilter style={{ fontSize: "0.85rem" }} /> All
              </button>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setCategoryFilter(key)}
                  style={{
                    padding: "0.65rem 0.75rem",
                    background:
                      categoryFilter === key
                        ? `${cat.color}20`
                        : "rgba(255,255,255,0.05)",
                    border: `1px solid ${
                      categoryFilter === key ? cat.color : "var(--border-color)"
                    }`,
                    borderRadius: "0.5rem",
                    color: categoryFilter === key ? cat.color : "var(--text-secondary)",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setView("create")}
              style={{
                padding: "0.65rem 1.25rem",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
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
                boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)",
                transition: "all 0.2s",
              }}
            >
              <FiPlus style={{ fontSize: "1rem" }} />
              New Poll
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
                {renderVotingsList()}
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
                {renderVotingDetail()}
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

export default VotingsPopup;

