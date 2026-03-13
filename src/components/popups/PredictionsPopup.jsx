import React from "react";
import { motion } from "framer-motion";
import { FiX, FiTrendingUp } from "react-icons/fi";

const PredictionsPopup = ({ isOpen, onClose }) => {
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
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "2rem",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{
          width: "80%",
          height: "100%",
          background: "var(--bg-color)",
          borderRadius: "1rem",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem 2rem",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              <FiTrendingUp />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Predictions</h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                Risk predictions and analysis
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

        {/* Content */}
        <div
          style={{
            padding: "2rem",
            height: "calc(100% - 100px)",
            overflowY: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: "500px",
            }}
          >
            {/* Main Message */}
            <h3
              style={{
                margin: "0 0 1rem 0",
                fontSize: "1.25rem",
                color: "var(--text-primary)",
                fontWeight: 600,
              }}
            >
              No Predictions Yet
            </h3>
            <p
              style={{
                margin: "0 0 2rem 0",
                fontSize: "1rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}
            >
              Predicted events from Innoxation will appear here. These are
              generated sparingly, when significant patterns are detected. Check
              back periodically for updates.
            </p>

            {/* Email Contact */}
            <div
              style={{
                background: "var(--card-bg)",
                padding: "1.25rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--border-color)",
              }}
            >
              <p
                style={{
                  margin: "0 0 0.75rem 0",
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                Have a prediction or insight to share?
              </p>
              <a
                href="mailto:innoxation.tech@gmail.com"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#f59e0b",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.opacity = 0.8)}
                onMouseLeave={(e) => (e.target.style.opacity = 1)}
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PredictionsPopup;
