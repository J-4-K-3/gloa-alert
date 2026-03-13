import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiX,
  FiHeart,
  FiPhone,
  FiGlobe,
  FiMessageCircle,
  FiExternalLink,
  FiSearch,
  FiShield,
  FiUsers,
  FiAlertCircle,
} from "react-icons/fi";

// Real support organizations and resources
const SUPPORT_GROUPS = {
  crisis: {
    title: "Crisis Support",
    icon: FiAlertCircle,
    color: "#ef4444",
    resources: [
      {
        name: "988 Suicide & Crisis Lifeline",
        description:
          "24/7, free and confidential support for people in distress. Call or text 988.",
        phone: "988",
        website: "https://988lifeline.org/",
        available: "24/7",
        type: "phone",
      },
      {
        name: "Disaster Distress Helpline",
        description:
          "SAMHSA's helpline providing immediate crisis counseling for disaster survivors.",
        phone: "1-800-985-5990",
        website: "https://www.samhsa.gov/find-help/disaster-distress-helpline",
        available: "24/7",
        type: "phone",
      },
      {
        name: "Crisis Text Line",
        description:
          "Text HOME to 741741 to connect with a trained crisis counselor.",
        phone: "Text HOME to 741741",
        website: "https://www.crisistextline.org/",
        available: "24/7",
        type: "text",
      },
      {
        name: "IFRC",
        description:
          "International Federation of Red Cross and Red Crescent Societies - global humanitarian network providing emergency response and disaster relief.",
        website: "https://www.ifrc.org/",
        type: "crisis",
      },
    ],
  },
  mentalHealth: {
    title: "Mental Health Organizations",
    icon: FiHeart,
    color: "#ec4899",
    resources: [
      {
        name: "NAMI",
        description:
          "National Alliance on Mental Illness - advocacy, education, and support for those affected by mental illness.",
        phone: "1-800-950-6264",
        website: "https://www.nami.org/",
        available: "Mon-Fri, 10am-10pm ET",
        type: "organization",
      },
      {
        name: "Mental Health America",
        description:
          "Community-based mental health services, support groups, and resources.",
        phone: "1-800-969-6642",
        website: "https://www.mhanational.org/",
        available: "24/7",
        type: "organization",
      },
      {
        name: "SAMHSA",
        description:
          "Substance Abuse and Mental Health Services Administration - treatment locator and resources.",
        phone: "1-800-662-4357",
        website: "https://www.samhsa.gov/find-help/national-helpline",
        available: "24/7",
        type: "organization",
      },
      {
        name: "World Health Organization (WHO)",
        description:
          "Global guidance, resources, and initiatives for mental health support.",
        website: "https://www.who.int/health-topics/mental-health",
        type: "organization",
      },
    ],
  },
  online: {
    title: "Online Therapy & Counseling",
    icon: FiMessageCircle,
    color: "#8b5cf6",
    resources: [
      {
        name: "BetterHelp",
        description:
          "Online counseling and therapy services with licensed professionals.",
        website: "https://www.betterhelp.com/",
        type: "online",
      },
      {
        name: "Talkspace",
        description:
          "Text, video, and audio messaging therapy from licensed therapists.",
        website: "https://www.talkspace.com/",
        type: "online",
      },
      {
        name: "Mindful",
        description:
          "Meditation and mindfulness resources for stress management.",
        website: "https://www.mindful.org/",
        type: "online",
      },
    ],
  },
  specialized: {
    title: "Specialized Support",
    icon: FiUsers,
    color: "#06b6d4",
    resources: [
      {
        name: "The Trevor Project",
        description:
          "Crisis intervention and suicide prevention services to LGBTQ+ young people.",
        phone: "1-866-488-7386",
        website: "https://www.thetrevorproject.org/",
        available: "24/7",
        type: "specialized",
      },
      {
        name: "RAINN",
        description:
          "National Sexual Assault Hotline - support for survivors of sexual assault.",
        phone: "1-800-656-4673",
        website: "https://www.rainn.org/",
        available: "24/7",
        type: "specialized",
      },
      {
        name: "National Domestic Violence Hotline",
        description:
          "Confidential support and resources for those experiencing domestic violence.",
        phone: "1-800-799-7233",
        website: "https://www.thehotline.org/",
        available: "24/7",
        type: "specialized",
      },
      {
        name: "UNHCR",
        description:
          "United Nations High Commissioner for Refugees - protection and assistance for refugees and displaced persons worldwide.",
        website: "https://www.unhcr.org/",
        type: "specialized",
      },
      {
        name: "Save the Children",
        description:
          "Child protection, crisis response, and humanitarian aid worldwide.",
        website: "https://www.savethechildren.org/",
        type: "specialized",
      },
    ],
  },
  disaster: {
    title: "Disaster Relief Organizations",
    icon: FiShield,
    color: "#10b981",
    resources: [
      {
        name: "American Red Cross",
        description:
          "Disaster relief, blood donations, and emergency assistance worldwide.",
        phone: "1-800-733-2767",
        website: "https://www.redcross.org/",
        type: "disaster",
      },
      {
        name: "FEMA",
        description:
          "Federal Emergency Management Agency - disaster assistance and recovery.",
        phone: "1-800-621-3362",
        website: "https://www.fema.gov/",
        type: "disaster",
      },
      {
        name: "World Vision",
        description:
          "Christian humanitarian organization responding to disasters globally.",
        phone: "1-888-511-6548",
        website: "https://www.worldvision.org/",
        type: "disaster",
      },
      {
        name: "Doctors Without Borders (MSF)",
        description:
          "Emergency medical aid in conflict zones and disaster areas.",
        website: "https://www.doctorswithoutborders.org/",
        type: "disaster",
      },
      {
        name: "International Rescue Committee (IRC)",
        description: "Humanitarian aid and refugee support worldwide.",
        website: "https://www.rescue.org/",
        type: "disaster",
      },
    ],
  },
};

