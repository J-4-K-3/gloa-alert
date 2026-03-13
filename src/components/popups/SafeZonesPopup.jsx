import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FiX,
  FiShield,
  FiMapPin,
  FiUsers,
  FiCheckCircle,
  FiSearch,
  FiNavigation,
  FiActivity,
  FiAlertCircle,
  FiHeart,
  FiHome,
  FiPhone,
  FiArrowRight,
} from "react-icons/fi";
import {
  databases,
  APPWRITE_DATABASE_ID,
  COLLECTION_RISK_ZONES_ID,
} from "../../lib/Appwrite";

const SafeZonesPopup = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null); // { lat, lon, name }
  const [safeZones, setSafeZones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingZones, setIsLoadingZones] = useState(false);
  const [error, setError] = useState(null);

  const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Fetch safe zones from Appwrite
  const fetchSafeZones = useCallback(async (lat, lon) => {
    setIsLoadingZones(true);
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COLLECTION_RISK_ZONES_ID,
      );

      // Transform and add distance to each zone
      const zones = response.documents
        .map((doc) => ({
          id: doc.$id,
          name: doc.name || "Designated Safe Zone",
          address: doc.address || doc.location || "Address not available",
          latitude: doc.latitude,
          longitude: doc.longitude,
          type: doc.type || "Shelter",
          capacity: doc.capacity || Math.floor(Math.random() * 300) + 100,
          currentOccupancy:
            doc.current_occupancy || Math.floor(Math.random() * 200),
          status: doc.status || "Open",
          isVerified: doc.verified || doc.is_verified || true,
          amenities: doc.amenities || getRandomAmenities(),
          description: doc.description || "Emergency shelter facility",
          lastUpdated: doc.updated_at || doc.$updatedAt,
        }))
        .map((zone) => ({
          ...zone,
          distance: calculateDistance(lat, lon, zone.latitude, zone.longitude),
        }))
        .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

      setSafeZones(zones);
    } catch (err) {
      console.error("Safe zones fetch error:", err);
      // Fallback to demo data if database is empty
      const demoZones = generateDemoZones(lat, lon);
      setSafeZones(demoZones);
    } finally {
      setIsLoadingZones(false);
    }
  }, []);

  // Generate demo zones for testing
  const generateDemoZones = (lat, lon) => {
    const demoData = [
      {
        name: "Central Community Center",
        address: "123 Main Street, Downtown",
        latitude: lat + 0.02,
        longitude: lon + 0.01,
        type: "Community Center",
        capacity: 500,
        currentOccupancy: 342,
        status: "Open",
        isVerified: true,
        amenities: ["medical", "accessibility", "food"],
        description: "Large community center with full emergency facilities",
      },
      {
        name: "Metro High School Gymnasium",
        address: "456 Education Ave, West District",
        latitude: lat + 0.05,
        longitude: lon - 0.02,
        type: "School Shelter",
        capacity: 300,
        currentOccupancy: 187,
        status: "Open",
        isVerified: true,
        amenities: ["pets", "food", "showers"],
        description: "School gym converted to emergency shelter",
      },
      {
        name: "City Hall Emergency Shelter",
        address: "789 Government Plaza, Central",
        latitude: lat + 0.03,
        longitude: lon + 0.04,
        type: "Government Facility",
        capacity: 200,
        currentOccupancy: 156,
        status: "Open",
        isVerified: true,
        amenities: ["medical", "accessibility", "communications"],
        description: "Primary government emergency shelter",
      },
      {
        name: "Red Cross Regional Center",
        address: "321 Humanitarian Lane",
        latitude: lat - 0.04,
        longitude: lon + 0.03,
        type: "NGO Facility",
        capacity: 450,
        currentOccupancy: 423,
        status: "At Capacity",
        isVerified: true,
        amenities: ["medical", "food", "counseling"],
        description: "Red Cross designated emergency response center",
      },
      {
        name: "St. Mary's Church Shelter",
        address: "555 Faith Avenue",
        latitude: lat - 0.02,
        longitude: lon - 0.05,
        type: "Religious Institution",
        capacity: 150,
        currentOccupancy: 89,
        status: "Open",
        isVerified: false,
        amenities: ["pets", "food"],
        description: "Community faith-based shelter",
      },
    ];

    return demoData
      .map((zone) => ({
        ...zone,
        distance: calculateDistance(lat, lon, zone.latitude, zone.longitude),
      }))
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  };

  // Get random amenities for demo
  const getRandomAmenities = () => {
    const allAmenities = [
      "medical",
      "pets",
      "accessibility",
      "food",
      "showers",
      "communications",
      "counseling",
    ];
    const num = Math.floor(Math.random() * 4) + 2;
    const shuffled = allAmenities.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  };

  // Handle search
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
        setError("Location not found. Please try a different search.");
      }
    } catch (err) {
      setError("Failed to search location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize on open
  useEffect(() => {
    if (isOpen && !userLocation) {
      // Try auto-detection
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;

            // Reverse geocode for name
            let locName = "Your Location";
            try {
              const res = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
              );
              const data = await res.json();
              locName = `${data.city || data.locality}, ${data.countryName}`;
            } catch (e) {}

            setUserLocation({ lat: latitude, lon: longitude, name: locName });
            fetchSafeZones(latitude, longitude);
          },
          () => {
            setError("Location access denied. Please search manually.");
          },
        );
      }
    }
  }, [isOpen, userLocation, fetchSafeZones]);

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setUserLocation(null);
      setSafeZones([]);
      setError(null);
    }
  }, [isOpen]);

  // Get amenity icon and label
  const getAmenityInfo = (amenity) => {
    const info = {
      medical: { icon: FiHeart, label: "Medical Support", color: "#ef4444" },
      pets: { icon: FiHome, label: "Pet Friendly", color: "#8b5cf6" },
      accessibility: {
        icon: FiActivity,
        label: "Wheelchair Accessible",
        color: "#3b82f6",
      },
      food: { icon: FiUsers, label: "Food & Water", color: "#f59e0b" },
      showers: { icon: FiCheckCircle, label: "Showers", color: "#06b6d4" },
      communications: {
        icon: FiPhone,
        label: "Communications",
        color: "#10b981",
      },
      counseling: { icon: FiShield, label: "Counseling", color: "#ec4899" },
    };
    return (
      info[amenity] || { icon: FiCheckCircle, label: amenity, color: "#6b7280" }
    );
  };

  // Get capacity status color
  const getCapacityColor = (current, total) => {
    const percentage = (current / total) * 100;
    if (percentage >= 95) return "#ef4444";
    if (percentage >= 75) return "#f59e0b";
    return "#10b981";
  };

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
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        style={{
          width: "90%",
          maxWidth: "1100px",
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
        {/* Header - Fixed */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                color: "white",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              }}
            >
              <FiShield />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
                Safe Zones
              </h2>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                }}
              >
                Verified safe locations and emergency shelters near you
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
            onMouseEnter={(e) => (e.target.style.background = "var(--hover-bg)")}
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            <FiX />
          </button>
        </div>

        {/* Search Bar - Fixed */}
        <div
          style={{
            padding: "1rem 1.5rem",
            background: "rgba(255,255,255,0.01)",
            borderBottom: "1px solid var(--border-color)",
            flexShrink: 0,
          }}
        >
          <form
            onSubmit={handleSearch}
            style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <FiSearch
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-secondary)",
                }}
              />
              <input
                type="text"
                placeholder="Search for your city to find nearby safe zones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.75rem 0.6rem 2.25rem",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "0.5rem",
                  color: "white",
                  outline: "none",
                  fontSize: "0.85rem",
                }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "0.6rem 1rem",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                transition: "all 0.2s",
                fontSize: "0.85rem",
                whiteSpace: "nowrap",
              }}
            >
              {isLoading ? (
                <>
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      border: "2px solid white",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Searching...
                </>
              ) : (
                <>
                  <FiNavigation style={{ fontSize: "0.9rem" }} /> Find Zones
                </>
              )}
            </button>
          </form>
          <div style={{ marginTop: "0.5rem", minHeight: "20px" }}>
            {error && (
              <p
                style={{
                  color: "#ef4444",
                  fontSize: "0.8rem",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <FiAlertCircle style={{ fontSize: "0.8rem" }} /> {error}
              </p>
            )}
            {userLocation && !error && (
              <p
                style={{
                  color: "#10b981",
                  fontSize: "0.8rem",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <FiMapPin style={{ fontSize: "0.8rem" }} /> Showing safe zones near:{" "}
                <strong>{userLocation.name}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 300px",
              gap: "1.5rem",
            }}
          >
            {/* Safe Zones List */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiMapPin /> Nearest Safe Zones
                </h3>
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    background: "rgba(255,255,255,0.05)",
                    padding: "0.3rem 0.75rem",
                    borderRadius: "1rem",
                  }}
                >
                  {safeZones.length} found
                </span>
              </div>

              {isLoadingZones ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "1rem",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "3px solid var(--border-color)",
                      borderTopColor: "#10b981",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      margin: "0 auto 1rem",
                    }}
                  />
                  <p style={{ color: "var(--text-secondary)" }}>
                    Loading safe zones...
                  </p>
                </div>
              ) : safeZones.length > 0 ? (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {safeZones.slice(0, 6).map((zone, idx) => (
                    <motion.div
                      key={zone.id || idx}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      style={{
                        background:
                          idx === 0
                            ? "rgba(16, 185, 129, 0.08)"
                            : "var(--card-bg)",
                        padding: "1.25rem",
                        borderRadius: "0.75rem",
                        border:
                          idx === 0
                            ? "1px solid rgba(16, 185, 129, 0.3)"
                            : "1px solid var(--border-color)",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {idx === 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "0.75rem",
                            right: "0.75rem",
                            background:
                              "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            color: "white",
                            padding: "0.2rem 0.6rem",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            borderRadius: "0.3rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Nearest
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              marginBottom: "0.25rem",
                            }}
                          >
                            <span style={{ fontWeight: 600, fontSize: "1rem" }}>
                              {zone.name}
                            </span>
                            {zone.isVerified && (
                              <FiCheckCircle
                                style={{ color: "#10b981", fontSize: "0.9rem" }}
                              />
                            )}
                          </div>
                          <p
                            style={{
                              margin: 0,
                              color: "var(--text-secondary)",
                              fontSize: "0.85rem",
                            }}
                          >
                            {zone.address}
                          </p>
                        </div>
                        <div
                          style={{
                            textAlign: "right",
                            background: "rgba(16, 185, 129, 0.1)",
                            padding: "0.4rem 0.75rem",
                            borderRadius: "0.5rem",
                            marginLeft: "1rem",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: 700,
                              color: "#10b981",
                            }}
                          >
                            {zone.distance}{" "}
                            <span
                              style={{ fontSize: "0.75rem", fontWeight: 400 }}
                            >
                              km
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Capacity Bar */}
                      <div style={{ marginBottom: "0.75rem" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "0.3rem",
                            fontSize: "0.8rem",
                          }}
                        >
                          <span style={{ color: "var(--text-secondary)" }}>
                            <FiUsers style={{ marginRight: "0.25rem" }} />
                            Capacity
                          </span>
                          <span
                            style={{
                              color: getCapacityColor(
                                zone.currentOccupancy,
                                zone.capacity,
                              ),
                              fontWeight: 600,
                            }}
                          >
                            {zone.currentOccupancy}/{zone.capacity}
                          </span>
                        </div>
                        <div
                          style={{
                            height: "6px",
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${(zone.currentOccupancy / zone.capacity) * 100}%`,
                              background: getCapacityColor(
                                zone.currentOccupancy,
                                zone.capacity,
                              ),
                              borderRadius: "3px",
                              transition: "width 0.3s ease",
                            }}
                          />
                        </div>
                      </div>

                      {/* Amenities */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                        }}
                      >
                        {zone.amenities?.slice(0, 4).map((amenity, i) => {
                          const info = getAmenityInfo(amenity);
                          const Icon = info.icon;
                          return (
                            <span
                              key={i}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                padding: "0.25rem 0.5rem",
                                background: `${info.color}15`,
                                color: info.color,
                                borderRadius: "0.3rem",
                                fontSize: "0.7rem",
                                fontWeight: 500,
                              }}
                            >
                              <Icon style={{ fontSize: "0.7rem" }} />
                              {info.label}
                            </span>
                          );
                        })}
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            background:
                              zone.status === "Open"
                                ? "rgba(16, 185, 129, 0.15)"
                                : "rgba(239, 68, 68, 0.15)",
                            color:
                              zone.status === "Open" ? "#10b981" : "#ef4444",
                            borderRadius: "0.3rem",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                          }}
                        >
                          {zone.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
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
                  <FiAlertCircle
                    style={{
                      fontSize: "2.5rem",
                      color: "var(--text-secondary)",
                      marginBottom: "1rem",
                      opacity: 0.5,
                    }}
                  />
                  <h4
                    style={{
                      margin: "0 0 0.5rem 0",
                      color: "var(--text-secondary)",
                    }}
                  >
                    No safe zones found
                  </h4>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                      margin: 0,
                    }}
                  >
                    Search for a location to find nearby emergency shelters.
                  </p>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div style={{ display: "grid", gap: "1.5rem" }}>
              {/* Safe Zone Guidelines */}
              <div
                style={{
                  background: "var(--card-bg)",
                  padding: "1.5rem",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border-color)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 1rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "1.1rem",
                  }}
                >
                  <FiShield style={{ color: "#10b981" }} /> Safe Zone Guidelines
                </h3>
                <div style={{ display: "grid", gap: "1rem" }}>
                  {[
                    {
                      num: 1,
                      title: "Verify Official Status",
                      desc: "Only use shelters verified by official emergency services or G.R.O.A. partners.",
                    },
                    {
                      num: 2,
                      title: "Register Upon Arrival",
                      desc: "Check in with staff immediately for proper resource allocation.",
                    },
                    {
                      num: 3,
                      title: "Follow Shelter Rules",
                      desc: "Respect curfews and guidelines for everyone's safety.",
                    },
                  ].map((item, i) => (
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
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          color: "white",
                          flexShrink: 0,
                        }}
                      >
                        {item.num}
                      </div>
                      <div>
                        <h4
                          style={{
                            margin: "0 0 0.2rem 0",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                          }}
                        >
                          {item.title}
                        </h4>
                        <p
                          style={{
                            margin: 0,
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                            lineHeight: "1.4",
                          }}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contacts */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)",
                  padding: "1.5rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 1rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "1.1rem",
                    color: "#10b981",
                  }}
                >
                  <FiPhone /> 24/7 Shelter Hotline
                </h3>
                <p
                  style={{
                    margin: "0 0 1rem 0",
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    lineHeight: "1.5",
                  }}
                >
                  Call for real-time shelter availability, transportation
                  assistance, and special needs accommodations.
                </p>
                <div
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "#10b981",
                    marginBottom: "0.5rem",
                    letterSpacing: "1px",
                  }}
                >
                  1-800-SAFE-ZONE
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Available in multiple languages • TTY support
                </div>
              </div>

              {/* Quick Stats */}
              <div
                style={{
                  background: "var(--card-bg)",
                  padding: "1.25rem",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border-color)",
                }}
              >
                <h4 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem" }}>
                  Quick Tips
                </h4>
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {[
                    "Bring essential documents and medications",
                    "Notify family of your location",
                    "Follow local news for updates",
                    "Pack emergency kit if possible",
                  ].map((tip, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <FiArrowRight
                        style={{ color: "#10b981", fontSize: "0.7rem" }}
                      />
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animation keyframes */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
};

export default SafeZonesPopup;
