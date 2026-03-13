import { motion } from "framer-motion";
import { FiGlobe, FiHeart, FiShield, FiUsers, FiMapPin } from "react-icons/fi";
import { RiGovernmentLine, RiHospitalLine } from "react-icons/ri";

const PartnerOrganizations = () => {
  const organizations = [
    {
      name: "International Red Cross & Red Crescent",
      type: "Humanitarian",
      icon: <FiHeart style={{ color: "#ef4444" }} />,
      description:
        "Global humanitarian network providing emergency assistance, disaster relief, and health services worldwide.",
      focus: ["Disaster Response", "Health Services", "Humanitarian Aid"],
      contact: "redcross.org",
      global: true,
    },
    {
      name: "United Nations Office for the Coordination of Humanitarian Affairs (OCHA)",
      type: "International Organization",
      icon: <FiGlobe style={{ color: "#1e40af" }} />,
      description:
        "Coordinates humanitarian response in complex emergencies and natural disasters.",
      focus: [
        "Emergency Coordination",
        "Humanitarian Policy",
        "Disaster Management",
      ],
      contact: "unocha.org",
      global: true,
    },
    {
      name: "World Health Organization (WHO)",
      type: "Health Organization",
      icon: <RiHospitalLine style={{ color: "#10b981" }} />,
      description:
        "Leading authority on global health matters, coordinating international health responses.",
      focus: ["Global Health", "Disease Prevention", "Health Emergencies"],
      contact: "who.int",
      global: true,
    },
    {
      name: "International Organization for Migration (IOM)",
      type: "Migration & Humanitarian",
      icon: <FiUsers style={{ color: "#7c3aed" }} />,
      description:
        "Works to ensure humane and orderly migration for the benefit of all.",
      focus: ["Migration Support", "Displacement Aid", "Human Rights"],
      contact: "iom.int",
      global: true,
    },
    {
      name: "Amnesty International",
      type: "Human Rights",
      icon: <FiShield style={{ color: "#ea580c" }} />,
      description:
        "Global movement campaigning for human rights and justice worldwide.",
      focus: ["Human Rights", "Justice", "Peace Advocacy"],
      contact: "amnesty.org",
      global: true,
    },
    {
      name: "Save the Children",
      type: "Child Protection",
      icon: <FiHeart style={{ color: "#ec4899" }} />,
      description:
        "Leading independent organization creating lasting change for children in need.",
      focus: ["Child Protection", "Education", "Health", "Emergency Response"],
      contact: "savethechildren.org",
      global: true,
    },
    {
      name: "CARE International",
      type: "Development & Humanitarian",
      icon: <FiHeart style={{ color: "#059669" }} />,
      description:
        "Fighting global poverty and providing lifesaving assistance in over 100 countries.",
      focus: ["Poverty Reduction", "Emergency Relief", "Women's Empowerment"],
      contact: "care.org",
      global: true,
    },
    {
      name: "Doctors Without Borders (MSF)",
      type: "Medical Humanitarian",
      icon: <RiHospitalLine style={{ color: "#dc2626" }} />,
      description:
        "International medical humanitarian organization providing emergency medical assistance.",
      focus: [
        "Emergency Medicine",
        "Surgery",
        "Mental Health",
        "Disease Control",
      ],
      contact: "doctorswithoutborders.org",
      global: true,
    },
    {
      name: "United Nations High Commissioner for Refugees (UNHCR)",
      type: "Refugee Protection",
      icon: <FiShield style={{ color: "#1e3a8a" }} />,
      description:
        "Protects and assists refugees, forcibly displaced communities, and stateless people.",
      focus: ["Refugee Protection", "Asylum Support", "Displacement Aid"],
      contact: "unhcr.org",
      global: true,
    },
    {
      name: "World Food Programme (WFP)",
      type: "Food Security",
      icon: <FiHeart style={{ color: "#16a34a" }} />,
      description:
        "World's largest humanitarian organization fighting hunger worldwide.",
      focus: [
        "Food Assistance",
        "Nutrition",
        "School Feeding",
        "Emergency Response",
      ],
      contact: "wfp.org",
      global: true,
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
              background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "2rem",
            }}
          >
            <FiGlobe />
          </div>
          <h1
            className="text-gradient"
            style={{ fontSize: "2.5rem", marginBottom: "1rem" }}
          >
            Trusted Organizations
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Trusted humanitarian and international organizations working
            together to provide emergency assistance and support worldwide.
          </p>
        </motion.div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "2rem",
          }}
        >
          {organizations.map((org, index) => (
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
                <div style={{ fontSize: "2rem" }}>{org.icon}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.2rem" }}>
                    {org.name}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        background: "rgba(59, 130, 246, 0.2)",
                        color: "var(--accent-color)",
                        borderRadius: "0.75rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {org.type}
                    </span>
                    {org.global && (
                      <span
                        style={{
                          padding: "0.2rem 0.6rem",
                          background: "rgba(16, 185, 129, 0.2)",
                          color: "#10b981",
                          borderRadius: "0.75rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <FiGlobe style={{ fontSize: "0.6rem" }} />
                        Global
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "1.5rem",
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                }}
              >
                {org.description}
              </p>

              <div style={{ marginBottom: "1.5rem" }}>
                <h4
                  style={{
                    marginBottom: "0.75rem",
                    color: "var(--accent-color)",
                    fontSize: "0.9rem",
                  }}
                >
                  Areas of Focus:
                </h4>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  {org.focus.map((area, areaIndex) => (
                    <span
                      key={areaIndex}
                      style={{
                        padding: "0.3rem 0.6rem",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "0.4rem",
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div
                style={{
                  padding: "1rem",
                  background: "rgba(59, 130, 246, 0.1)",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <FiGlobe style={{ color: "var(--accent-color)" }} />
                <span
                  style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
                >
                  Visit:{" "}
                  <a
                    href={`https://${org.contact}`}
                    style={{ color: "var(--accent-color)" }}
                  >
                    {org.contact}
                  </a>
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={itemVariants}
          className="card glass"
          style={{ marginTop: "3rem", padding: "2rem", textAlign: "center" }}
        >
          <h2 style={{ marginBottom: "1rem" }}>How We Partner</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            G.R.O.A leverages these organizations to provide
            comprehensive emergency response and humanitarian support. Our
            partnership ensure verified information and coordinated assistance
            during crises.
          </p>

          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "2rem",
            }}
          >
            <div
              style={{
                padding: "1.5rem",
                background: "rgba(59, 130, 246, 0.1)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              <FiShield
                style={{
                  fontSize: "2rem",
                  color: "var(--accent-color)",
                  marginBottom: "1rem",
                }}
              />
              <h4 style={{ margin: "0 0 0.5rem 0" }}>Information Sharing</h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                Real-time data exchange and situation updates between
                organizations
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
              <FiUsers
                style={{
                  fontSize: "2rem",
                  color: "#10b981",
                  marginBottom: "1rem",
                }}
              />
              <h4 style={{ margin: "0 0 0.5rem 0" }}>Coordinated Response</h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                Joint operations and resource allocation for maximum impact
              </p>
            </div>

            <div
              style={{
                padding: "1.5rem",
                background: "rgba(245, 158, 11, 0.1)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(245, 158, 11, 0.3)",
              }}
            >
              <FiMapPin
                style={{
                  fontSize: "2rem",
                  color: "#f59e0b",
                  marginBottom: "1rem",
                }}
              />
              <h4 style={{ margin: "0 0 0.5rem 0" }}>Local Expertise</h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                Leveraging on-the-ground knowledge and established networks
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PartnerOrganizations;