const SupportGroupsPopup = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState("crisis");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  // Filter resources based on search
  const filteredResources = SUPPORT_GROUPS[activeCategory].resources.filter(
    (resource) =>
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
              "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(190, 24, 93, 0.05) 100%)",
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
                background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                color: "white",
                boxShadow: "0 4px 12px rgba(236, 72, 153, 0.3)",
              }}
            >
              <FiHeart />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
                Support Groups
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                }}
              >
                Verified crisis hotlines, mental health resources & support
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

        {/* Category Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--border-color)",
            overflowX: "auto",
            flexShrink: 0,
          }}
        >
          {Object.entries(SUPPORT_GROUPS).map(([key, category]) => {
            const Icon = category.icon;
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1rem",
                  background: isActive
                    ? `linear-gradient(135deg, ${category.color} 0%, ${category.color}cc 100%)`
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${
                    isActive ? category.color : "var(--border-color)"
                  }`,
                  borderRadius: "2rem",
                  color: isActive ? "white" : "var(--text-secondary)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                <Icon size={14} />
                {category.title}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div
          style={{
            padding: "0.75rem 1.5rem",
            borderBottom: "1px solid var(--border-color)",
            flexShrink: 0,
          }}
        >
          <div style={{ position: "relative" }}>
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
              placeholder={`Search ${SUPPORT_GROUPS[activeCategory].title.toLowerCase()}...`}
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
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
          }}
        >
          {/* Category Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: `${SUPPORT_GROUPS[activeCategory].color}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: SUPPORT_GROUPS[activeCategory].color,
              }}
            >
              {React.createElement(SUPPORT_GROUPS[activeCategory].icon, {
                size: 18,
              })}
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                {SUPPORT_GROUPS[activeCategory].title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                }}
              >
                {filteredResources.length} resource
                {filteredResources.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>

          {/* Resources Grid */}
          <div
            style={{
              display: "grid",
              gap: "1rem",
            }}
          >
            {filteredResources.map((resource, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  background: "var(--card-bg)",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border-color)",
                  padding: "1.25rem",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    SUPPORT_GROUPS[activeCategory].color + "50";
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.background = "var(--card-bg)";
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
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {resource.name}
                  </h4>
                  {resource.available && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.2rem 0.5rem",
                        background: "rgba(16, 185, 129, 0.15)",
                        borderRadius: "1rem",
                        fontSize: "0.7rem",
                        color: "#10b981",
                        fontWeight: 500,
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#10b981",
                        }}
                      />
                      {resource.available}
                    </span>
                  )}
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    marginBottom: "1rem",
                  }}
                >
                  {resource.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  {resource.phone && (
                    <a
                      href={
                        resource.type === "text"
                          ? `sms:${resource.phone}`
                          : `tel:${resource.phone.replace(/-/g, "")}`
                      }
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 1rem",
                        background:
                          "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
                        borderRadius: "0.5rem",
                        color: "white",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        textDecoration: "none",
                        transition: "all 0.2s",
                      }}
                    >
                      <FiPhone style={{ fontSize: "0.9rem" }} />
                      {resource.phone}
                    </a>
                  )}
                  <a
                    href={resource.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 1rem",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                  >
                    <FiGlobe style={{ fontSize: "0.9rem" }} />
                    Visit Website
                    <FiExternalLink style={{ fontSize: "0.7rem" }} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredResources.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 1rem",
                color: "var(--text-secondary)",
              }}
            >
              <FiSearch
                style={{
                  fontSize: "2rem",
                  marginBottom: "1rem",
                  opacity: 0.5,
                }}
              />
              <p>No resources found matching your search.</p>
            </div>
          )}

          {/* Disclaimer */}
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
            }}
          >
            <FiAlertCircle
              style={{
                color: "#ef4444",
                fontSize: "1.1rem",
                flexShrink: 0,
                marginTop: "0.1rem",
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  color: "#ef4444",
                  marginBottom: "0.25rem",
                }}
              >
                Emergency?
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                If you or someone you know is in immediate danger, please call
                911 or go to the nearest emergency room immediately.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SupportGroupsPopup;
