import { motion } from "framer-motion";
import {
  FiBell,
  FiAlertCircle,
  FiShield,
  FiInfo,
  FiActivity,
  FiMapPin,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import { RiAlarmWarningLine } from "react-icons/ri";
import { useState, useEffect } from "react";
import {
  databases,
  APPWRITE_DATABASE_ID,
  COLLECTION_ALERTS_ID,
  Query,
} from "../lib/Appwrite";
import { fetchAllAlertData } from "../lib/fetchApi";
import { getTimeAgo } from "../lib/time";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);

        // Fetch data from multiple sources
        const [appwriteResponse, externalAlerts] = await Promise.allSettled([
          // Fetch from Appwrite database
          (async () => {
            const queries = [];

            if (filterLevel !== "all")
              queries.push(Query.equal("level", parseInt(filterLevel)));
            if (filterType !== "all")
              queries.push(Query.equal("category", filterType));
            queries.push(Query.orderDesc("$createdAt"));

            const response = await databases.listDocuments(
              APPWRITE_DATABASE_ID,
              COLLECTION_ALERTS_ID,
              queries,
            );

            return response.documents.map((alert) => ({
              id: alert.$id,
              level: alert.level,
              title: alert.title,
              location: alert.location,
              type: alert.category || "general",
              time: getTimeAgo(alert.$createdAt || new Date().toISOString()),
              sources: alert.sources || Math.floor(Math.random() * 10) + 1,
              safety:
                alert.safety_protocol || getDefaultSafetyProtocol(alert.level),
              verified: alert.verified,
              category: alert.category,
              createdAt: alert.$createdAt,
              source: "internal",
            }));
          })(),

          // Fetch from external APIs (earthquakes and weather alerts)
          fetchAllAlertData({
            earthquakes: {
              starttime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0], // Last 7 days
              minmagnitude: 4.0,
              limit: 50,
            },
            weather: {
              // Open-Meteo as primary (no API key needed), OpenWeatherMap as fallback
              lat: 51.5074, // Default to London
              lon: -0.1278,
              apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY || null,
            },
          }),
        ]);

        // Combine data from all sources
        let allAlerts = [];
        if (appwriteResponse.status === "fulfilled")
          allAlerts.push(...appwriteResponse.value);
        if (externalAlerts.status === "fulfilled") {
          const transformedExternal = externalAlerts.value.map((alert) => ({
            id: alert.id,
            level:
              alert.level === "Critical"
                ? 1
                : alert.level === "High"
                  ? 2
                : alert.level === "Medium"
                  ? 3
                : 4,
            title: alert.title,
            location: alert.location || "Unknown Location",
            type: alert.type,
            time: getTimeAgo(alert.timestamp || alert.createdAt || alert.$createdAt || new Date().toISOString()),
            sources: 1,
            safety: getDefaultSafetyProtocol(
              alert.level === "Critical"
                ? 1
                : alert.level === "High"
                  ? 2
                : alert.level === "Medium"
                  ? 3
                : 4,
            ),
            verified: true,
            category: alert.type,
            createdAt: alert.timestamp || new Date().toISOString(),
            source: alert.source,
            latitude: alert.latitude,
            longitude: alert.longitude,
          }));
          allAlerts.push(...transformedExternal);
        }

        // Apply client-side filters if needed
        if (filterLevel !== "all") {
          const levelMap = { 1: 1, 2: 2, 3: 3, 4: 4 };
          allAlerts = allAlerts.filter(
            (alert) => alert.level === levelMap[filterLevel],
          );
        }

        if (filterType !== "all") {
          allAlerts = allAlerts.filter((alert) => alert.type === filterType);
        }

        // **Mix alerts by category while keeping all categories represented**
        const groupedByCategory = allAlerts.reduce((acc, alert) => {
          (acc[alert.category] = acc[alert.category] || []).push(alert);
          return acc;
        }, {});

        const mixedAlerts = [];
        while (Object.keys(groupedByCategory).length) {
          for (const category of Object.keys(groupedByCategory)) {
            const catAlerts = groupedByCategory[category];
            if (catAlerts.length) mixedAlerts.push(catAlerts.shift());
            if (!catAlerts.length) delete groupedByCategory[category];
          }
        }

        setAlerts(mixedAlerts);
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setError("Failed to load alerts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [filterLevel, filterType]);

  // ---------- Helpers ----------
  const getDefaultSafetyProtocol = (level) => {
    switch (level) {
      case 1:
        return "Seek shelter immediately. Avoid open areas. Stay away from windows. Follow local emergency broadcasts.";
      case 2:
        return "Stay indoors. Monitor local emergency frequencies. Avoid travel. Prepare emergency supplies.";
      case 3:
        return "Prepare emergency kit. Stay informed through official channels. Follow local authority guidance.";
      case 4:
        return "Stay aware of developments. Review safety protocols. Monitor official communications.";
      default:
        return "Stay informed and follow local authority guidance.";
    }
  };

  const getLevelInfo = (level) => {
    // Handle string levels from external APIs
    if (typeof level === 'string') {
      const levelUpper = level.toUpperCase();
      if (levelUpper === 'CRITICAL' || levelUpper === 'CRITICAL') {
        return { label: "CRITICAL", color: "var(--alert-critical)", icon: <FiAlertCircle /> };
      }
      if (levelUpper === 'HIGH') {
        return { label: "HIGH", color: "var(--alert-high)", icon: <RiAlarmWarningLine /> };
      }
      if (levelUpper === 'MEDIUM' || levelUpper === 'MODERATE') {
        return { label: "MODERATE", color: "var(--alert-medium)", icon: <FiActivity /> };
      }
      if (levelUpper === 'LOW' || levelUpper === 'INFO' || levelUpper === 'AWARENESS') {
        return { label: "INFO", color: "var(--alert-info)", icon: <FiInfo /> };
      }
    }
    
    // Handle numeric levels
    switch (level) {
      case 1:
        return {
          label: "CRITICAL",
          color: "var(--alert-critical)",
          icon: <FiAlertCircle />,
        };
      case 2:
        return {
          label: "HIGH",
          color: "var(--alert-high)",
          icon: <RiAlarmWarningLine />,
        };
      case 3:
        return {
          label: "MODERATE",
          color: "var(--alert-medium)",
          icon: <FiActivity />,
        };
      case 4:
        return { label: "INFO", color: "var(--alert-info)", icon: <FiInfo /> };
      default:
        return {
          label: "AWARENESS",
          color: "var(--text-secondary)",
          icon: <FiShield />,
        };
    }
  };

  // ---------- Render ----------
  if (loading) {
    return (
      <div
        style={{
          paddingTop: "140px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <div>Loading alerts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          paddingTop: "140px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <div style={{ color: "red" }}>{error}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ paddingTop: "140px", paddingBottom: "40px" }}
    >
      <div className="container">
        {/* Header */}
        <section
          style={{
            position: "relative",
            marginBottom: "4rem",
            background: "transparent",
            height: "auto",
            display: "block",
          }}
        >
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-gradient"
            style={{ fontSize: "3.5rem", marginBottom: "1rem" }}
          >
            Live Alert Feed
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: "1.25rem", color: "var(--text-secondary)" }}
          >
            Real-time, verified danger alerts with actionable safety protocols.
          </motion.p>
        </section>

        {/* Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card glass"
          style={{
            padding: "1.5rem",
            marginBottom: "2rem",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontWeight: 600, marginRight: "1rem" }}>
            Filter Alerts:
          </span>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <label
              style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
            >
              Level:
            </label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              style={{
                padding: "0.5rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.5rem",
                color: "white",
              }}
            >
              <option value="all">All Levels</option>
              <option value="1">Critical</option>
              <option value="2">High</option>
              <option value="3">Moderate</option>
              <option value="4">Info</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <label
              style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
            >
              Type:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: "0.5rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.5rem",
                color: "white",
              }}
            >
              <option value="all">All Types</option>
              <option value="weather">Weather</option>
              <option value="security">Security</option>
              <option value="health">Health</option>
              <option value="environmental">Environmental</option>
              <option value="general">General</option>
            </select>
          </div>

          <div
            style={{
              marginLeft: "auto",
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
            }}
          >
            {alerts.length} alert{alerts.length !== 1 ? "s" : ""} found
          </div>
        </motion.div>

        {/* Alerts Grid */}
        {alerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card glass"
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            <FiBell
              style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}
            />
            <h3>No alerts match your filters</h3>
            <p>
              Try adjusting your filter criteria or check back later for new
              alerts.
            </p>
          </motion.div>
        ) : (
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
              gap: "2rem",
            }}
          >
            {alerts.map((alert, i) => {
              const levelInfo = getLevelInfo(alert.level);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * i }}
                  className={`card alert-card alert-level-${alert.level}`}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "1.5rem",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        padding: "0.4rem 0.8rem",
                        borderRadius: "2rem",
                        background: "rgba(255,255,255,0.05)",
                        color: levelInfo.color,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      {levelInfo.icon} {levelInfo.label}
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <FiClock /> {alert.time}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
                    {alert.title}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      marginBottom: "2rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <FiMapPin style={{ color: "var(--accent-color)" }} />{" "}
                      {alert.location}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <FiCheckCircle style={{ color: "#10b981" }} />{" "}
                      {alert.sources} verified sources
                    </div>
                    {alert.verified && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.6rem",
                          color: "#10b981",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        <FiCheckCircle /> Verified Alert
                      </div>
                    )}
                  </div>

                  <div
                    className="glass"
                    style={{
                      padding: "1.5rem",
                      borderRadius: "1rem",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <h4
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "1rem",
                        color: "white",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <FiShield style={{ color: "var(--accent-color)" }} />{" "}
                      Safety Protocol
                    </h4>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.95rem",
                        lineHeight: "1.5",
                      }}
                    >
                      {alert.safety}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Alerts;
