import React from "react";
import { motion } from "framer-motion";
import {
  FiX,
  FiBarChart,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiUsers,
} from "react-icons/fi";

const PollsPopup = ({ isOpen, onClose }) => {
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
              <FiBarChart />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Community Polls</h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                Vote on important emergency preparedness and response topics
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
            {/* Active Polls */}
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
                <FiTrendingUp /> Active Polls
              </h3>
              <div style={{ display: "grid", gap: "1.5rem" }}>
                <div
                  style={{
                    padding: "1rem",
                    background: "var(--bg-color)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <h4 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>
                    What emergency kit item do you check most frequently?
                  </h4>
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <input type="radio" name="kit-item" id="water" />
                      <label
                        htmlFor="water"
                        style={{ flex: 1, cursor: "pointer" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "0.9rem" }}>
                            Water supply
                          </span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            42%
                          </span>
                        </div>
                        <div
                          style={{
                            height: "4px",
                            background: "var(--border-color)",
                            borderRadius: "2px",
                            marginTop: "0.25rem",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: "42%",
                              background: "#10b981",
                              borderRadius: "2px",
                            }}
                          ></div>
                        </div>
                      </label>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <input type="radio" name="kit-item" id="flashlight" />
                      <label
                        htmlFor="flashlight"
                        style={{ flex: 1, cursor: "pointer" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "0.9rem" }}>
                            Flashlight batteries
                          </span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            28%
                          </span>
                        </div>
                        <div
                          style={{
                            height: "4px",
                            background: "var(--border-color)",
                            borderRadius: "2px",
                            marginTop: "0.25rem",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: "28%",
                              background: "#10b981",
                              borderRadius: "2px",
                            }}
                          ></div>
                        </div>
                      </label>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <input type="radio" name="kit-item" id="radio" />
                      <label
                        htmlFor="radio"
                        style={{ flex: 1, cursor: "pointer" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "0.9rem" }}>
                            Emergency radio
                          </span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            30%
                          </span>
                        </div>
                        <div
                          style={{
                            height: "4px",
                            background: "var(--border-color)",
                            borderRadius: "2px",
                            marginTop: "0.25rem",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: "30%",
                              background: "#10b981",
                              borderRadius: "2px",
                            }}
                          ></div>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: "1rem",
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    1,247 votes • Ends in 2 days
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
                  <h4 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>
                    Which emergency notification method do you trust most?
                  </h4>
                  <div style={{ display: "grid", gap: "0.75rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <input type="radio" name="notification" id="app" />
                      <label
                        htmlFor="app"
                        style={{ flex: 1, cursor: "pointer" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "0.9rem" }}>
                            Mobile app alerts
                          </span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            35%
                          </span>
                        </div>
                        <div
                          style={{
                            height: "4px",
                            background: "var(--border-color)",
                            borderRadius: "2px",
                            marginTop: "0.25rem",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: "35%",
                              background: "#3b82f6",
                              borderRadius: "2px",
                            }}
                          ></div>
                        </div>
                      </label>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <input type="radio" name="notification" id="tv" />
                      <label
                        htmlFor="tv"
                        style={{ flex: 1, cursor: "pointer" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "0.9rem" }}>
                            TV emergency broadcasts
                          </span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            28%
                          </span>
                        </div>
                        <div
                          style={{
                            height: "4px",
                            background: "var(--border-color)",
                            borderRadius: "2px",
                            marginTop: "0.25rem",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: "28%",
                              background: "#3b82f6",
                              borderRadius: "2px",
                            }}
                          ></div>
                        </div>
                      </label>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <input type="radio" name="notification" id="sirens" />
                      <label
                        htmlFor="sirens"
                        style={{ flex: 1, cursor: "pointer" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "0.9rem" }}>
                            Outdoor sirens
                          </span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            37%
                          </span>
                        </div>
                        <div
                          style={{
                            height: "4px",
                            background: "var(--border-color)",
                            borderRadius: "2px",
                            marginTop: "0.25rem",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: "37%",
                              background: "#3b82f6",
                              borderRadius: "2px",
                            }}
                          ></div>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: "1rem",
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    892 votes • Ends in 5 days
                  </div>
                </div>
              </div>
            </div>

            {/* Poll Categories */}
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
                  Preparedness
                </h3>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {[
                    "Emergency kit contents",
                    "Family communication plans",
                    "Evacuation preferences",
                    "Pet emergency planning",
                    "Business continuity",
                  ].map((topic, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "0.5rem",
                        background: "var(--bg-color)",
                        borderRadius: "0.25rem",
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "var(--hover-bg)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "var(--bg-color)")
                      }
                    >
                      {topic}
                    </div>
                  ))}
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
                  Response
                </h3>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {[
                    "Shelter preferences",
                    "Communication methods",
                    "Resource priorities",
                    "Medical emergency response",
                    "Transportation needs",
                  ].map((topic, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "0.5rem",
                        background: "var(--bg-color)",
                        borderRadius: "0.25rem",
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "var(--hover-bg)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "var(--bg-color)")
                      }
                    >
                      {topic}
                    </div>
                  ))}
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
                  Recovery
                </h3>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {[
                    "Rebuilding priorities",
                    "Insurance experiences",
                    "Community support needs",
                    "Mental health resources",
                    "Long-term recovery plans",
                  ].map((topic, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "0.5rem",
                        background: "var(--bg-color)",
                        borderRadius: "0.25rem",
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "var(--hover-bg)")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "var(--bg-color)")
                      }
                    >
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Create Poll */}
            <div
              style={{
                background: "var(--card-bg)",
                padding: "1.5rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--border-color)",
              }}
            >
              <h3 style={{ margin: "0 0 1rem 0" }}>Create a Community Poll</h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                <input
                  type="text"
                  placeholder="Poll question"
                  style={{
                    padding: "0.75rem",
                    background: "var(--bg-color)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0.5rem",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem",
                  }}
                />
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  <input
                    type="text"
                    placeholder="Option 1"
                    style={{
                      padding: "0.75rem",
                      background: "var(--bg-color)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Option 2"
                    style={{
                      padding: "0.75rem",
                      background: "var(--bg-color)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Option 3 (optional)"
                    style={{
                      padding: "0.75rem",
                      background: "var(--bg-color)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Option 4 (optional)"
                    style={{
                      padding: "0.75rem",
                      background: "var(--bg-color)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <select
                    style={{
                      padding: "0.75rem",
                      background: "var(--bg-color)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    <option value="">Poll duration</option>
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="7">1 week</option>
                    <option value="14">2 weeks</option>
                  </select>
                  <select
                    style={{
                      padding: "0.75rem",
                      background: "var(--bg-color)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      color: "var(--text-primary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    <option value="">Category</option>
                    <option value="preparedness">Preparedness</option>
                    <option value="response">Response</option>
                    <option value="recovery">Recovery</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <button
                  style={{
                    padding: "0.75rem 1.5rem",
                    background:
                      "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.transform = "translateY(-1px)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.transform = "translateY(0)")
                  }
                >
                  Create Poll
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PollsPopup;
