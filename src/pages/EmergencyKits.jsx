import { motion } from "framer-motion";
import {
  FiPackage,
  FiCheckCircle,
  FiAlertTriangle,
  FiHome,
  FiBriefcase,
  FiTruck,
} from "react-icons/fi";
import {
  RiFirstAidKitLine,
  RiWaterFlashLine,
  RiFlashlightLine,
} from "react-icons/ri";

const EmergencyKits = () => {
  const kitTypes = [
    {
      name: "Home Emergency Kit",
      icon: <FiHome style={{ color: "#10b981" }} />,
      duration: "72 hours",
      essential: [
        "Water (1 gallon per person per day)",
        "Non-perishable food (3-day supply)",
        "Manual can opener",
        "First aid kit with supplies",
        "Flashlight and extra batteries",
        "Portable radio with batteries",
        "Important documents in waterproof container",
      ],
      additional: [
        "Medications and medical supplies",
        "Cash in small denominations",
        "Extra clothing and blankets",
        "Infant formula and diapers if needed",
        "Pet supplies if applicable",
      ],
    },
    {
      name: "Vehicle Emergency Kit",
      icon: <FiTruck style={{ color: "#3b82f6" }} />,
      duration: "Emergency situations",
      essential: [
        "Jumper cables or battery booster",
        "First aid kit",
        "Blanket and extra clothing",
        "Flashlight with extra batteries",
        "Water and non-perishable snacks",
        "Basic tool kit",
        "Tire repair kit and spare tire",
      ],
      additional: [
        "Ice scraper and snow brush",
        "Tow rope or chain",
        "Road flares or reflective triangles",
        "Cell phone charger (car adapter)",
        "Emergency contact information",
      ],
    },
    {
      name: "Workplace Emergency Kit",
      icon: <FiBriefcase style={{ color: "#f59e0b" }} />,
      duration: "Building evacuation",
      essential: [
        "Bottled water and snacks",
        "First aid supplies",
        "Flashlight and whistle",
        "Emergency contact list",
        "Important documents copy",
        "Comfort items (blanket, etc.)",
      ],
      additional: [
        "Medications",
        "Cash and ID",
        "Change of clothes",
        "Personal hygiene items",
        "Entertainment items for children",
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
            <FiPackage />
          </div>
          <h1
            className="text-gradient"
            style={{ fontSize: "2.5rem", marginBottom: "1rem" }}
          >
            Emergency Kits
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Be prepared for any emergency with comprehensive kits tailored to
            different situations and locations.
          </p>
        </motion.div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "2rem",
          }}
        >
          {kitTypes.map((kit, index) => (
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
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ fontSize: "2rem" }}>{kit.icon}</div>
                <div>
                  <h2 style={{ margin: "0 0 0.25rem 0" }}>{kit.name}</h2>
                  <p
                    style={{
                      margin: 0,
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Duration: {kit.duration}
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <h3
                  style={{
                    marginBottom: "1rem",
                    color: "var(--accent-color)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiCheckCircle />
                  Essential Items
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {kit.essential.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        marginBottom: "0.75rem",
                        padding: "0.5rem",
                        background: "rgba(16, 185, 129, 0.05)",
                        borderRadius: "0.25rem",
                      }}
                    >
                      <FiCheckCircle
                        style={{
                          color: "#10b981",
                          marginTop: "0.1rem",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3
                  style={{
                    marginBottom: "1rem",
                    color: "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiPackage />
                  Additional Items
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {kit.additional.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        marginBottom: "0.5rem",
                        padding: "0.5rem",
                        background: "rgba(245, 158, 11, 0.05)",
                        borderRadius: "0.25rem",
                      }}
                    >
                      <FiPackage
                        style={{
                          color: "#f59e0b",
                          marginTop: "0.1rem",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={itemVariants}
          className="card glass"
          style={{ marginTop: "3rem", padding: "2rem" }}
        >
          <h2 style={{ marginBottom: "2rem", textAlign: "center" }}>
            Emergency Kit Maintenance
          </h2>

          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
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
              <RiFlashlightLine
                style={{
                  fontSize: "2rem",
                  color: "var(--accent-color)",
                  marginBottom: "1rem",
                }}
              />
              <h3 style={{ margin: "0 0 0.5rem 0" }}>Regular Checks</h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "1.5rem",
                  color: "var(--text-secondary)",
                }}
              >
                <li>Check expiration dates monthly</li>
                <li>Replace batteries quarterly</li>
                <li>Rotate water and food supplies</li>
                <li>Update contact information</li>
              </ul>
            </div>

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
              <h3 style={{ margin: "0 0 0.5rem 0" }}>Storage Guidelines</h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "1.5rem",
                  color: "var(--text-secondary)",
                }}
              >
                <li>Keep in easily accessible location</li>
                <li>Store in cool, dry place</li>
                <li>Protect from extreme temperatures</li>
                <li>Label clearly for quick identification</li>
              </ul>
            </div>

            <div
              style={{
                padding: "1.5rem",
                background: "rgba(16, 185, 129, 0.1)",
                borderRadius: "0.75rem",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              <RiWaterFlashLine
                style={{
                  fontSize: "2rem",
                  color: "#10b981",
                  marginBottom: "1rem",
                }}
              />
              <h3 style={{ margin: "0 0 0.5rem 0" }}>Family Planning</h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "1.5rem",
                  color: "var(--text-secondary)",
                }}
              >
                <li>Customize for family needs</li>
                <li>Include pet supplies</li>
                <li>Consider mobility requirements</li>
                <li>Share plan with family members</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          style={{
            marginTop: "2rem",
            padding: "2rem",
            background:
              "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)",
            borderRadius: "1rem",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            textAlign: "center",
          }}
        >
          <h3 style={{ marginBottom: "1rem" }}>Ready to Build Your Kit?</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Start with the essentials and gradually add items based on your
            specific needs and location. Remember: having a plan is just as
            important as having supplies.
          </p>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "0.5rem 1rem",
                background: "rgba(16, 185, 129, 0.2)",
                borderRadius: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#10b981",
              }}
            >
              ✓ Check local emergency guidelines
            </span>
            <span
              style={{
                padding: "0.5rem 1rem",
                background: "rgba(59, 130, 246, 0.2)",
                borderRadius: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "var(--accent-color)",
              }}
            >
              ✓ Customize for your situation
            </span>
            <span
              style={{
                padding: "0.5rem 1rem",
                background: "rgba(239, 68, 68, 0.2)",
                borderRadius: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: 500,
                color: "#ef4444",
              }}
            >
              ✓ Practice emergency procedures
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EmergencyKits;
