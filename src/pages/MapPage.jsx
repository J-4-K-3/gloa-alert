import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
import { FiMap, FiLayers, FiActivity, FiNavigation } from "react-icons/fi";
import { useState, useEffect } from "react";
import {
  databases,
  APPWRITE_DATABASE_ID,
  COLLECTION_ALERTS_ID,
  COLLECTION_CRISES_ID,
  COLLECTION_RISK_ZONES_ID,
  COLLECTION_INCIDENTS_ID,
  Query,
} from "../lib/Appwrite";
import {
  fetchAllAlertData,
  fetchReliefWebDisasters,
  transformDisasterToCrisis,
} from "../lib/fetchApi";
import "leaflet/dist/leaflet.css";
import "../App.css";

const MapPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [crises, setCrises] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [riskZones, setRiskZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);

        // Fetch data from multiple sources concurrently
        const [
          appwriteAlerts,
          appwriteCrises,
          appwriteIncidents,
          appwriteZones,
          externalAlerts,
          externalCrises,
        ] = await Promise.allSettled([
          // Internal alerts
          databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_ALERTS_ID, [
            Query.equal("active", true),
          ]),
          // Internal crises
          databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_CRISES_ID, [
            Query.equal("status", "active"),
          ]),
          // Internal incidents
          databases.listDocuments(
            APPWRITE_DATABASE_ID,
            COLLECTION_INCIDENTS_ID,
            [Query.equal("status", "confirmed")],
          ),
          // Internal risk zones
          databases.listDocuments(
            APPWRITE_DATABASE_ID,
            COLLECTION_RISK_ZONES_ID,
            [Query.equal("active", true)],
          ),
          // External alerts
          fetchAllAlertData({
            earthquakes: {
              starttime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
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
          // External crises
          fetchReliefWebDisasters({ limit: 20, status: "current" }),
        ]);

        // Process internal alerts
        let alertsData = [];
        if (appwriteAlerts.status === "fulfilled") {
          alertsData = appwriteAlerts.value.documents
            .filter((alert) => alert.latitude && alert.longitude)
            .map((alert) => ({
              id: alert.$id,
              type: "alert",
              title: alert.title,
              level: alert.level,
              latitude: alert.latitude,
              longitude: alert.longitude,
              location: alert.location,
              verified: alert.verified,
              category: alert.category,
              createdAt: alert.$createdAt,
              source: "internal",
            }));
        }

        // Process external alerts
        if (externalAlerts.status === "fulfilled") {
          const externalAlertsData = externalAlerts.value
            .filter(
              (alert) =>
                alert.latitude && alert.longitude && alert.active !== false,
            )
            .map((alert) => ({
              id: alert.id,
              type: "alert",
              title: alert.title,
              level: alert.level,
              latitude: alert.latitude,
              longitude: alert.longitude,
              location: alert.location,
              verified: true,
              category: alert.category || "external",
              createdAt: alert.time || alert.createdAt,
              source: "external",
            }));
          alertsData = [...alertsData, ...externalAlertsData];
        }
        setAlerts(alertsData);

        // Process internal crises
        let crisesData = [];
        if (appwriteCrises.status === "fulfilled") {
          crisesData = appwriteCrises.value.documents
            .filter((crisis) => crisis.latitude && crisis.longitude)
            .map((crisis) => ({
              id: crisis.$id,
              type: "crisis",
              title: crisis.title,
              severity: crisis.severity,
              latitude: crisis.latitude,
              longitude: crisis.longitude,
              region: crisis.region,
              impact: crisis.impact,
              radius: crisis.radius || 50,
              source: "internal",
            }));
        }

        // Process external crises (we'll need to estimate coordinates for ReliefWeb data)
        if (externalCrises.status === "fulfilled") {
          const externalCrisesData = externalCrises.value
            .filter((disaster) => disaster.primaryCountry) // Only include disasters with country info
            .map((disaster) => {
              const crisis = transformDisasterToCrisis(disaster);
              // For external crises without coordinates, we'll skip them for now
              // In a real implementation, you'd use a geocoding service
              return null;
            })
            .filter((crisis) => crisis !== null);
          crisesData = [...crisesData, ...externalCrisesData];
        }
        setCrises(crisesData);

        // Fetch active incidents
        const incidentsResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          COLLECTION_INCIDENTS_ID,
          [Query.equal("status", "confirmed")],
        );

        // Transform incidents data and filter for coordinates
        const incidentsData = incidentsResponse.documents
          .filter((incident) => incident.latitude && incident.longitude)
          .map((incident) => ({
            id: incident.$id,
            type: "incident",
            title: incident.title,
            severity: incident.severity,
            latitude: incident.latitude,
            longitude: incident.longitude,
            status: incident.status,
            timestamp: incident.timestamp,
            source: incident.source,
          }));
        setIncidents(incidentsData);

        // Fetch active risk zones
        const zonesResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          COLLECTION_RISK_ZONES_ID,
          [Query.equal("active", true)],
        );

        // Transform risk zones data
        const zonesData = zonesResponse.documents.map((zone) => ({
          id: zone.$id,
          type: "zone",
          name: zone.name,
          coordinates: zone.coordinates,
          riskLevel: zone.riskLevel,
          zoneType: zone.type,
        }));
        setRiskZones(zonesData);
      } catch (err) {
        console.error("Error fetching map data:", err);
        setError("Failed to load map data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();

    // TODO: Add real-time subscriptions back once basic integration is working
    // Set up real-time subscriptions
    /*
    let alertsSubscription, crisesSubscription, incidentsSubscription, zonesSubscription;

    try {
      alertsSubscription = realtime.subscribe(
        `databases.${APPWRITE_DATABASE_ID}.collections.${COLLECTION_ALERTS_ID}.documents`,
        (response) => {
          if (response.events.includes('databases.*.collections.*.documents.*.create') ||
              response.events.includes('databases.*.collections.*.documents.*.update') ||
              response.events.includes('databases.*.collections.*.documents.*.delete')) {
            fetchMapData(); // Refresh data when alerts change
          }
        }
      );

      crisesSubscription = realtime.subscribe(
        `databases.${APPWRITE_DATABASE_ID}.collections.${COLLECTION_CRISES_ID}.documents`,
        (response) => {
          if (response.events.includes('databases.*.collections.*.documents.*.create') ||
              response.events.includes('databases.*.collections.*.documents.*.update') ||
              response.events.includes('databases.*.collections.*.documents.*.delete')) {
            fetchMapData(); // Refresh data when crises change
          }
        }
      );

      incidentsSubscription = realtime.subscribe(
        `databases.${APPWRITE_DATABASE_ID}.collections.${COLLECTION_INCIDENTS_ID}.documents`,
        (response) => {
          if (response.events.includes('databases.*.collections.*.documents.*.create') ||
              response.events.includes('databases.*.collections.*.documents.*.update') ||
              response.events.includes('databases.*.collections.*.documents.*.delete')) {
            fetchMapData(); // Refresh data when incidents change
          }
        }
      );

      zonesSubscription = realtime.subscribe(
        `databases.${APPWRITE_DATABASE_ID}.collections.${COLLECTION_RISK_ZONES_ID}.documents`,
        (response) => {
          if (response.events.includes('databases.*.collections.*.documents.*.create') ||
              response.events.includes('databases.*.collections.*.documents.*.documents.*.delete')) {
            fetchMapData(); // Refresh data when zones change
          }
        }
      );
    } catch (error) {
      console.warn('Error setting up realtime subscriptions:', error);
    }
    */

    // Cleanup subscriptions on unmount
    return () => {
      // Temporarily disabled real-time subscriptions
      /*
      try {
        if (alertsSubscription && typeof alertsSubscription.unsubscribe === 'function') {
          alertsSubscription.unsubscribe();
        } else if (alertsSubscription && typeof alertsSubscription.close === 'function') {
          alertsSubscription.close();
        }

        if (crisesSubscription && typeof crisesSubscription.unsubscribe === 'function') {
          crisesSubscription.unsubscribe();
        } else if (crisesSubscription && typeof crisesSubscription.close === 'function') {
          crisesSubscription.close();
        }

        if (incidentsSubscription && typeof incidentsSubscription.unsubscribe === 'function') {
          incidentsSubscription.unsubscribe();
        } else if (incidentsSubscription && typeof incidentsSubscription.close === 'function') {
          incidentsSubscription.close();
        }

        if (zonesSubscription && typeof zonesSubscription.unsubscribe === 'function') {
          zonesSubscription.unsubscribe();
        } else if (zonesSubscription && typeof zonesSubscription.close === 'function') {
          zonesSubscription.close();
        }
      } catch (error) {
        console.warn('Error unsubscribing from realtime:', error);
      }
      */
    };
  }, []);

  // Combine all events for the sidebar
  const allEvents = [...alerts, ...crises, ...incidents];

  // Helper function to get marker color based on type and level
  const getMarkerColor = (event) => {
    let severity = 4; // Default informational (green)

    // Determine severity number first
    if (event.type === "alert") {
      severity = event.level || 4;
    } else if (event.type === "crisis") {
      const sev = event.severity?.toLowerCase();
      if (sev === "critical" || sev === "1") severity = 1;
      else if (sev === "high" || sev === "2") severity = 2;
      else if (sev === "moderate" || sev === "medium" || sev === "3") severity = 3;
      else severity = 4;
    } else if (event.type === "incident") {
      severity = event.severity || 4;
    }

    // Map severity number to CSS color variable
    switch (severity) {
      case 1:
        return "var(--alert-critical)";    // Red
      case 2:
        return "var(--alert-high)";         // Orange  
      case 3:
        return "var(--alert-medium)";       // Yellow
      case 4:
        return "var(--alert-info)";         // Cyan (info)
      case 5:
        return "var(--alert-safe)";         // Green (safe - bonus)
      default:
        return "var(--alert-info)";
    }
  };

  // Helper function to create custom colored marker icon
  const getMarkerIcon = (event) => {
    const color = getMarkerColor(event);
    return L.divIcon({
      className: "custom-marker-icon",
      html: `<div style="
        width: 24px;
        height: 24px;
        background-color: ${color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 12px ${color}, 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    });
  };

  // Helper function to get zone color
  const getZoneColor = (riskLevel) => {
    switch (riskLevel) {
      case 1:
        return "rgba(239, 68, 68, 0.3)"; // Critical - red
      case 2:
        return "rgba(245, 101, 101, 0.3)"; // High - red-orange
      case 3:
        return "rgba(251, 191, 36, 0.3)"; // Medium - yellow
      case 4:
        return "rgba(34, 197, 94, 0.3)"; // Info - green
      default:
        return "rgba(156, 163, 175, 0.3)"; // Gray
    }
  };

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
        <div>Loading map data...</div>
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
        <section style={{ marginBottom: "2rem" }}>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-gradient"
            style={{ fontSize: "2.5rem", marginBottom: "1rem" }}
          >
            Tactical Risk Map
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: "1.2rem", color: "var(--text-secondary)" }}
          >
            Real-time visual intelligence and situational awareness.
          </motion.p>
        </section>

        <div
          className="mappage-grid"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mappage-map-card"
          >
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{
                height: "100%",
                width: "100%",
                filter:
                  "invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)",
              }}
              zoomControl={true}
              scrollWheelZoom={true}
              doubleClickZoom={true}
              dragging={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />

              {/* Risk Zones (Polygons) */}
              {riskZones.map((zone) => (
                <Polygon
                  key={zone.id}
                  positions={zone.coordinates}
                  pathOptions={{
                    color: getZoneColor(zone.riskLevel),
                    fillColor: getZoneColor(zone.riskLevel),
                    fillOpacity: 0.4,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div
                      style={{
                        filter: "invert(100%) hue-rotate(-180deg)",
                        padding: "0.5rem",
                      }}
                    >
                      <h4
                        style={{
                          color: "var(--text-primary)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Risk Zone: {zone.name}
                      </h4>
                      <p
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        Level {zone.riskLevel} - {zone.zoneType}
                      </p>
                    </div>
                  </Popup>
                </Polygon>
              ))}

              {/* Alerts Markers */}
              {alerts.map((alert) => (
                <Marker
                  key={alert.id}
                  position={[alert.latitude, alert.longitude]}
                  icon={getMarkerIcon(alert)}
                >
                  <Popup>
                    <div
                      style={{
                        filter: "invert(100%) hue-rotate(-180deg)",
                        padding: "0.5rem",
                      }}
                    >
                      <h4
                        style={{
                          color: "var(--text-primary)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Level {alert.level} Alert
                      </h4>
                      <p
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        {alert.title}
                      </p>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                          margin: "0.25rem 0",
                        }}
                      >
                        📍 {alert.location}
                      </p>
                      {alert.verified && (
                        <span
                          style={{
                            color: "#10b981",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                          }}
                        >
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Crises Markers */}
              {crises.map((crisis) => (
                <Marker
                  key={crisis.id}
                  position={[crisis.latitude, crisis.longitude]}
                  icon={getMarkerIcon(crisis)}
                >
                  <Popup>
                    <div
                      style={{
                        filter: "invert(100%) hue-rotate(-180deg)",
                        padding: "0.5rem",
                      }}
                    >
                      <h4
                        style={{
                          color: "var(--text-primary)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {crisis.severity} Crisis
                      </h4>
                      <p
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        {crisis.title}
                      </p>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                          margin: "0.25rem 0",
                        }}
                      >
                        📍 {crisis.region}
                      </p>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                          margin: 0,
                        }}
                      >
                        👥 Impact: {crisis.impact}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Incidents Markers */}
              {incidents.map((incident) => (
                <Marker
                  key={incident.id}
                  position={[incident.latitude, incident.longitude]}
                  icon={getMarkerIcon(incident)}
                >
                  <Popup>
                    <div
                      style={{
                        filter: "invert(100%) hue-rotate(-180deg)",
                        padding: "0.5rem",
                      }}
                    >
                      <h4
                        style={{
                          color: "var(--text-primary)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Level {incident.severity} Incident
                      </h4>
                      <p
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        {incident.title}
                      </p>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                          margin: "0.25rem 0",
                        }}
                      >
                        📍 Reported Incident
                      </p>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                          margin: 0,
                        }}
                      >
                        Source: {incident.source}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            <div
              style={{
                position: "absolute",
                top: "1.5rem",
                right: "1.5rem",
                zIndex: 1000,
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <motion.button 
                className="glass" 
                style={{ padding: "0.5rem" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Toggle layer visibility
                  const layersVisible = !document.querySelector('.leaflet-layer-pane')?.style.visibility;
                  document.querySelectorAll('.leaflet-layer-pane').forEach(layer => {
                    layer.style.visibility = layersVisible ? 'visible' : 'hidden';
                  });
                }}
                title="Toggle Layers"
              >
                <FiLayers />
              </motion.button>
              <motion.button 
                className="glass" 
                style={{ padding: "0.5rem" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Center map and fit bounds to all markers
                  if (alerts.length > 0 || crises.length > 0 || incidents.length > 0) {
                    const group = new L.featureGroup();
                    alerts.forEach(a => L.marker([a.latitude, a.longitude]).addTo(group));
                    crises.forEach(c => L.marker([c.latitude, c.longitude]).addTo(group));
                    incidents.forEach(i => L.marker([i.latitude, i.longitude]).addTo(group));
                    group.addTo(map);
                    map.fitBounds(group.getBounds());
                  }
                }}
                title="Fit to Events"
              >
                <FiNavigation />
              </motion.button>
            </div>
          </motion.div>

          <aside
            className="mappage-aside"
          >
            <div className="card glass" style={{ padding: "1.5rem" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <FiMap style={{ color: "var(--accent-color)" }} /> Map Legend
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {[
                  { label: "Critical Danger", color: "var(--alert-critical)" },
                  { label: "High Risk", color: "var(--alert-high)" },
                  { label: "Moderate Caution", color: "var(--alert-medium)" },
                  { label: "Informational", color: "var(--alert-info)" },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: item.color,
                        boxShadow: `0 0 10px ${item.color}`,
                      }}
                    />
                    <span style={{ color: "var(--text-secondary)" }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Active Events ({allEvents.length})
              </h3>
              <div
                style={{
                  maxHeight: "400px", // choose a height that works
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
                className="hide-scrollbar"
              >
                {allEvents.length === 0 ? (
                  <div
                    style={{
                      padding: "1rem",
                      textAlign: "center",
                      color: "var(--text-secondary)",
                    }}
                  >
                    No active events
                  </div>
                ) : (
                  allEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      whileHover={{ x: 5 }}
                      className={`card alert-level-${event.type === "alert" ? event.level : event.severity === "critical" ? 1 : event.severity === "high" ? 2 : event.severity === "moderate" ? 3 : 4}`}
                      style={{
                        padding: "1rem",
                        cursor: "pointer",
                        marginBottom: "0.5rem",
                      }}
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowEventModal(true);
                      }}
                    >
                      <h4
                        style={{ fontSize: "0.9rem", marginBottom: "0.25rem" }}
                      >
                        {event.title}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {event.type === "alert"
                            ? `Level ${event.level}`
                            : event.type === "crisis"
                              ? event.severity
                              : `Incident Lv.${event.severity}`}
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {event.type.toUpperCase()}
                        </span>
                      </div>
                      {event.location && (
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            marginTop: "0.25rem",
                          }}
                        >
                          📍 {event.location}
                        </p>
                      )}
                      {event.region && (
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            marginTop: "0.25rem",
                          }}
                        >
                          📍 {event.region}
                        </p>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

{/* Event Details Modal */}
            {showEventModal && selectedEvent && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                  padding: "1rem",
                }}
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{
                    background: "var(--bg-primary)",
                    borderRadius: "1rem",
                    padding: "2rem",
                    maxWidth: "500px",
                    width: "100%",
                    maxHeight: "80vh",
                    overflow: "auto",
                    border: "1px solid var(--border-color)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <FiActivity style={{ color: "var(--accent-color)" }} />
                      Event Details
                    </h3>
                    <button
                      onClick={() => {
                        setShowEventModal(false);
                        setSelectedEvent(null);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-secondary)",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                        padding: "0.25rem",
                        borderRadius: "0.25rem",
                      }}
                      onMouseOver={(e) => (e.target.style.background = "rgba(255,255,255,0.1)")}
                      onMouseOut={(e) => (e.target.style.background = "none")}
                    >
                      ×
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                        {selectedEvent.title}
                      </h4>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.5rem",
                          background: "rgba(255,255,255,0.1)",
                          color:
                            selectedEvent.type === "alert"
                              ? selectedEvent.level === 1
                                ? "var(--alert-critical)"
                                : selectedEvent.level === 2
                                  ? "var(--alert-high)"
                                  : selectedEvent.level === 3
                                    ? "var(--alert-medium)"
                                    : "var(--alert-info)"
                              : selectedEvent.severity === "critical" ||
                                  selectedEvent.severity === 1
                                ? "var(--alert-critical)"
                                : selectedEvent.severity === "high" ||
                                    selectedEvent.severity === 2
                                  ? "var(--alert-high)"
                                  : selectedEvent.severity === "moderate" ||
                                      selectedEvent.severity === 3
                                    ? "var(--alert-medium)"
                                    : "var(--alert-info)",
                        }}
                      >
                        {selectedEvent.type === "alert"
                          ? `LEVEL ${selectedEvent.level}`
                          : selectedEvent.type === "crisis"
                            ? selectedEvent.severity?.toUpperCase()
                            : `INCIDENT LV.${selectedEvent.severity}`}
                      </span>
                    </div>

                    {selectedEvent.location && (
                      <div>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Location
                        </p>
                        <p style={{ fontSize: "0.9rem" }}>
                          📍 {selectedEvent.location}
                        </p>
                      </div>
                    )}

                    {selectedEvent.region && (
                      <div>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Region
                        </p>
                        <p style={{ fontSize: "0.9rem" }}>
                          📍 {selectedEvent.region}
                        </p>
                      </div>
                    )}

                    {selectedEvent.impact && (
                      <div>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Impact
                        </p>
                        <p style={{ fontSize: "0.9rem" }}>
                          👥 {selectedEvent.impact}
                        </p>
                      </div>
                    )}

                    {selectedEvent.category && (
                      <div>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Category
                        </p>
                        <p style={{ fontSize: "0.9rem" }}>
                          🏷️ {selectedEvent.category}
                        </p>
                      </div>
                    )}

                    {selectedEvent.source && (
                      <div>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Source
                        </p>
                        <p style={{ fontSize: "0.9rem" }}>
                          📡 {selectedEvent.source}
                        </p>
                      </div>
                    )}

                    {selectedEvent.verified && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <span
                          style={{
                            color: "#10b981",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          ✓ Verified Source
                        </span>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        marginTop: "1rem",
                      }}
                    >
                      <button
                        style={{
                          flex: 1,
                          padding: "0.75rem",
                          fontSize: "0.9rem",
                          background: "var(--accent-color)",
                          border: "none",
                          borderRadius: "0.5rem",
                          color: "white",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) => (e.target.style.opacity = "0.9")}
                        onMouseOut={(e) => (e.target.style.opacity = "1")}
                      >
                        View Full Details
                      </button>
                      <button
                        onClick={() => {
                          setShowEventModal(false);
                          setSelectedEvent(null);
                        }}
                        style={{
                          padding: "0.75rem",
                          fontSize: "0.9rem",
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "0.5rem",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                        }}
                        onMouseOver={(e) => (e.target.style.background = "rgba(255,255,255,0.2)")}
                        onMouseOut={(e) => (e.target.style.background = "rgba(255,255,255,0.1)")}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </motion.div>
  );
};

export default MapPage;
