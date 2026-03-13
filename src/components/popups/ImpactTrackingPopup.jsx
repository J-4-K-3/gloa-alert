import React from "react";
import { motion } from "framer-motion";
import {
  FiX,
  FiTrendingUp,
  FiBarChart,
  FiTarget,
  FiAward,
  FiUsers,
} from "react-icons/fi";

const ImpactTrackingPopup = ({ isOpen, onClose }) => {
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
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              <FiTrendingUp />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Impact Tracking</h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                Measuring our collective impact in saving lives and building
                resilience
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
            {/* Key Metrics */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#10b981",
                    }}
                  >
                    <FiTarget />
                  </div>
                  <div>
                    <h3
                      style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}
                    >
                      12,847
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Lives Saved
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiTrendingUp
                    style={{ color: "#10b981", fontSize: "0.8rem" }}
                  />
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#10b981",
                      fontWeight: 600,
                    }}
                  >
                    +23% this month
                  </span>
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "rgba(139, 92, 246, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#8b5cf6",
                    }}
                  >
                    <FiUsers />
                  </div>
                  <div>
                    <h3
                      style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}
                    >
                      2.3M
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Active Users
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiTrendingUp
                    style={{ color: "#10b981", fontSize: "0.8rem" }}
                  />
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#10b981",
                      fontWeight: 600,
                    }}
                  >
                    +15% this month
                  </span>
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "rgba(245, 158, 11, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#f59e0b",
                    }}
                  >
                    <FiBarChart />
                  </div>
                  <div>
                    <h3
                      style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}
                    >
                      98.7%
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Alert Accuracy
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiTrendingUp
                    style={{ color: "#10b981", fontSize: "0.8rem" }}
                  />
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#10b981",
                      fontWeight: 600,
                    }}
                  >
                    +2.1% this month
                  </span>
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "rgba(239, 68, 68, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ef4444",
                    }}
                  >
                    <FiAward />
                  </div>
                  <div>
                    <h3
                      style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}
                    >
                      156
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Communities Protected
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiTrendingUp
                    style={{ color: "#10b981", fontSize: "0.8rem" }}
                  />
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#10b981",
                      fontWeight: 600,
                    }}
                  >
                    +8 this month
                  </span>
                </div>
              </div>
            </div>

            {/* Impact Stories */}
            <div
              style={{
                background: "var(--card-bg)",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--border-color)",
              }}
            >
              <h3 style={{ margin: "0 0 1.5rem 0" }}>Recent Impact Stories</h3>
              <div style={{ display: "grid", gap: "1.5rem" }}>
                <div
                  style={{
                    padding: "1.5rem",
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
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <h4
                        style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}
                      >
                        Hurricane Preparedness Campaign
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          color: "var(--text-secondary)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Coastal community of 5,000 residents evacuated safely
                        before landfall
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "0.25rem 0.75rem",
                        background: "#10b981",
                        color: "white",
                        borderRadius: "1rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      SUCCESS
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "1rem",
                      marginTop: "1rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "#10b981",
                        }}
                      >
                        5,000
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Lives Protected
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "#8b5cf6",
                        }}
                      >
                        2.3hrs
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Avg Response Time
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "#f59e0b",
                        }}
                      >
                        98%
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Alert Reach
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "1.5rem",
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
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <h4
                        style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem" }}
                      >
                        Earthquake Early Warning System
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          color: "var(--text-secondary)",
                          fontSize: "0.9rem",
                        }}
                      >
                        15-second advance warning prevented major casualties in
                        metropolitan area
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "0.25rem 0.75rem",
                        background: "#10b981",
                        color: "white",
                        borderRadius: "1rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      SUCCESS
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "1rem",
                      marginTop: "1rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "#10b981",
                        }}
                      >
                        0
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Casualties Prevented
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "#8b5cf6",
                        }}
                      >
                        15sec
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Warning Time
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "#f59e0b",
                        }}
                      >
                        2.1M
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        People Alerted
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Goals */}
            <div
              style={{
                background: "var(--card-bg)",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--border-color)",
              }}
            >
              <h3 style={{ margin: "0 0 1.5rem 0" }}>2024 Impact Goals</h3>
              <div style={{ display: "grid", gap: "1.5rem" }}>
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                      Lives Saved
                    </span>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      15,000 / 20,000
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "var(--hover-bg)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "75%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, #10b981 0%, #059669 100%)",
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    75% complete • 5,000 remaining
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                      Communities Protected
                    </span>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      156 / 200
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "var(--hover-bg)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "78%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)",
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    78% complete • 44 remaining
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                      Alert Accuracy
                    </span>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      98.7% / 99%
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      background: "var(--hover-bg)",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "98.7%",
                        height: "100%",
                        background:
                          "linear-gradient(90deg, #f59e0b 0%, #d97706 100%)",
                        borderRadius: "4px",
                      }}
                    ></div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    98.7% complete • 0.3% remaining
                  </div>
                </div>
              </div>
            </div>

            {/* Global Impact Map */}
            <div
              style={{
                background: "var(--card-bg)",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--border-color)",
              }}
            >
              <h3 style={{ margin: "0 0 1.5rem 0" }}>
                Global Impact Distribution
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#10b981",
                      marginBottom: "0.5rem",
                    }}
                  >
                    47
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Countries Served
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#8b5cf6",
                      marginBottom: "0.5rem",
                    }}
                  >
                    892
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Cities Protected
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#f59e0b",
                      marginBottom: "0.5rem",
                    }}
                  >
                    24/7
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Monitoring Coverage
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#ef4444",
                      marginBottom: "0.5rem",
                    }}
                  >
                    156
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Active Crises Managed
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

export default ImpactTrackingPopup;
