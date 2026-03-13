import React from "react";
import { motion } from "framer-motion";
import {
  FiX,
  FiUsers,
  FiMapPin,
  FiGlobe,
} from "react-icons/fi";

const LocalNetworksPopup = ({ isOpen, onClose }) => {
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
          maxWidth: "600px",
          height: "auto",
          maxHeight: "90vh",
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
                background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              <FiUsers />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Local Networks</h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                Connect with neighborhood safety networks and community groups
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
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              padding: "3rem 1rem",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(6, 182, 212, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "0.5rem",
              }}
            >
              <FiGlobe
                style={{
                  fontSize: "2.5rem",
                  color: "var(--text-secondary)",
                }}
              />
            </div>
            
            <h3
              style={{
                margin: 0,
                fontSize: "1.25rem",
                color: "var(--text-primary)",
              }}
            >
              No Local Groups Found
            </h3>
            
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                maxWidth: "400px",
                lineHeight: 1.6,
              }}
            >
              Local communities, groups, and networks are based on specific countries and regions. 
              Currently, no local groups are available for your location.
            </p>

            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "rgba(6, 182, 212, 0.1)",
                border: "1px solid rgba(6, 182, 212, 0.2)",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FiMapPin style={{ color: "#06b6d4", fontSize: "1rem" }} />
              <span
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                }}
              >
                Check back soon for local networks in your area
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LocalNetworksPopup;

