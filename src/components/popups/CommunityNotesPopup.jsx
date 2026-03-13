import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiMessageSquare,
  FiMapPin,
  FiClock,
  FiUser,
  FiThumbsUp,
  FiSearch,
  FiPlus,
  FiLink,
  FiImage,
  FiVideo,
  FiUpload,
  FiCheck,
  FiAlertCircle,
  FiArrowLeft,
} from "react-icons/fi";
import {
  databases,
  storage,
  APPWRITE_DATABASE_ID,
  COLLECTION_COMMUNITY_NOTES_ID,
  APPWRITE_BUCKET_ID,
  Query,
} from "../../lib/Appwrite";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const CommunityNotesPopup = ({ isOpen, onClose }) => {
  const [view, setView] = useState("list"); // 'list' or 'upload'
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [userLiked, setUserLiked] = useState({}); // Track which notes user liked

  // Upload form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    source_link: "",
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Generate a simple user ID (in production, use actual user auth)
  const getUserId = () => {
    let userId = localStorage.getItem("groa_user_id");
    if (!userId) {
      userId = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("groa_user_id", userId);
    }
    return userId;
  };

  // Fetch notes from Appwrite
  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTION_COMMUNITY_NOTES_ID,
        [Query.orderDesc("created_at"), Query.limit(50)],
      );

      const notesData = response.documents.map((doc) => ({
        id: doc.$id,
        name: doc.name || "Anonymous",
        email: doc.email || "",
        description: doc.description || "",
        source_link: doc.source_link || "",
        media_type: doc.media_type || "none",
        media_url: doc.media_url || "",
        location: doc.location || "",
        likes: doc.likes || 0,
        liked_by: doc.liked_by || [],
        created_at: doc.created_at || doc.$createdAt,
      }));

      setNotes(notesData);

      // Check which notes user has liked
      const userId = getUserId();
      const likedMap = {};
      notesData.forEach((note) => {
        likedMap[note.id] = note.liked_by.includes(userId);
      });
      setUserLiked(likedMap);
    } catch (err) {
      console.error("Error fetching notes:", err);
      setError("Failed to load community notes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on open
  useEffect(() => {
    if (isOpen) {
      fetchNotes();
      setView("list");
      setSearchQuery("");
    }
  }, [isOpen, fetchNotes]);

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.name.toLowerCase().includes(query) ||
      note.description.toLowerCase().includes(query) ||
      note.location.toLowerCase().includes(query)
    );
  });

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (15MB max)
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File size must be under 15MB");
      return;
    }

    // Validate file type
    const validImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const validVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

    let mediaType = null;
    if (validImageTypes.includes(file.type)) {
      mediaType = "image";
    } else if (validVideoTypes.includes(file.type)) {
      mediaType = "video";
    } else {
      setUploadError(
        "Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM)",
      );
      return;
    }

    setUploadError(null);
    // Store the actual file object separately from metadata
    setMediaFile({
      file: file, // Keep the original File object
      mediaType: mediaType,
      name: file.name,
      size: file.size
    });

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected media
  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      setUploadError("Name is required");
      return;
    }
    if (!formData.description.trim()) {
      setUploadError("Description is required");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      let mediaUrl = "";
      let mediaType = "none";

      // Upload media if present
      if (mediaFile) {
        try {
          // In Appwrite v8+, we can pass the raw File object directly
          const fileId = await storage.createFile(
            APPWRITE_BUCKET_ID,
            "unique()",
            mediaFile.file
          );

          // Get file preview URL - in v8+ getFileView returns a URL object
          const fileUrl = storage.getFileView(APPWRITE_BUCKET_ID, fileId.$id);
          mediaUrl = fileUrl.toString();
          mediaType = mediaFile.mediaType;
        } catch (uploadErr) {
          console.error("Media upload error:", uploadErr);
          setUploadError("Failed to upload media. Please try again.");
          setIsUploading(false);
          return;
        }
      }

      // Create document in Appwrite
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_COMMUNITY_NOTES_ID,
        "unique()",
        {
          name: formData.name.trim(),
          email: formData.email.trim() || "",
          description: formData.description.trim(),
          source_link: formData.source_link.trim() || "",
          media_type: mediaType,
          media_url: mediaUrl,
          media_size: mediaFile ? mediaFile.size : 0,
          location: formData.location ? formData.location.trim() : "",
          likes: 0,
          liked_by: [],
          created_at: new Date().toISOString(),
        },
      );

      // Show success and reset
      setUploadSuccess(true);
      setFormData({
        name: "",
        email: "",
        description: "",
        source_link: "",
        location: "",
      });
      setMediaFile(null);
      setMediaPreview(null);

      // Refresh notes list
      await fetchNotes();

      // Return to list view after short delay
      setTimeout(() => {
        setUploadSuccess(false);
        setView("list");
      }, 1500);
    } catch (err) {
      console.error("Submit error:", err);
      setUploadError("Failed to submit note. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle like/unlike
  const handleLike = async (noteId) => {
    const userId = getUserId();
    const isCurrentlyLiked = userLiked[noteId];

    // Optimistic UI update
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === noteId) {
          return {
            ...note,
            likes: isCurrentlyLiked ? note.likes - 1 : note.likes + 1,
            liked_by: isCurrentlyLiked
              ? note.liked_by.filter((id) => id !== userId)
              : [...note.liked_by, userId],
          };
        }
        return note;
      }),
    );
    setUserLiked((prev) => ({ ...prev, [noteId]: !isCurrentlyLiked }));

    try {
      // Get current note
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;

      // Update in Appwrite
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_COMMUNITY_NOTES_ID,
        noteId,
        {
          likes: isCurrentlyLiked ? note.likes - 1 : note.likes + 1,
          liked_by: isCurrentlyLiked
            ? note.liked_by.filter((id) => id !== userId)
            : [...note.liked_by, userId],
        },
      );
    } catch (err) {
      console.error("Like error:", err);
      // Revert on error
      setNotes((prev) =>
        prev.map((note) => {
          if (note.id === noteId) {
            return {
              ...note,
              likes: isCurrentlyLiked ? note.likes + 1 : note.likes - 1,
              liked_by: isCurrentlyLiked
                ? [...note.liked_by, userId]
                : note.liked_by.filter((id) => id !== userId),
            };
          }
          return note;
        }),
      );
      setUserLiked((prev) => ({ ...prev, [noteId]: isCurrentlyLiked }));
    }
  };

  // Render upload form
  const renderUploadForm = () => (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
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
        <FiArrowLeft /> Back to Community Notes
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
              Share a Note
            </h2>
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
              }}
            >
              Help the community by sharing important information
            </p>
          </div>
        </div>

        {uploadSuccess ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 1rem",
            }}
          >
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
              Note Submitted!
            </h3>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              Your note has been shared with the community.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Name (required) */}
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
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your name"
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

            {/* Email (optional) */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Email{" "}
                <span
                  style={{ color: "var(--text-secondary)", fontWeight: 400 }}
                >
                  (optional)
                </span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your@email.com"
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
                <span
                  style={{ color: "var(--text-secondary)", fontWeight: 400 }}
                >
                  (optional - e.g., "Downtown", "Main St.")
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
                  value={formData.location || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Where did this happen?"
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
                placeholder="Describe what you observed or want to share..."
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

            {/* Source Link (optional) */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Source Link{" "}
                <span
                  style={{ color: "var(--text-secondary)", fontWeight: 400 }}
                >
                  (optional)
                </span>
              </label>
              <div style={{ position: "relative" }}>
                <FiLink
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-secondary)",
                  }}
                />
                <input
                  type="url"
                  value={formData.source_link}
                  onChange={(e) =>
                    setFormData({ ...formData, source_link: e.target.value })
                  }
                  placeholder="https://source.com/article"
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

            {/* Media Upload (optional) */}
            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Image or Video{" "}
                <span
                  style={{ color: "var(--text-secondary)", fontWeight: 400 }}
                >
                  (optional, max 15MB)
                </span>
              </label>

              {mediaPreview ? (
                <div
                  style={{
                    position: "relative",
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  {mediaFile?.mediaType === "video" ? (
                    <video
                      src={mediaPreview}
                      controls
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        background: "#000",
                      }}
                    />
                  ) : (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={removeMedia}
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.7)",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FiX />
                  </button>
                  <div
                    style={{
                      padding: "0.5rem 0.75rem",
                      background: "rgba(0,0,0,0.7)",
                      fontSize: "0.8rem",
                      color: "white",
                    }}
                  >
                    {mediaFile.name} (
                    {(mediaFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed var(--border-color)",
                    borderRadius: "0.75rem",
                    padding: "2rem",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#06b6d4";
                    e.currentTarget.style.background =
                      "rgba(6, 182, 212, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-color)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "rgba(6, 182, 212, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem",
                    }}
                  >
                    <FiUpload
                      style={{ fontSize: "1.5rem", color: "#06b6d4" }}
                    />
                  </div>
                  <p
                    style={{
                      margin: 0,
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Click to upload image or video
                  </p>
                  <p
                    style={{
                      margin: "0.5rem 0 0 0",
                      color: "var(--text-secondary)",
                      fontSize: "0.8rem",
                    }}
                  >
                    JPEG, PNG, GIF, WebP, MP4, WebM • Max 15MB
                  </p>
                </div>
              )}
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
                  : "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
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
                  <FiCheck /> Submit Note
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Guidelines */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1.5rem",
          background: "var(--card-bg)",
          borderRadius: "0.75rem",
          border: "1px solid var(--border-color)",
        }}
      >
        <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem" }}>
          Tips for Great Notes
        </h4>
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {[
            {
              title: "Be Accurate",
              desc: "Only report what you've personally observed.",
            },
            {
              title: "Include Location",
              desc: "Help others find relevant information by adding location.",
            },
            {
              title: "Add Sources",
              desc: "Link to official sources when available.",
            },
          ].map((tip, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "rgba(6, 182, 212, 0.2)",
                  color: "#06b6d4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  {tip.title}
                </div>
                <div
                  style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}
                >
                  {tip.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render notes list
  const renderNotesList = () => (
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
            Loading community notes...
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
            onClick={fetchNotes}
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
      ) : filteredNotes.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "1rem",
            border: "1px dashed var(--border-color)",
          }}
        >
          <FiMessageSquare
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
              ? "No notes match your search"
              : "No community notes yet"}
          </h3>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            {searchQuery
              ? "Try a different search term"
              : "Be the first to share important information with your community!"}
          </p>
        </div>
      ) : (
        filteredNotes.map((note, idx) => (
          <motion.div
            key={note.id}
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
            <div style={{ padding: "1.25rem" }}>
              {/* Header */}
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
                    gap: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "1rem",
                    }}
                  >
                    {note.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                      {note.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                      }}
                    >
                      <FiClock />
                      <span>{dayjs(note.created_at).fromNow()}</span>
                      {note.location && (
                        <>
                          <FiMapPin style={{ marginLeft: "0.5rem" }} />
                          <span>{note.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <p
                style={{
                  margin: 0,
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  lineHeight: "1.6",
                  marginBottom: note.source_link ? "1rem" : "0",
                }}
              >
                {note.description}
              </p>

              {/* Source link */}
              {note.source_link && (
                <a
                  href={note.source_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "#3b82f6",
                    fontSize: "0.85rem",
                    marginBottom: "1rem",
                    textDecoration: "none",
                  }}
                >
                  <FiLink style={{ fontSize: "0.8rem" }} />
                  View Source
                </a>
              )}

              {/* Media */}
              {note.media_url && note.media_type !== "none" && (
                <div
                  style={{
                    marginBottom: "1rem",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                  }}
                >
                  {note.media_type === "video" ? (
                    <video
                      src={note.media_url}
                      controls
                      style={{
                        width: "100%",
                        maxHeight: "300px",
                        background: "#000",
                      }}
                    />
                  ) : (
                    <img
                      src={note.media_url}
                      alt="Community note media"
                      style={{
                        width: "100%",
                        maxHeight: "300px",
                        objectFit: "cover",
                        borderRadius: "0.5rem",
                      }}
                    />
                  )}
                </div>
              )}

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--border-color)",
                }}
              >
                <button
                  onClick={() => handleLike(note.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: userLiked[note.id]
                      ? "rgba(16, 185, 129, 0.15)"
                      : "rgba(255,255,255,0.05)",
                    border: "none",
                    borderRadius: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    color: userLiked[note.id]
                      ? "#10b981"
                      : "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    transition: "all 0.2s",
                  }}
                >
                  <FiThumbsUp
                    style={{
                      fontSize: "0.9rem",
                    }}
                  />
                  <span style={{ fontWeight: 500 }}>{note.likes || 0}</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))
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
              <FiMessageSquare />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
                Community Notes
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                }}
              >
                Real-time updates and observations from community members
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
                placeholder="Search words, places..."
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
              Add Note
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
                {renderNotesList()}
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

export default CommunityNotesPopup;
