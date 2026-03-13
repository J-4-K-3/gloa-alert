import { motion } from "framer-motion";
import {
  FiTarget,
  FiShield,
  FiZap,
  FiUsers,
  FiCheckCircle,
  FiCpu,
  FiMessageCircle,
} from "react-icons/fi";

const About = () => {
  const principles = [
    {
      title: "Transparency",
      icon: <FiTarget />,
      description:
        "Every alert includes verifiable evidence and source intelligence.",
    },
    {
      title: "Accuracy",
      icon: <FiShield />,
      description: "Multi-layer validation systems eliminate misinformation.",
    },
    {
      title: "Timeliness",
      icon: <FiZap />,
      description:
        "Millisecond-latency data pipelines for instant notification.",
    },
    {
      title: "Human-Centric",
      icon: <FiUsers />,
      description:
        "Designed for people, not just data points. Actionable advice always.",
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ paddingTop: "140px", paddingBottom: "40px" }}
    >
      <div className="container" style={{ maxWidth: "1000px" }}>
        <section
          style={{
            textAlign: "center",
            marginBottom: "3rem",
            marginTop: "2rem",
          }}
        >
          <motion.h1
            variants={itemVariants}
            className="text-gradient"
            style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}
          >
            The Science of Safety
          </motion.h1>
          <motion.p
            variants={itemVariants}
            style={{
              fontSize: "1.25rem",
              color: "var(--text-secondary)",
              maxWidth: "700px",
              margin: "0 auto",
            }}
          >
            G.R.O.A is more than a map. It's a global intelligence network built
            to protect humanity through verified data and real-time situational
            awareness.
          </motion.p>
        </section>

        <section style={{ marginBottom: "8rem" }}>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {principles.map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="card glass"
                style={{ textAlign: "center" }}
              >
                <div
                  style={{
                    fontSize: "2.5rem",
                    color: "var(--accent-color)",
                    marginBottom: "1rem",
                  }}
                >
                  {item.icon}
                </div>
                <h3 style={{ marginBottom: "0.75rem" }}>{item.title}</h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.95rem",
                  }}
                >
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <div
          className="about-engine-grid"
        >
          <motion.div variants={itemVariants}>
            <h2 className="section-title">The G.R.O.A Engine</h2>
            <p className="about-engine-p"
            >
              Our platform leverages distributed sensor networks and AI-driven
              semantic analysis to monitor global volatility.
            </p>
            <ul className="about-engine-ul"
            >
              {[
                {
                  icon: <FiCpu />,
                  text: "Machine learning for early detection",
                },
                { icon: <FiCheckCircle />, text: "Source reliability scoring" },
                {
                  icon: <FiMessageCircle />,
                  text: "Decentralized reporting nodes",
                },
              ].map((li, i) => (
            <li
                  key={i}
                  className="about-engine-li"
                >
                  <span style={{ color: "var(--accent-color)" }}>
                    {li.icon}
                  </span>{" "}
                  {li.text}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            variants={itemVariants}
            className="card glass"
            style={{ padding: "3rem", position: "relative" }}
          >
            <div
              style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "100px",
                height: "100px",
                background: "var(--accent-glow)",
                filter: "blur(40px)",
                zIndex: 0,
              }}
            />
            <h3 style={{ marginBottom: "1.5rem", position: "relative" }}>
              Verification Policy
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                position: "relative",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--accent-color)",
                    fontWeight: 800,
                  }}
                >
                  TIER 1
                </span>
                <p style={{ fontWeight: 600 }}>
                  Government & Satellite Verified
                </p>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--alert-high)",
                    fontWeight: 800,
                  }}
                >
                  TIER 2
                </span>
                <p style={{ fontWeight: 600 }}>
                  Multi-Source Independent Reports
                </p>
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                    fontWeight: 800,
                  }}
                >
                  TIER 3
                </span>
                <p style={{ fontWeight: 600 }}>
                  Developing Situation / Single Source
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/*<section style={{ textAlign: "center" }}>
          <h2 className="section-title" style={{ justifyContent: "center" }}>
            Connect with Us
          </h2>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            }}
          >
            <div className="card glass">
              <h3>Technical Support</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                ops@innoxation.com
              </p>
            </div>
            <div className="card glass">
              <h3>Media Inquiries</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                press@groa-network.io
              </p>
            </div>
          </div>
        </section>*/}
      </div>
    </motion.div>
  );
};

export default About;
