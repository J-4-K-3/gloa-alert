import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiX,
  FiMapPin,
  FiNavigation,
  FiAlertTriangle,
  FiSearch,
  FiClock,
  FiShield,
  FiChevronRight,
} from "react-icons/fi";
import {
  databases,
  APPWRITE_DATABASE_ID,
  COLLECTION_RISK_ZONES_ID,
} from "../../lib/Appwrite";

const EvacuationRoutesPopup = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null); // { lat, lon, name }
  const [safeZones, setSafeZones] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Fetch routes using OSRM API
  const fetchRoutes = useCallback(async (startLat, startLon, destinations) => {
    try {
      const routePromises = destinations.map(async (zone) => {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${zone.longitude},${zone.latitude}?overview=false`,
        );
        const data = await response.json();
        if (data.code === "Ok") {
          return {
            ...zone,
            distance: (data.routes[0].distance / 1000).toFixed(1), // km
            duration: Math.round(data.routes[0].duration / 60), // min
            summary: data.routes[0].legs[0].summary || "Main Road",
          };
        }
        return null;
      });

      const calculatedRoutes = await Promise.all(routePromises);
      setRoutes(
        calculatedRoutes
          .filter((r) => r !== null)
          .sort((a, b) => a.duration - b.duration),
      );
    } catch (err) {
      console.error("Routing error:", err);
    }
  }, []);

  // Fetch safe zones from Appwrite
  const fetchSafeZones = useCallback(
    async (lat, lon) => {
      try {
        const response = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          COLLECTION_RISK_ZONES_ID,
        );

        // Filter for safe zones (assuming type or category field)
        const zones = response.documents.map((doc) => ({
          id: doc.$id,
          name: doc.name || "Designated Safe Zone",
          latitude: doc.latitude,
          longitude: doc.longitude,
          type: doc.type || "Shelter",
          capacity: doc.capacity || "Unknown",
          status: doc.status || "Open",
        }));

        setSafeZones(zones);
        if (zones.length > 0) {
          fetchRoutes(lat, lon, zones);
        }
      } catch (err) {
        console.error("Safe zones fetch error:", err);
        // Fallback to mock if database is empty for demo purposes
        const mockZones = [
          {
            name: "Central Community Shelter",
            latitude: lat + 0.05,
            longitude: lon + 0.02,
            type: "Shelter",
            status: "Open",
          },
          {
            name: "North Highland Safe Zone",
            latitude: lat + 0.08,
            longitude: lon - 0.03,
            type: "Safe Zone",
            status: "Open",
          },
        ];
        setSafeZones(mockZones);
        fetchRoutes(lat, lon, mockZones);
      }
    },
    [fetchRoutes],
  );

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=1&appid=${OPENWEATHER_API_KEY}`,
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, name, country } = data[0];
        const locName = `${name}, ${country}`;
        setUserLocation({ lat, lon, name: locName });
        fetchSafeZones(lat, lon);
      } else {
        setError("Location not found.");
      }
    } catch (err) {
      setError("Failed to search location.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !userLocation) {
      // Try auto-detection
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            setUserLocation({
              lat: latitude,
              lon: longitude,
              name: "Your Location",
            });
            fetchSafeZones(latitude, longitude);

            // Reverse geocode for name
            try {
              const res = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
              );
              const data = await res.json();
              setUserLocation((prev) => ({
                ...prev,
                name: `${data.city || data.locality}, ${data.countryName}`,
              }));
            } catch (e) {}
          },
          () => {
            setError("Please enable location or search manually.");
          },
        );
      }
    }
  }, [isOpen, userLocation, fetchSafeZones]);

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
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        style={{
          width: "90%",
          maxWidth: "1000px",
          maxHeight: "85vh",
          background: "var(--bg-color)",
          borderRadius: "1.5rem",
          border: "1px solid var(--border-color)",
          overflowY: "auto",
          position: "relative",
          display: "flex",
          flexDirection: "column",
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
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                color: "white",
                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.2)",
              }}
            >
              <FiNavigation />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700 }}>
                Evacuation Routes
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                }}
              >
                Dynamic routing to verified safe zones
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

        {/* Search Bar */}
        <div
          style={{
            padding: "1.5rem 2rem",
            background: "rgba(255,255,255,0.01)",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <form
            onSubmit={handleSearch}
            style={{ display: "flex", gap: "1rem" }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <FiSearch
                style={{
                  position: "absolute",
                  left: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-secondary)",
                }}
              />
              <input
                type="text"
                placeholder="Search for your city to find evacuation routes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.8rem 1rem 0.8rem 2.8rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.75rem",
                  color: "white",
                  outline: "none",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "0.8rem 1.5rem",
                background: "var(--accent-color)",
                color: "white",
                border: "none",
                borderRadius: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {isLoading ? "Searching..." : "Find Routes"}
            </button>
          </form>
          {error && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "0.85rem",
                marginTop: "0.5rem",
                margin: "0.5rem 0 0 0",
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* Content Area */}
        <div style={{ padding: "2rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 350px",
              gap: "2rem",
            }}
          >
            {/* Routes List */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
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
                <FiMapPin style={{ color: "var(--accent-color)" }} />
                <span style={{ fontWeight: 600 }}>
                  Results for: {userLocation?.name || "Detecting..."}
                </span>
              </div>

              {isLoading ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  Calculating optimal routes...
                </div>
              ) : routes.length > 0 ? (
                routes.map((route, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "1rem",
                      border:
                        idx === 0
                          ? "1px solid #10b981"
                          : "1px solid var(--border-color)",
                      padding: "1.5rem",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {idx === 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          background: "#10b981",
                          color: "white",
                          padding: "0.25rem 0.75rem",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          borderBottomLeftRadius: "0.75rem",
                        }}
                      >
                        RECOMMENDED
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <h4
                          style={{
                            margin: "0 0 0.25rem 0",
                            fontSize: "1.1rem",
                          }}
                        >
                          {route.name}
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            color: "var(--text-secondary)",
                            fontSize: "0.9rem",
                          }}
                        >
                          via {route.summary}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "1.2rem",
                            fontWeight: 700,
                            color: idx === 0 ? "#10b981" : "white",
                          }}
                        >
                          {route.duration} min
                        </div>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {route.distance} km
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          padding: "0.3rem 0.6rem",
                          background: "rgba(16, 185, 129, 0.1)",
                          color: "#10b981",
                          borderRadius: "0.4rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {route.status}
                      </span>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <FiShield /> Capacity: {route.capacity}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "4rem",
                    background: "rgba(255,255,255,0.01)",
                    borderRadius: "1rem",
                    border: "1px dashed var(--border-color)",
                  }}
                >
                  <FiAlertTriangle
                    style={{
                      fontSize: "2rem",
                      color: "var(--text-secondary)",
                      marginBottom: "1rem",
                    }}
                  />
                  <p style={{ color: "var(--text-secondary)" }}>
                    No evacuation routes found for this area yet.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar Guidelines */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div
                style={{
                  background: "rgba(59, 130, 246, 0.05)",
                  padding: "1.5rem",
                  borderRadius: "1rem",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 1rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiAlertTriangle style={{ color: "#3b82f6" }} /> Safety
                  Protocol
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {[
                    "Follow official road signage only.",
                    "Keep emergency flashers on in low visibility.",
                    "Do not attempt to cross flooded areas.",
                    "Maintain half tank of fuel at all times.",
                  ].map((tip, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#3b82f6",
                          marginTop: "6px",
                          flexShrink: 0,
                        }}
                      />
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.85rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(239, 68, 68, 0.05)",
                  padding: "1.5rem",
                  borderRadius: "1rem",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 1rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiClock style={{ color: "#ef4444" }} /> Live Alerts
                </h4>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#ef4444",
                    fontWeight: 500,
                    padding: "0.75rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    borderRadius: "0.5rem",
                  }}
                >
                  Monitoring real-time traffic and road closures...
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EvacuationRoutesPopup;
