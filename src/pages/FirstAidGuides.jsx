import { motion } from "framer-motion";
import {
  FiHeart,
  FiAlertTriangle,
  FiActivity,
  FiThermometer,
  FiDroplet,
  FiPhone,
} from "react-icons/fi";
import { RiFirstAidKitLine, RiLungsLine } from "react-icons/ri";

const FirstAidGuides = () => {
  const guides = [
    {
      title: "CPR & Cardiac Arrest",
      icon: <FiHeart style={{ color: "#ef4444" }} />,
      priority: "Critical",
      steps: [
        "Check responsiveness and breathing",
        "Call emergency services immediately",
        "Begin chest compressions: 100-120 per minute",
        "Give rescue breaths if trained",
        "Continue until help arrives or person responds",
      ],
      tips: "Push hard and fast in the center of the chest. Minimize interruptions.",
    },
    {
      title: "Severe Bleeding",
      icon: <FiDroplet style={{ color: "#ef4444" }} />,
      priority: "High",
      steps: [
        "Apply direct pressure with clean cloth",
        "Elevate injured area above heart level",
        "Apply pressure bandage if bleeding continues",
        "Do not remove embedded objects",
        "Seek immediate medical attention",
      ],
      tips: "Use gloves if available. Apply pressure firmly but not tightly.",
    },
    {
      title: "Choking",
      icon: <RiLungsLine style={{ color: "#f97316" }} />,
      priority: "Critical",
      steps: [
        "Encourage coughing if person can breathe",
        "Perform Heimlich maneuver if choking",
        "For infants: back slaps and chest thrusts",
        "Continue until object is expelled",
        "Seek medical help if injury suspected",
      ],
      tips: "Act quickly but safely. Call for help immediately.",
    },
    {
      title: "Burns",
      icon: <FiThermometer style={{ color: "#f97316" }} />,
      priority: "Medium",
      steps: [
        "Cool burn with running water for 20 minutes",
        "Remove jewelry and tight clothing",
        "Cover with clean, non-fluffy dressing",
        "Do not apply creams or oils",
        "Seek medical attention for serious burns",
      ],
      tips: "Do not burst blisters. Keep person warm and comfortable.",
    },
    {
      title: "Fractures & Sprains",
      icon: <FiActivity style={{ color: "#eab308" }} />,
      priority: "Medium",
      steps: [
        "Immobilize injured area",
        "Apply ice wrapped in cloth",
        "Elevate to reduce swelling",
        "Provide pain relief if available",
        "Seek professional medical care",
      ],
      tips: "Do not attempt to realign bones. Support with padding.",
    },
    {
      title: "Shock",
      icon: <FiAlertTriangle style={{ color: "#ef4444" }} />,
      priority: "High",
      steps: [
        "Lay person down and elevate legs slightly",
        "Keep person warm and comfortable",
        "Do not give food or drink",
        "Monitor breathing and consciousness",
        "Seek immediate medical attention",
      ],
      tips: "Shock can follow any injury. Act quickly to prevent deterioration.",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "#ef4444";
      case "High":
        return "#f97316";
      case "Medium":
        return "#eab308";
      default:
        return "#6b7280";
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ paddingTop: "140px", paddingBottom: "40px" }}
    >
      <div className="container">
        <motion.div
          variants={itemVariants}
          style={{ textAlign: "center", marginBottom: "3rem" }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ef4444 0%, #10b981 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "2rem",
            }}
          >
            <RiFirstAidKitLine />
          </div>
          <h1
            className="text-gradient"
            style={{ fontSize: "2.5rem", marginBottom: "1rem" }}
          >
            First Aid Guides
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Essential life-saving skills for emergencies. Remember: these are
            guides, not substitutes for professional medical care.
          </p>
        </motion.div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "2rem",
          }}
        >
          {guides.map((guide, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="card glass"
              style={{ padding: "2rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ fontSize: "2rem" }}>{guide.icon}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 0.5rem 0" }}>{guide.title}</h3>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      background: `${getPriorityColor(guide.priority)}20`,
                      color: getPriorityColor(guide.priority),
                      borderRadius: "1rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {guide.priority} Priority
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <h4
                  style={{
                    marginBottom: "0.75rem",
                    color: "var(--accent-color)",
                  }}
                >
                  Steps to Take:
                </h4>
                <ol style={{ paddingLeft: "1.5rem", margin: 0 }}>
                  {guide.steps.map((step, stepIndex) => (
                    <li
                      key={stepIndex}
                      style={{
                        marginBottom: "0.5rem",
                        color: "var(--text-secondary)",
                        fontSize: "0.9rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div
                style={{
                  padding: "1rem",
                  background: "rgba(59, 130, 246, 0.1)",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 0.5rem 0",
                    color: "var(--accent-color)",
                    fontSize: "0.9rem",
                  }}
                >
                  💡 Pro Tip:
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {guide.tips}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={itemVariants}
          className="card glass"
          style={{ marginTop: "3rem", padding: "2rem", textAlign: "center" }}
        >
          <h2 style={{ marginBottom: "1rem" }}>Important Disclaimers</h2>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
              marginTop: "2rem",
            }}
          >
            <div
              style={{
                padding: "1.5rem",
                background: "rgba(239, 68, 68, 0.1)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              <FiAlertTriangle
                style={{
                  fontSize: "2rem",
                  color: "#ef4444",
                  marginBottom: "1rem",
                }}
              />
              <h4 style={{ margin: "0 0 0.5rem 0" }}>Not Medical Advice</h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                These guides are for informational purposes only. Always seek
                professional medical care.
              </p>
            </div>

            <div
              style={{
                padding: "1.5rem",
                background: "rgba(16, 185, 129, 0.1)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              <RiFirstAidKitLine
                style={{
                  fontSize: "2rem",
                  color: "#10b981",
                  marginBottom: "1rem",
                }}
              />
              <h4 style={{ margin: "0 0 0.5rem 0" }}>Get Certified</h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                Take a certified first aid course for hands-on training and
                proper certification.
              </p>
            </div>

            <div
              style={{
                padding: "1.5rem",
                background: "rgba(59, 130, 246, 0.1)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              <FiPhone
                style={{
                  fontSize: "2rem",
                  color: "var(--accent-color)",
                  marginBottom: "1rem",
                }}
              />
              <h4 style={{ margin: "0 0 0.5rem 0" }}>
                Call Emergency Services
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                In any serious emergency, call local emergency services
                immediately.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FirstAidGuides;
