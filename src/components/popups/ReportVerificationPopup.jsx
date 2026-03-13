import React from "react";
import { motion } from "framer-motion";
import {
  FiX,
  FiCheckCircle,
  FiTrendingUp,
  FiBarChart,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";

const ReportVerificationPopup = ({ isOpen, onClose }) => {
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
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              <FiCheckCircle />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
                Report Verification
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                Community-powered verification of emergency reports and alerts
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
          }}
        >
          <div style={{ display: "grid", gap: "2rem" }}>
            {/* Verification Queue */}
            <div
              style={{
                background: "var(--card-bg)",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--border-color)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 1rem 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <FiTrendingUp /> Reports Awaiting Verification
              </h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div
                  style={{
                    padding: "1rem",
                    background: "var(--bg-color)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div>
                      <h4
                        style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}
                      >
                        Road Closure on Highway 101
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          color: "var(--text-secondary)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Reported flooding causing lane closures between exits
                        45-47
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "0.25rem 0.5rem",
                        background: "#f59e0b",
                        color: "white",
                        borderRadius: "0.25rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      PENDING
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <FiMapPin
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Highway 101
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <FiUsers
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        3 verifications needed
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginTop: "1rem",
                    }}
                  >
                    <button
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Dispute
                    </button>
                    <button
                      style={{
                        padding: "0.5rem 1rem",
                        background: "var(--hover-bg)",
                        color: "var(--text-secondary)",
                        border: "none",
                        borderRadius: "0.25rem",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    background: "var(--bg-color)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div>
                      <h4
                        style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}
                      >
                        Power Outage in Downtown
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          color: "var(--text-secondary)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Widespread power failure affecting 200+ buildings
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "0.25rem 0.5rem",
                        background: "#f59e0b",
                        color: "white",
                        borderRadius: "0.25rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      PENDING
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <FiMapPin
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Downtown District
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <FiUsers
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        5 verifications needed
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginTop: "1rem",
                    }}
                  >
                    <button
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Dispute
                    </button>
                    <button
                      style={{
                        padding: "0.5rem 1rem",
                        background: "var(--hover-bg)",
                        color: "var(--text-secondary)",
                        border: "none",
                        borderRadius: "0.25rem",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1.5rem",
              }}
            >
              <div
                style={{
                  background: "var(--card-bg)",
                  padding: "1.5rem",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border-color)",
                }}
              >
                <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>
                  Your Verification Stats
                </h3>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Reports Verified
                    </span>
                    <span
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "#10b981",
                      }}
                    >
                      247
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Accuracy Rating
                    </span>
                    <span
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "#10b981",
                      }}
                    >
                      96%
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Community Rank
                    </span>
                    <span
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "#f59e0b",
                      }}
                    >
                      Gold Verifier
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "var(--card-bg)",
                  padding: "1.5rem",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border-color)",
                }}
              >
                <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>
                  Verification Process
                </h3>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "#10b981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      1
                    </div>
                    <div>
                      <h4
                        style={{ margin: "0 0 0.25rem 0", fontSize: "0.9rem" }}
                      >
                        Review Report
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                        }}
                      >
                        Examine location, description, and evidence
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "#10b981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      2
                    </div>
                    <div>
                      <h4
                        style={{ margin: "0 0 0.25rem 0", fontSize: "0.9rem" }}
                      >
                        Verify Information
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                        }}
                      >
                        Cross-check with your knowledge or observations
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "#10b981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      3
                    </div>
                    <div>
                      <h4
                        style={{ margin: "0 0 0.25rem 0", fontSize: "0.9rem" }}
                      >
                        Vote to Confirm
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                        }}
                      >
                        Support or dispute the report's accuracy
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Verifications */}
            <div
              style={{
                background: "var(--card-bg)",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--border-color)",
              }}
            >
              <h3 style={{ margin: "0 0 1rem 0" }}>
                Recently Verified Reports
              </h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div
                  style={{
                    padding: "1rem",
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: "1rem" }}>
                      Shelter Capacity Update
                    </h4>
                    <FiCheckCircle style={{ color: "#10b981" }} />
                  </div>
                  <p
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Community Center shelter verified as having 150 available
                    beds
                  </p>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Verified by 8 community members • 2 hours ago
                  </div>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: "1rem" }}>
                      False Alarm - Road Closure
                    </h4>
                    <FiCheckCircle style={{ color: "#ef4444" }} />
                  </div>
                  <p
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Reported road closure on Elm Street disputed by multiple
                    verifiers
                  </p>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Verified by 12 community members • 4 hours ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReportVerificationPopup;
