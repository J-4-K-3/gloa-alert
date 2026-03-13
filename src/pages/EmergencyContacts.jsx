import { motion } from "framer-motion";
import {
  FiPhone,
  FiMail,
  FiGlobe,
  FiAlertTriangle,
  FiMapPin,
} from "react-icons/fi";
import {
  RiShieldLine,
  RiPoliceCarLine,
  RiFireLine,
  RiHospitalLine,
} from "react-icons/ri";

const EmergencyContacts = () => {
  const globalContacts = [
    {
      region: "International",
      contacts: [
        {
          name: "International Red Cross",
          number: "+41 22 730 4222",
          type: "Humanitarian",
          icon: <RiShieldLine />,
        },
        {
          name: "UN Emergency Services",
          number: "+1 917 367 3000",
          type: "United Nations",
          icon: <FiGlobe />,
        },
        {
          name: "Amnesty International",
          number: "+44 20 7413 5500",
          type: "Human Rights",
          icon: <FiAlertTriangle />,
        },
      ],
    },
    {
      region: "Europe",
      contacts: [
        {
          name: "European Emergency Number",
          number: "112",
          type: "All Emergencies",
          icon: <FiPhone />,
        },
        {
          name: "European Commission Civil Protection",
          number: "+32 2 299 1111",
          type: "Disaster Response",
          icon: <RiShieldLine />,
        },
      ],
    },
    {
      region: "North America",
      contacts: [
        {
          name: "US Emergency Services",
          number: "911",
          type: "Police/Fire/Medical",
          icon: <RiPoliceCarLine />,
        },
        {
          name: "Canada Emergency Services",
          number: "911",
          type: "Police/Fire/Medical",
          icon: <RiPoliceCarLine />,
        },
        {
          name: "FEMA Disaster Response",
          number: "+1 202 646 2500",
          type: "Disaster Relief",
          icon: <RiShieldLine />,
        },
      ],
    },
    {
      region: "Asia Pacific",
      contacts: [
        {
          name: "ASEAN Coordinating Centre",
          number: "+66 2 288 2100",
          type: "Regional Disaster",
          icon: <RiShieldLine />,
        },
        {
          name: "Pacific Disaster Center",
          number: "+1 808 235 5560",
          type: "Pacific Islands",
          icon: <FiGlobe />,
        },
      ],
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
          <h1
            className="text-gradient"
            style={{ fontSize: "2.5rem", marginBottom: "1rem" }}
          >
            Emergency Contacts
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Critical contact information for emergency services worldwide. Keep
            these numbers saved and accessible.
          </p>
        </motion.div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "2rem",
          }}
        >
          {globalContacts.map((region, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="card glass"
              style={{ padding: "2rem" }}
            >
              <h2
                style={{
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <FiMapPin style={{ color: "var(--accent-color)" }} />
                {region.region}
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {region.contacts.map((contact, contactIndex) => (
                  <div
                    key={contactIndex}
                    style={{
                      padding: "1rem",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border-color)",
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        background: "var(--accent-color)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      {contact.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1rem" }}>
                        {contact.name}
                      </h3>
                      <p
                        style={{
                          margin: "0 0 0.25rem 0",
                          color: "var(--text-secondary)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {contact.type}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          color: "var(--accent-color)",
                          fontFamily: "monospace",
                        }}
                      >
                        {contact.number}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={itemVariants}
          className="card glass"
          style={{ marginTop: "3rem", padding: "2rem", textAlign: "center" }}
        >
          <h2 style={{ marginBottom: "1rem" }}>Emergency Preparedness</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Save these numbers in your phone and share them with family members.
            In crisis situations, local emergency numbers may be unavailable -
            these international contacts can help coordinate assistance.
          </p>

          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            <div
              style={{
                padding: "1rem",
                background: "rgba(16, 185, 129, 0.1)",
                borderRadius: "0.5rem",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              <RiHospitalLine
                style={{
                  fontSize: "2rem",
                  color: "#10b981",
                  marginBottom: "0.5rem",
                }}
              />
              <h4 style={{ margin: "0 0 0.25rem 0" }}>Medical Emergency</h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                }}
              >
                Call local emergency services first, then international if
                needed
              </p>
            </div>

            <div
              style={{
                padding: "1rem",
                background: "rgba(239, 68, 68, 0.1)",
                borderRadius: "0.5rem",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              <RiFireLine
                style={{
                  fontSize: "2rem",
                  color: "#ef4444",
                  marginBottom: "0.5rem",
                }}
              />
              <h4 style={{ margin: "0 0 0.25rem 0" }}>Fire & Rescue</h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                }}
              >
                Immediate response for fire, accidents, and natural disasters
              </p>
            </div>

            <div
              style={{
                padding: "1rem",
                background: "rgba(59, 130, 246, 0.1)",
                borderRadius: "0.5rem",
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              <RiPoliceCarLine
                style={{
                  fontSize: "2rem",
                  color: "var(--accent-color)",
                  marginBottom: "0.5rem",
                }}
              />
              <h4 style={{ margin: "0 0 0.25rem 0" }}>Police & Security</h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                }}
              >
                Law enforcement and personal safety emergencies
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EmergencyContacts;
