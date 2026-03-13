import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiPackage,
  FiMapPin,
  FiPhone,
  FiMessageSquare,
  FiHeart,
  FiInfo,
  FiChevronDown,
  FiChevronUp,
  FiGlobe,
} from "react-icons/fi";
import {
  safetyProtocols,
  emergencyTypes,
  authoritativeResources,
  getRegionalGuidelines,
} from "../../lib/safetyData";

const SafetyProtocolsPopup = ({ isOpen, onClose, location }) => {
  const [activeTab, setActiveTab] = useState("protocols");
  const [expandedSection, setExpandedSection] = useState("immediateActions");
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  
  const regionGuidelines = getRegionalGuidelines(location);

  if (!isOpen) return null;

  // Tab configuration
  const tabs = [
    { id: "protocols", label: "Protocols", icon: FiShield },
    { id: "emergency", label: "Emergency Types", icon: FiAlertTriangle },
    { id: "resources", label: "Resources", icon: FiGlobe },
  ];

  // Render stars rating for importance
  const renderStars = (level) => {
    return "★".repeat(level) + "☆".repeat(5 - level);
  };

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
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.05) 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              }}
            >
              <FiShield />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>
                Safety Protocols
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                }}
              >
                Essential safety procedures from{" "}
                <span style={{ color: "#3b82f6" }}>FEMA, Red Cross, WHO</span>{" "}
                and other authoritative organizations
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
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "emergency") {
                    setSelectedEmergency("earthquake");
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1.2rem",
                  background:
                    activeTab === tab.id
                      ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                      : "transparent",
                  border: "none",
                  borderRadius: "0.5rem",
                  color: activeTab === tab.id ? "white" : "var(--text-secondary)",
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
          {/* PROTOCOLS TAB */}
          {activeTab === "protocols" && (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {/* Regional Info Banner */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(29, 78, 216, 0.1) 100%)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "0.75rem",
                  padding: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <FiMapPin style={{ color: "#3b82f6" }} />
                  <span style={{ fontWeight: 600, color: "#3b82f6" }}>
                    Your Region: {location || "General Guidelines"}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Primary Agency</span>
                    <div style={{ fontWeight: 500 }}>{regionGuidelines.primaryAgency}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Emergency Number</span>
                    <div style={{ fontWeight: 600, color: "#ef4444", fontSize: "1.1rem" }}>{regionGuidelines.emergencyNumber}</div>
                  </div>
                </div>
                <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(59, 130, 246, 0.2)" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Regional Advice:</span>
                  <ul style={{ margin: "0.5rem 0 0 0", paddingLeft: "1.2rem", fontSize: "0.85rem" }}>
                    {regionGuidelines.specificAdvice.map((advice, idx) => (
                      <li key={idx} style={{ marginBottom: "0.25rem" }}>{advice}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Immediate Actions */}
              <SectionCard
                title={safetyProtocols.immediateActions.title}
                icon={safetyProtocols.immediateActions.icon}
                description={safetyProtocols.immediateActions.description}
                expanded={expandedSection === "immediateActions"}
                onToggle={() => setExpandedSection(expandedSection === "immediateActions" ? null : "immediateActions")}
              >
                <div style={{ display: "grid", gap: "1rem" }}>
                  {safetyProtocols.immediateActions.steps.map((step, idx) => (
                    <StepCard key={idx} step={step} />
                  ))}
                </div>
              </SectionCard>

              {/* Emergency Kit */}
              <SectionCard
                title={safetyProtocols.emergencyKit.title}
                icon={safetyProtocols.emergencyKit.icon}
                description={safetyProtocols.emergencyKit.description}
                expanded={expandedSection === "emergencyKit"}
                onToggle={() => setExpandedSection(expandedSection === "emergencyKit" ? null : "emergencyKit")}
              >
                <div style={{ display: "grid", gap: "1rem" }}>
                  {safetyProtocols.emergencyKit.categories.map((category, idx) => (
                    <CategoryCard key={idx} category={category} />
                  ))}
                </div>
              </SectionCard>

              {/* Evacuation */}
              <SectionCard
                title={safetyProtocols.evacuation.title}
                icon={safetyProtocols.evacuation.icon}
                description={safetyProtocols.evacuation.description}
                expanded={expandedSection === "evacuation"}
                onToggle={() => setExpandedSection(expandedSection === "evacuation" ? null : "evacuation")}
              >
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
                    {safetyProtocols.evacuation.stages.map((stage, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "rgba(0, 0, 0, 0.3)",
                          borderRadius: "0.5rem",
                          padding: "1rem",
                          textAlign: "center",
                          border: `1px solid ${stage.color}40`,
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: stage.color,
                            color: "white",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 0.5rem",
                          }}
                        >
                          {stage.stage}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.25rem" }}>{stage.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{stage.content}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "rgba(239, 68, 68, 0.1)", borderRadius: "0.5rem", padding: "1rem", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                    <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#ef4444" }}>⚠️ Critical Tips</div>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem" }}>
                      {safetyProtocols.evacuation.tips.map((tip, idx) => (
                        <li key={idx} style={{ marginBottom: "0.25rem" }}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </SectionCard>

              {/* Communication */}
              <SectionCard
                title={safetyProtocols.communication.title}
                icon={safetyProtocols.communication.icon}
                description={safetyProtocols.communication.description}
                expanded={expandedSection === "communication"}
                onToggle={() => setExpandedSection(expandedSection === "communication" ? null : "communication")}
              >
                <div style={{ display: "grid", gap: "1rem" }}>
                  {safetyProtocols.communication.chains.map((chain, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(59, 130, 246, 0.1)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{chain.title}</div>
                      <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{chain.content}</div>
                      <div style={{ fontSize: "0.75rem", color: "#3b82f6", marginTop: "0.5rem" }}>Source: {chain.source}</div>
                    </div>
                  ))}
                  <div style={{ background: "rgba(16, 185, 129, 0.1)", borderRadius: "0.5rem", padding: "1rem", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                    <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#10b981" }}>📱 Check-in Procedures</div>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem" }}>
                      {safetyProtocols.communication.checkIn.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: "0.25rem" }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </SectionCard>

              {/* First Aid */}
              <SectionCard
                title={safetyProtocols.firstAid.title}
                icon={safetyProtocols.firstAid.icon}
                description={safetyProtocols.firstAid.description}
                expanded={expandedSection === "firstAid"}
                onToggle={() => setExpandedSection(expandedSection === "firstAid" ? null : "firstAid")}
              >
                <div style={{ display: "grid", gap: "1rem" }}>
                  {safetyProtocols.firstAid.conditions.map((condition, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(0, 0, 0, 0.3)",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ color: "#ef4444" }}>🩹</span> {condition.title}
                      </div>
                      <ol style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem" }}>
                        {condition.steps.map((step, sidx) => (
                          <li key={sidx} style={{ marginBottom: "0.25rem", color: "var(--text-secondary)" }}>{step}</li>
                        ))}
                      </ol>
                      <a
                        href={condition.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontSize: "0.75rem",
                          color: "#3b82f6",
                          marginTop: "0.5rem",
                        }}
                      >
                        Learn more <FiExternalLink size={10} />
                      </a>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          )}

          {/* EMERGENCY TYPES TAB */}
          {activeTab === "emergency" && (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {/* Emergency Type Selector */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: "0.5rem",
                }}
              >
                {emergencyTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedEmergency(type.id)}
                    style={{
                      padding: "0.75rem",
                      background: selectedEmergency === type.id
                        ? `linear-gradient(135deg, ${type.color} 0%, ${type.color}cc 100%)`
                        : "rgba(0, 0, 0, 0.3)",
                      border: `1px solid ${selectedEmergency === type.id ? type.color : "var(--border-color)"}`,
                      borderRadius: "0.5rem",
                      color: selectedEmergency === type.id ? "white" : "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>{type.icon}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>{type.label}</span>
                  </button>
                ))}
              </div>

              {/* Selected Emergency Protocol */}
              {selectedEmergency && (
                <EmergencyProtocolCard emergencyType={selectedEmergency} />
              )}
            </div>
          )}

          {/* RESOURCES TAB */}
          {activeTab === "resources" && (
            <div style={{ display: "grid", gap: "1.5rem" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "0.75rem",
                  padding: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                  <FiInfo style={{ color: "#10b981" }} />
                  <span style={{ fontWeight: 600, color: "#10b981" }}>Authoritative Safety Resources</span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
                  These resources are provided by globally recognized organizations specializing in emergency management, 
                  disaster response, and public safety. Click to learn more.
                </p>
              </div>

              <div style={{ display: "grid", gap: "1rem" }}>
                {authoritativeResources.map((resource, idx) => (
                  <ResourceCard key={idx} resource={resource} />
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
          <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <FiShield size={12} /> Verified Sources
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Section Card Component
const SectionCard = ({ title, icon, description, expanded, onToggle, children }) => (
  <div
    style={{
      background: "var(--card-bg)",
      borderRadius: "0.75rem",
      border: "1px solid var(--border-color)",
      overflow: "hidden",
    }}
  >
    <button
      onClick={onToggle}
      style={{
        width: "100%",
        padding: "1rem 1.25rem",
        background: "transparent",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        color: "white",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.25rem" }}>{icon}</span>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 600, fontSize: "1rem" }}>{title}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{description}</div>
        </div>
      </div>
      {expanded ? <FiChevronUp /> : <FiChevronDown />}
    </button>
    <AnimatePresence>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          style={{ padding: "0 1.25rem 1.25rem", overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Step Card Component
const StepCard = ({ step }) => (
  <div
    style={{
      display: "flex",
      gap: "1rem",
      alignItems: "flex-start",
    }}
  >
    <div
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: step.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1rem",
        fontWeight: 700,
        color: "white",
        flexShrink: 0,
        boxShadow: `0 4px 12px ${step.color}40`,
      }}
    >
      {step.number}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <h4 style={{ margin: 0, fontSize: "1rem", color: step.color }}>{step.title}</h4>
        <a
          href={step.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "0.7rem",
            color: "#3b82f6",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          {step.source} <FiExternalLink size={10} />
        </a>
      </div>
      <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
        {step.content}
      </p>
    </div>
  </div>
);

// Category Card Component
const CategoryCard = ({ category }) => (
  <div
    style={{
      background: "rgba(0, 0, 0, 0.3)",
      borderRadius: "0.5rem",
      padding: "1rem",
      border: "1px solid var(--border-color)",
    }}
  >
    <div style={{ fontWeight: 600, marginBottom: "0.75rem", color: "#10b981" }}>{category.name}</div>
    <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.85rem" }}>
      {category.items.map((item, idx) => (
        <li key={idx} style={{ marginBottom: "0.25rem", color: "var(--text-secondary)" }}>{item}</li>
      ))}
    </ul>
  </div>
);

// Emergency Protocol Card Component
const EmergencyProtocolCard = ({ emergencyType }) => {
  const protocol = safetyProtocols.disasterSpecific.disasters.find(
    (d) => d.type === emergencyType
  );

  if (!protocol) return null;

  return (
    <div
      style={{
        background: "var(--card-bg)",
        borderRadius: "0.75rem",
        border: `1px solid ${protocol.color}40`,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1.25rem",
          background: `linear-gradient(135deg, ${protocol.color}20 0%, ${protocol.color}10 100%)`,
          borderBottom: `1px solid ${protocol.color}30`,
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <span style={{ fontSize: "2rem" }}>{protocol.icon}</span>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>{emergencyTypes.find(e => e.id === emergencyType)?.label}</h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Step-by-step safety protocols
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "1.25rem", display: "grid", gap: "1.5rem" }}>
        {/* Before */}
        <ProtocolPhase title="Before the Emergency" phase="before" items={protocol.before} color={protocol.color} />
        
        {/* During */}
        <ProtocolPhase title="During the Emergency" phase="during" items={protocol.during} color={protocol.color} />
        
        {/* After */}
        <ProtocolPhase title="After the Emergency" phase="after" items={protocol.after} color={protocol.color} />
      </div>

      {/* Sources */}
      <div
        style={{
          padding: "1rem 1.25rem",
          background: "rgba(0, 0, 0, 0.3)",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Official Sources:</div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {protocol.sources.map((source, idx) => (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                fontSize: "0.85rem",
                color: "#3b82f6",
                textDecoration: "none",
              }}
            >
              {source.name} <FiExternalLink size={12} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

// Protocol Phase Component
const ProtocolPhase = ({ title, phase, items, color }) => (
  <div>
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: color,
        }}
      />
      <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{title}</h4>
    </div>
    <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.9rem" }}>
      {items.map((item, idx) => (
        <li key={idx} style={{ marginBottom: "0.5rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>{item}</li>
      ))}
    </ul>
  </div>
);

// Resource Card Component
const ResourceCard = ({ resource }) => (
  <a
    href={resource.url}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "1rem",
      background: "rgba(0, 0, 0, 0.3)",
      borderRadius: "0.5rem",
      border: "1px solid var(--border-color)",
      textDecoration: "none",
      color: "inherit",
      transition: "all 0.2s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)";
      e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "var(--border-color)";
      e.currentTarget.style.background = "rgba(0, 0, 0, 0.3)";
    }}
  >
    <span style={{ fontSize: "2rem" }}>{resource.logo}</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{resource.organization}</div>
      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>{resource.description}</div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {resource.topics.map((topic, idx) => (
          <span
            key={idx}
            style={{
              fontSize: "0.7rem",
              padding: "0.15rem 0.5rem",
              background: "rgba(59, 130, 246, 0.2)",
              borderRadius: "1rem",
              color: "#3b82f6",
            }}
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
    <FiExternalLink style={{ color: "var(--text-secondary)" }} />
  </a>
);

export default SafetyProtocolsPopup;

