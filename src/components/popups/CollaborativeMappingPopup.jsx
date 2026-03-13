import React from "react";
import { motion } from "framer-motion";
import {
  FiX,
  FiMap,
  FiUsers,
  FiShare2,
  FiEdit3,
  FiEye,
  FiPlus,
} from "react-icons/fi";

const CollaborativeMappingPopup = ({ isOpen, onClose }) => {
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
                background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
              }}
            >
              <FiMap />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
                Collaborative Mapping
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                Community-driven crisis mapping and real-time situation
                awareness
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
            {/* Active Maps */}
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
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h3 style={{ margin: 0 }}>Active Crisis Maps</h3>
                <button
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#06b6d4",
                    color: "white",
                    border: "none",
                    borderRadius: "0.25rem",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiPlus /> Create New Map
                </button>
              </div>

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
                      marginBottom: "0.75rem",
                    }}
                  >
                    <div>
                      <h4
                        style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}
                      >
                        Hurricane Zeta Response
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          color: "var(--text-secondary)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Real-time tracking of evacuation routes and shelter
                        locations
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "0.25rem 0.5rem",
                        background: "#ef4444",
                        color: "white",
                        borderRadius: "0.25rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      ACTIVE
                    </div>
                  </div>
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
                        1,247 contributors
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <FiEdit3
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
                        3,456 updates today
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <FiEye
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
                        45,892 views
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#06b6d4",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      View Map
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
                      Contribute
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
                      Share
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
                      marginBottom: "0.75rem",
                    }}
                  >
                    <div>
                      <h4
                        style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem" }}
                      >
                        California Wildfire Coordination
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          color: "var(--text-secondary)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Mapping fire perimeters, evacuation zones, and resource
                        distribution
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
                      MONITORING
                    </div>
                  </div>
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
                        892 contributors
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <FiEdit3
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
                        1,234 updates today
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <FiEye
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
                        28,456 views
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#06b6d4",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      View Map
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
                      Contribute
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
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapping Tools */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
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
                <h3
                  style={{
                    margin: "0 0 1rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiEdit3 /> Contribution Tools
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
                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                      Report Incident
                    </h4>
                    <p
                      style={{
                        margin: "0 0 1rem 0",
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Mark locations of hazards, damages, or emergency
                      situations
                    </p>
                    <button
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Add Incident Marker
                    </button>
                  </div>

                  <div
                    style={{
                      padding: "1rem",
                      background: "var(--bg-color)",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                      Mark Safe Zones
                    </h4>
                    <p
                      style={{
                        margin: "0 0 1rem 0",
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Identify and verify safe areas, shelters, and evacuation
                      points
                    </p>
                    <button
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        background: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Add Safe Zone
                    </button>
                  </div>

                  <div
                    style={{
                      padding: "1rem",
                      background: "var(--bg-color)",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                      Resource Mapping
                    </h4>
                    <p
                      style={{
                        margin: "0 0 1rem 0",
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Locate and share available resources like food, water,
                      medical supplies
                    </p>
                    <button
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        background: "#8b5cf6",
                        color: "white",
                        border: "none",
                        borderRadius: "0.25rem",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Add Resource
                    </button>
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
                <h3
                  style={{
                    margin: "0 0 1rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiShare2 /> Collaboration Features
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
                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                      Real-time Sync
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      All contributions are synchronized instantly across all
                      users
                    </p>
                    <div
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.5rem",
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "0.25rem",
                        fontSize: "0.8rem",
                        color: "#10b981",
                        fontWeight: 600,
                      }}
                    >
                      ✓ Active
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
                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                      Version Control
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Track changes and maintain history of all map
                      modifications
                    </p>
                    <div
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.5rem",
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "0.25rem",
                        fontSize: "0.8rem",
                        color: "#10b981",
                        fontWeight: 600,
                      }}
                    >
                      ✓ Enabled
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
                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                      Quality Assurance
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Community verification system ensures data accuracy
                    </p>
                    <div
                      style={{
                        marginTop: "0.75rem",
                        padding: "0.5rem",
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "0.25rem",
                        fontSize: "0.8rem",
                        color: "#10b981",
                        fontWeight: 600,
                      }}
                    >
                      ✓ 98.7% Accuracy
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div
              style={{
                background: "var(--card-bg)",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--border-color)",
              }}
            >
              <h3 style={{ margin: "0 0 1.5rem 0" }}>
                Recent Mapping Activity
              </h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div
                  style={{
                    padding: "1rem",
                    background: "var(--bg-color)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    A
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                      Added incident marker
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Road closure on Highway 101 • 2 minutes ago
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Hurricane Zeta
                  </div>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    background: "var(--bg-color)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "#10b981",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    S
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                      Verified safe zone
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Community Center shelter capacity confirmed • 5 minutes
                      ago
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    California Wildfire
                  </div>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    background: "var(--bg-color)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "#8b5cf6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    R
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                      Added resource location
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Medical supplies distribution point • 8 minutes ago
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Hurricane Zeta
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

export default CollaborativeMappingPopup;
