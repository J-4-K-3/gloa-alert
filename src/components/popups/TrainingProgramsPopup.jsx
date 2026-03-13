import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiBookOpen,
  FiPlay,
  FiAward,
  FiUsers,
  FiClock,
  FiExternalLink,
  FiStar,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiGlobe,
  FiFilter,
} from "react-icons/fi";
import {
  featuredCourses,
  trainingCategories,
  coursesByCategory,
  trainingProviders,
  certifications,
} from "../../lib/trainingData";

const TrainingProgramsPopup = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCategory, setSelectedCategory] = useState("firstaid");
  const [expandedCourse, setExpandedCourse] = useState(null);

  if (!isOpen) return null;

  const tabs = [
    { id: "courses", label: "Courses", icon: FiBookOpen },
    { id: "providers", label: "Providers", icon: FiGlobe },
    { id: "certifications", label: "Certifications", icon: FiAward },
  ];

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
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{
          width: "95%",
          maxWidth: "900px",
          height: "90vh",
          background: "var(--bg-color)",
          borderRadius: "1rem",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
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
              "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
              }}
            >
              <FiBookOpen />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>
                Training Programs
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                }}
              >
                Emergency preparedness courses from{" "}
                <span style={{ color: "#8b5cf6" }}>FEMA, Red Cross, AHA</span>{" "}
                and more
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid var(--border-color)",
              color: "var(--text-secondary)",
              fontSize: "1.25rem",
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "var(--hover-bg)";
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.05)";
              e.target.style.color = "var(--text-secondary)";
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.25rem",
            padding: "0.75rem 1.5rem",
            borderBottom: "1px solid var(--border-color)",
            background: "rgba(0, 0, 0, 0.2)",
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1.2rem",
                  background:
                    activeTab === tab.id
                      ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                      : "transparent",
                  border: "none",
                  borderRadius: "0.5rem",
                  color:
                    activeTab === tab.id ? "white" : "var(--text-secondary)",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "1.5rem",
          }}
        >
          {/* COURSES TAB */}
          {activeTab === "courses" && (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {/* Featured Courses */}
              <div>
                <h3
                  style={{
                    margin: "0 0 1rem 0",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                  }}
                >
                  ⭐ Featured Courses
                </h3>
                <div style={{ display: "grid", gap: "1rem" }}>
                  {featuredCourses.slice(0, 3).map((course) => (
                    <FeaturedCourseCard
                      key={course.id}
                      course={course}
                      expanded={expandedCourse === course.id}
                      onToggle={() =>
                        setExpandedCourse(
                          expandedCourse === course.id ? null : course.id,
                        )
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <FiFilter style={{ color: "#8b5cf6" }} />
                  <h3
                    style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}
                  >
                    Browse by Category
                  </h3>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "0.5rem",
                  }}
                >
                  {trainingCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      style={{
                        padding: "0.75rem",
                        background:
                          selectedCategory === category.id
                            ? `linear-gradient(135deg, ${category.color} 0%, ${category.color}cc 100%)`
                            : "rgba(0, 0, 0, 0.3)",
                        border: `1px solid ${selectedCategory === category.id ? category.color : "var(--border-color)"}`,
                        borderRadius: "0.5rem",
                        color:
                          selectedCategory === category.id
                            ? "white"
                            : "var(--text-secondary)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <span style={{ fontSize: "1.25rem" }}>
                        {category.icon}
                      </span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                        {category.label}
                      </span>
                      <span style={{ fontSize: "0.65rem", opacity: 0.8 }}>
                        {category.count} courses
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Courses */}
              <div>
                <h3
                  style={{
                    margin: "0 0 1rem 0",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                  }}
                >
                  {
                    trainingCategories.find((c) => c.id === selectedCategory)
                      ?.icon
                  }{" "}
                  {
                    trainingCategories.find((c) => c.id === selectedCategory)
                      ?.label
                  }
                </h3>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {coursesByCategory[selectedCategory]?.map((course, idx) => (
                    <CourseListItem key={idx} course={course} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PROVIDERS TAB */}
          {activeTab === "providers" && (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%)",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "0.75rem",
                  padding: "1.25rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <FiGlobe style={{ color: "#8b5cf6" }} />
                  <span style={{ fontWeight: 600, color: "#8b5cf6" }}>
                    Authoritative Training Providers
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    margin: 0,
                  }}
                >
                  These organizations provide verified, professional emergency
                  response training. Click to learn more about their courses.
                </p>
              </div>

              <div style={{ display: "grid", gap: "1rem" }}>
                {trainingProviders.map((provider, idx) => (
                  <ProviderCard key={idx} provider={provider} />
                ))}
              </div>
            </div>
          )}

          {/* CERTIFICATIONS TAB */}
          {activeTab === "certifications" && (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: "0.75rem",
                  padding: "1.25rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <FiAward style={{ color: "#f59e0b" }} />
                  <span style={{ fontWeight: 600, color: "#f59e0b" }}>
                    Earn Recognized Credentials
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    margin: 0,
                  }}
                >
                  Complete training programs to earn certificates, badges, and
                  professional credentials that demonstrate your emergency
                  preparedness skills.
                </p>
              </div>

              <div style={{ display: "grid", gap: "1rem" }}>
                {certifications.map((cert, idx) => (
                  <CertificationCard key={idx} certification={cert} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(0, 0, 0, 0.2)",
          }}
        >
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            Last updated: {new Date().toLocaleDateString()}
          </span>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
            }}
          >
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              <FiGlobe size={12} /> Verified Providers
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Featured Course Card Component
const FeaturedCourseCard = ({ course, expanded, onToggle }) => (
  <div
    style={{
      background: "var(--card-bg)",
      borderRadius: "0.75rem",
      border: `1px solid ${course.color}30`,
      overflow: "hidden",
    }}
  >
    <button
      onClick={onToggle}
      style={{
        width: "100%",
        padding: "1.25rem",
        background: "transparent",
        border: "none",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        cursor: "pointer",
        color: "inherit",
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: "2.5rem" }}>{course.logo}</span>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.25rem",
          }}
        >
          <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>
            {course.title}
          </h4>
          {course.certificate && (
            <span
              style={{
                fontSize: "0.65rem",
                padding: "0.15rem 0.4rem",
                background: "#10b981",
                color: "white",
                borderRadius: "0.25rem",
                fontWeight: 600,
              }}
            >
              CERTIFIED
            </span>
          )}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            marginBottom: "0.5rem",
          }}
        >
          {course.description}
        </p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
          }}
        >
          <span
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <FiClock size={12} /> {course.duration}
          </span>
          <span
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <FiUsers size={12} /> {(course.enrolled / 1000).toFixed(0)}K+
            enrolled
          </span>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              color: "#f59e0b",
            }}
          >
            <FiStar size={12} fill="#f59e0b" /> {course.rating}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <a
          href={course.providerUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.4rem 0.75rem",
            background: course.color,
            color: "white",
            borderRadius: "0.5rem",
            fontSize: "0.8rem",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Learn More <FiExternalLink size={12} />
        </a>
        {expanded ? <FiChevronUp /> : <FiChevronDown />}
      </div>
    </button>
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          style={{
            padding: "0 1.25rem 1.25rem",
            overflow: "hidden",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <div style={{ paddingTop: "1rem" }}>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                marginBottom: "0.5rem",
              }}
            >
              Topics covered:
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {course.topics.map((topic, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: "0.7rem",
                    padding: "0.2rem 0.6rem",
                    background: "rgba(139, 92, 246, 0.2)",
                    borderRadius: "1rem",
                    color: "#8b5cf6",
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.85rem",
              }}
            >
              <span style={{ color: "var(--text-secondary)" }}>Provider:</span>
              <span style={{ fontWeight: 500 }}>{course.provider}</span>
              <span
                style={{
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <FiCheck size={14} /> {course.price}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Course List Item Component
const CourseListItem = ({ course }) => (
  <a
    href={course.url}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1rem",
      background: "rgba(0, 0, 0, 0.3)",
      borderRadius: "0.5rem",
      border: "1px solid var(--border-color)",
      textDecoration: "none",
      color: "inherit",
      transition: "all 0.2s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)";
      e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "var(--border-color)";
      e.currentTarget.style.background = "rgba(0, 0, 0, 0.3)";
    }}
  >
    <div>
      <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>
        {course.title}
      </div>
      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
        {course.provider}
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
        {course.duration}
      </span>
      {course.free ? (
        <span
          style={{
            fontSize: "0.7rem",
            padding: "0.2rem 0.5rem",
            background: "#10b981",
            color: "white",
            borderRadius: "0.25rem",
          }}
        >
          FREE
        </span>
      ) : (
        <span
          style={{
            fontSize: "0.7rem",
            padding: "0.2rem 0.5rem",
            background: "#f59e0b",
            color: "white",
            borderRadius: "0.25rem",
          }}
        >
          PAID
        </span>
      )}
      <FiExternalLink style={{ color: "var(--text-secondary)" }} />
    </div>
  </a>
);

// Provider Card Component
const ProviderCard = ({ provider }) => (
  <a
    href={provider.url}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "1.25rem",
      background: "rgba(0, 0, 0, 0.3)",
      borderRadius: "0.75rem",
      border: "1px solid var(--border-color)",
      textDecoration: "none",
      color: "inherit",
      transition: "all 0.2s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = `${provider.color}50`;
      e.currentTarget.style.background = `${provider.color}10`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "var(--border-color)";
      e.currentTarget.style.background = "rgba(0, 0, 0, 0.3)";
    }}
  >
    <span style={{ fontSize: "2.5rem" }}>{provider.logo}</span>
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontWeight: 600,
          marginBottom: "0.25rem",
          color: provider.color,
        }}
      >
        {provider.name}
      </div>
      <div
        style={{
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          marginBottom: "0.5rem",
        }}
      >
        {provider.description}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: "0.7rem",
            padding: "0.15rem 0.5rem",
            background: "rgba(139, 92, 246, 0.2)",
            borderRadius: "1rem",
            color: "#8b5cf6",
          }}
        >
          {provider.courses}
        </span>
      </div>
    </div>
    <FiExternalLink style={{ color: "var(--text-secondary)" }} />
  </a>
);

// Certification Card Component
const CertificationCard = ({ certification }) => (
  <div
    style={{
      background: "rgba(0, 0, 0, 0.3)",
      borderRadius: "0.75rem",
      border: "1px solid var(--border-color)",
      padding: "1.25rem",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "0.75rem",
      }}
    >
      <span style={{ fontSize: "2rem", filter: "grayscale(0)" }}>
        {certification.icon}
      </span>
      <div>
        <div style={{ fontWeight: 600, color: certification.color }}>
          {certification.name}
        </div>
      </div>
    </div>
    <p
      style={{
        margin: 0,
        fontSize: "0.9rem",
        color: "var(--text-secondary)",
        lineHeight: 1.5,
      }}
    >
      {certification.description}
    </p>
  </div>
);

export default TrainingProgramsPopup;
