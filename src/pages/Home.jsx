import { Link } from "react-router-dom";
import {
  FiAlertTriangle,
  FiShield,
  FiGlobe,
  FiClock,
  FiCheckCircle,
  FiChevronRight,
  FiCloud,
  FiZap,
  FiActivity,
} from "react-icons/fi";
import {
  RiBroadcastLine,
  RiAlarmWarningLine,
  RiMapPin2Line,
} from "react-icons/ri";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  databases,
  APPWRITE_DATABASE_ID,
  COLLECTION_ALERTS_ID,
  COLLECTION_CRISES_ID,
  COLLECTION_STATISTICS_ID,
  Query,
} from "../lib/Appwrite";
import {
  fetchAllAlertData,
  fetchReliefWebDisasters,
  fetchOpenMeteoCurrentWeather,
  fetchOpenMeteoWeatherAlerts,
  transformDisasterToCrisis,
  geocodeOpenMeteo,
} from "../lib/fetchApi";
import { motion } from "framer-motion";

const Home = () => {
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [latestAlerts, setLatestAlerts] = useState([]);
  const [activeCrises, setActiveCrises] = useState([]);
  const [alertsWithCoords, setAlertsWithCoords] = useState([]); // Alerts with latitude/longitude for risk assessment
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [manualLocation, setManualLocation] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [nearbyEvents, setNearbyEvents] = useState([]);
  const [coords, setCoords] = useState(null);

  // Enhanced state for all data sources
  const [allExternalData, setAllExternalData] = useState({
    earthquakes: [],
    conflicts: [],
    civilUnrest: [],
    weatherAlerts: [],
    naturalEvents: [],
    humanitarian: [],
  });
  const [localWeather, setLocalWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // Haversine formula to calculate great-circle distance between two points
  const haversineDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Calculate risk assessment based on location and current crises/alerts
  // NOW USES ALL DATA from fetchApi.js - earthquakes, conflicts, weather, natural events, humanitarian
  const calculateRisk = useCallback(
    (
      latitude,
      longitude,
      locationData,
      activeCrises,
      alertsWithCoords,
      externalData = {},
      localWeather = null,
    ) => {
      // Combine ALL events from ALL sources
      const allEvents = [
        // Internal crises
        ...activeCrises.map((c) => ({
          ...c,
          type: "crisis",
          severity: c.severity || 3,
          category: "humanitarian",
        })),
        // External alerts with coordinates
        ...alertsWithCoords.map((a) => ({ ...a, type: "alert" })),
        // Earthquakes from USGS
        ...(externalData.earthquakes || []).map((e) => ({
          ...e,
          type: "earthquake",
          category: "natural",
          severity:
            e.magnitude >= 7
              ? 1
              : e.magnitude >= 6
                ? 2
                : e.magnitude >= 5
                  ? 3
                  : 4,
        })),
        // Conflicts/War from HDX
        ...(externalData.conflicts || []).map((c) => ({
          ...c,
          type: "conflict",
          category: "war",
          severity: 1,
        })),
        // Civil Unrest
        ...(externalData.civilUnrest || []).map((c) => ({
          ...c,
          type: "civilUnrest",
          category: "security",
          severity: 2,
        })),
        // Weather Alerts from GDACS/Open-Meteo
        ...(externalData.weatherAlerts || []).map((w) => ({
          ...w,
          type: "weather",
          category: "weather",
          severity:
            w.severity === "critical" ? 1 : w.severity === "high" ? 2 : 3,
        })),
        // Natural Events from EONET
        ...(externalData.naturalEvents || []).map((n) => ({
          ...n,
          type: "naturalEvent",
          category: "natural",
          severity: n.severity === "High" ? 2 : n.severity === "Medium" ? 3 : 4,
        })),
        // Humanitarian from HDX
        ...(externalData.humanitarian || []).map((h) => ({
          ...h,
          type: "humanitarian",
          category: "humanitarian",
          severity: 2,
        })),
      ];

      // Calculate distance for each event
      const eventsWithDistance = allEvents
        .filter((event) => event.latitude && event.longitude)
        .map((event) => ({
          ...event,
          distance: haversineDistance(
            latitude,
            longitude,
            event.latitude || 0,
            event.longitude || 0,
          ),
        }))
        .sort((a, b) => a.distance - b.distance);

      // Categorize by distance
      const immediateThreats = eventsWithDistance.filter(
        (e) => e.distance < 150,
      );
      const nearbyThreats = eventsWithDistance.filter(
        (e) => e.distance >= 150 && e.distance < 500,
      );
      const regionalThreats = eventsWithDistance.filter(
        (e) => e.distance >= 500 && e.distance < 1000,
      );

      // Update nearby events display
      setNearbyEvents(eventsWithDistance.slice(0, 3));

      // Calculate weather-based risk
      let weatherRisk = 0;
      if (localWeather) {
        if (localWeather.temperature > 40 || localWeather.temperature < -10)
          weatherRisk = 2;
        else if (localWeather.temperature > 35 || localWeather.temperature < 0)
          weatherRisk = 1;
        if (localWeather.windSpeed > 20) weatherRisk = Math.max(weatherRisk, 2);
        if (localWeather.precipitation > 10)
          weatherRisk = Math.max(weatherRisk, 1);
      }

      // Determine risk level
      const criticalEvents = immediateThreats.filter(
        (e) =>
          (e.type === "earthquake" && e.magnitude >= 6) ||
          e.type === "conflict" ||
          e.severity === 1,
      );

      let riskLevel, message, color, bgColor, borderColor, note, advice;

      if (
        criticalEvents.length > 0 ||
        (immediateThreats.length > 0 && weatherRisk >= 2)
      ) {
        const worstEvent = criticalEvents[0] || immediateThreats[0];
        riskLevel = "CRITICAL";
        color = "#ef4444";
        bgColor = "rgba(239, 68, 68, 0.15)";
        borderColor = "rgba(239, 68, 68, 0.4)";
        const eventType =
          worstEvent.type === "earthquake"
            ? "earthquake"
            : worstEvent.type === "conflict"
              ? "conflict zone"
              : "natural disaster";
        message = `CRITICAL: ${worstEvent.title} is within ${Math.round(worstEvent.distance)}km!`;
        note = `You are in immediate proximity to a ${eventType}. This requires immediate attention.`;
        advice = [
          {
            text: "Seek Safe Shelter",
            color: "#ef4444",
            bg: "rgba(239, 68, 68, 0.3)",
          },
          {
            text: "Monitor Emergency Broadcasts",
            color: "#f59e0b",
            bg: "rgba(245, 158, 11, 0.3)",
          },
          {
            text: "Prepare Emergency Kit",
            color: "#3b82f6",
            bg: "rgba(59, 130, 246, 0.3)",
          },
        ];
      } else if (immediateThreats.length > 0) {
        const worstEvent = immediateThreats[0];
        riskLevel = "HIGH";
        color = "#f97316";
        bgColor = "rgba(249, 115, 22, 0.15)";
        borderColor = "rgba(249, 115, 22, 0.4)";
        message = `HIGH ALERT: ${worstEvent.title} reported ${Math.round(worstEvent.distance)}km away.`;
        note = "There are active threats in your immediate area. Stay alert.";
        advice = [
          {
            text: "Stay Alert",
            color: "#f97316",
            bg: "rgba(249, 115, 22, 0.3)",
          },
          {
            text: "Review Evacuation Routes",
            color: "#f59e0b",
            bg: "rgba(245, 158, 11, 0.3)",
          },
        ];
      } else if (nearbyThreats.length > 0 || weatherRisk >= 1) {
        riskLevel = "ELEVATED";
        color = "#f59e0b";
        bgColor = "rgba(245, 158, 11, 0.12)";
        borderColor = "rgba(245, 158, 11, 0.35)";
        message =
          nearbyThreats.length > 0
            ? `CAUTION: ${nearbyThreats[0].title} reported ${Math.round(nearbyThreats[0].distance)}km away.`
            : "Weather advisory in effect for your area.";
        note = "There are active situations in your broader region.";
        advice = [
          {
            text: "Stay Informed",
            color: "#f59e0b",
            bg: "rgba(245, 158, 11, 0.25)",
          },
          {
            text: "Check Emergency Supplies",
            color: "#10b981",
            bg: "rgba(16, 185, 129, 0.25)",
          },
        ];
      } else if (regionalThreats.length > 0) {
        riskLevel = "LOW";
        color = "#22c55e";
        bgColor = "rgba(34, 197, 94, 0.1)";
        borderColor = "rgba(34, 197, 94, 0.3)";
        message = `${regionalThreats.length} event(s) detected within 1000km.`;
        note = "Your area is relatively safe with events in broader region.";
        advice = [
          {
            text: "Monitor Regional News",
            color: "#3b82f6",
            bg: "rgba(59, 130, 246, 0.2)",
          },
          {
            text: "General Preparedness",
            color: "#10b981",
            bg: "rgba(16, 185, 129, 0.2)",
          },
        ];
      } else {
        riskLevel = "MINIMAL";
        color = "#10b981";
        bgColor = "rgba(16, 185, 129, 0.1)";
        borderColor = "rgba(16, 185, 129, 0.3)";
        message = "No significant threats detected in your vicinity.";
        note = "Your location appears safe. Continue monitoring global trends.";
        advice = [
          {
            text: "Stay Aware",
            color: "#3b82f6",
            bg: "rgba(59, 130, 246, 0.2)",
          },
          {
            text: "Maintain Readiness",
            color: "#10b981",
            bg: "rgba(16, 185, 129, 0.2)",
          },
        ];
      }

      return {
        level: riskLevel,
        message,
        color,
        bgColor,
        borderColor,
        note,
        advice,
        weatherInfo: localWeather
          ? {
              temp: localWeather.temperature,
              condition: localWeather.weather || localWeather.description,
              wind: localWeather.windSpeed,
              humidity: localWeather.humidity,
            }
          : null,
        stats: {
          immediate: immediateThreats.length,
          nearby: nearbyThreats.length,
          regional: regionalThreats.length,
          total: eventsWithDistance.length,
        },
      };
    },
    [haversineDistance],
  );

  const handleManualLocationSearch = async (e) => {
    if (e) e.preventDefault();
    if (!manualLocation.trim()) return;

    setIsSearchingLocation(true);
    setLocationError(null);

    try {
      // Use Open-Meteo geocoding (no API key needed)
      const geoResult = await geocodeOpenMeteo(manualLocation);

      if (geoResult) {
        const { latitude, longitude, name, country, countryCode } = geoResult;
        setCoords({ latitude, longitude });
        setUserLocation(`${name}, ${country}`);

        // Fetch local weather
        try {
          const weather = await fetchOpenMeteoCurrentWeather(
            latitude,
            longitude,
          );
          setLocalWeather(weather);
        } catch (weatherErr) {
          console.warn("Failed to fetch weather:", weatherErr);
        }

        const locationData = {
          countryName: country,
          continent: getContinentFromLatitude(latitude),
        };
        setRiskAssessment(
          calculateRisk(
            latitude,
            longitude,
            locationData,
            activeCrises,
            alertsWithCoords,
            allExternalData,
            localWeather,
          ),
        );
      } else {
        // Fallback to OpenWeatherMap
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(manualLocation)}&limit=1&appid=${OPENWEATHER_API_KEY}`,
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const { lat, lon, name, country, state } = data[0];
          const latitude = lat;
          const longitude = lon;
          setCoords({ latitude, longitude });
          setUserLocation(`${name}${state ? `, ${state}` : ""}, ${country}`);

          // Fetch local weather
          try {
            const weather = await fetchOpenMeteoCurrentWeather(
              latitude,
              longitude,
            );
            setLocalWeather(weather);
          } catch (weatherErr) {
            console.warn("Failed to fetch weather:", weatherErr);
          }

          const locationData = {
            countryName: country,
            continent: getContinentFromLatitude(latitude),
          };
          setRiskAssessment(
            calculateRisk(
              latitude,
              longitude,
              locationData,
              activeCrises,
              alertsWithCoords,
              allExternalData,
              localWeather,
            ),
          );
        } else {
          setLocationError("Location not found. Please try again.");
        }
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setLocationError("Failed to search location.");
    } finally {
      setIsSearchingLocation(false);
    }
  };

  // Estimate continent from latitude (rough approximation when geocoding fails)
  const getContinentFromLatitude = (latitude) => {
    if (latitude >= 66.5) return "Arctic";
    if (latitude >= 23.5) return "North America";
    if (latitude >= 0) return "Africa"; // Includes Africa, Middle East, parts of Asia
    if (latitude >= -23.5) return "Africa"; // Southern Africa
    if (latitude >= -66.5) return "Antarctica";
    return "Antarctica";
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // Fetch data from multiple sources concurrently
        const [
          appwriteAlerts,
          appwriteCrises,
          appwriteStats,
          externalAlerts,
          externalCrises,
        ] = await Promise.allSettled([
          // Internal alerts
          databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_ALERTS_ID, [
            Query.equal("active", true),
            Query.orderDesc("$createdAt"),
            Query.limit(3),
          ]),
          // Internal crises
          databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_CRISES_ID, [
            Query.orderDesc("severity"),
          ]),
          // Internal statistics
          databases.listDocuments(
            APPWRITE_DATABASE_ID,
            COLLECTION_STATISTICS_ID,
          ),
          // External alerts (earthquakes and weather)
          fetchAllAlertData(),
          // External crises (ReliefWeb disasters)
          fetchReliefWebDisasters({ limit: 10, status: "current" }),
        ]);

        // Process internal alerts
        let alertsData = [];
        if (appwriteAlerts.status === "fulfilled") {
          alertsData = appwriteAlerts.value.documents.map((alert) => ({
            id: alert.$id,
            level: alert.level,
            title: alert.title,
            location: alert.location,
            time: getTimeAgo(alert.$createdAt),
            verified: alert.verified,
            source: "internal",
          }));
        }

        // Process external alerts - store all data for risk assessment
        if (externalAlerts.status === "fulfilled") {
          // Store alerts with coordinates for risk assessment
          const alertsWithCoordsData = externalAlerts.value
            .filter((alert) => alert.latitude && alert.longitude)
            .map((alert) => ({
              id: alert.id,
              title: alert.title,
              level: alert.level,
              location: alert.location,
              latitude: alert.latitude,
              longitude: alert.longitude,
              time: getTimeAgo(alert.time || alert.createdAt),
              verified: true,
              source: "external",
            }));
          setAlertsWithCoords(alertsWithCoordsData);

          // Categorize all external data for smart risk assessment
          const earthquakes = externalAlerts.value
            .filter(
              (a) => a.type === "earthquake" || a.category === "earthquake",
            )
            .map((e) => ({
              ...e,
              latitude: e.latitude || 0,
              longitude: e.longitude || 0,
            }));

          const weatherAlerts = externalAlerts.value
            .filter((a) => a.type === "weather" || a.category === "weather")
            .map((w) => ({
              ...w,
              latitude: w.latitude || 0,
              longitude: w.longitude || 0,
            }));

          setAllExternalData((prev) => ({
            ...prev,
            earthquakes,
            weatherAlerts,
          }));

          // Also get latest alerts for display
          const externalAlertsData = externalAlerts.value
            .filter((alert) => alert.active !== false)
            .slice(0, 3)
            .map((alert) => ({
              id: alert.id,
              level: alert.level,
              title: alert.title,
              location: alert.location,
              time: getTimeAgo(alert.time || alert.createdAt),
              verified: true,
              source: "external",
            }));
          alertsData = [...alertsData, ...externalAlertsData];
        }

        // Sort combined alerts by time and take top 3
        alertsData.sort((a, b) => {
          const timeA = new Date(a.time === "Just now" ? Date.now() : a.time);
          const timeB = new Date(b.time === "Just now" ? Date.now() : b.time);
          return timeB - timeA;
        });
        setLatestAlerts(alertsData.slice(0, 3));

        // Store alerts with coordinates for risk assessment (from external sources like USGS earthquakes)
        if (externalAlerts.status === "fulfilled") {
          const alertsWithCoordsData = externalAlerts.value
            .filter((alert) => alert.latitude && alert.longitude)
            .map((alert) => ({
              id: alert.id,
              title: alert.title,
              level: alert.level,
              location: alert.location,
              latitude: alert.latitude,
              longitude: alert.longitude,
              time: getTimeAgo(alert.time || alert.createdAt),
              verified: true,
              source: "external",
            }));
          setAlertsWithCoords(alertsWithCoordsData);
        }

        // Process internal crises
        let crisesData = [];
        if (appwriteCrises.status === "fulfilled") {
          console.log("Fetched crises:", appwriteCrises.value.documents);
          crisesData = appwriteCrises.value.documents.map((crisis) => ({
            id: crisis.$id,
            title: crisis.title,
            impact: crisis.impact,
            severity: crisis.severity,
            region: crisis.region,
            source: "internal",
          }));
          console.log("Processed crises:", crisesData);
        } else {
          console.log("Crises fetch failed:", appwriteCrises.reason);
        }

        // Process external crises
        if (externalCrises.status === "fulfilled") {
          const externalCrisesData = externalCrises.value
            .slice(0, 5) // Limit external crises
            .map((disaster) => {
              const crisis = transformDisasterToCrisis(disaster);
              return {
                id: crisis.id,
                title: crisis.title,
                impact: crisis.impact,
                severity: crisis.severity,
                region: crisis.region || "Global",
                source: "external",
              };
            });
          crisesData = [...crisesData, ...externalCrisesData];
        }

        setActiveCrises(crisesData);

        // Process statistics
        if (appwriteStats.status === "fulfilled") {
          const statsData = appwriteStats.value.documents.map((stat) => ({
            label: stat.label,
            value: stat.value,
            icon: getStatIcon(stat.key),
          }));
          setStats(statsData);
        }
      } catch (err) {
        console.error("Error fetching home data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Get user location and calculate risk assessment
  useEffect(() => {
    const getUserLocation = async () => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by this browser");
        return;
      }

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          });
        });

        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });

        // Fetch local weather using Open-Meteo
        try {
          const weather = await fetchOpenMeteoCurrentWeather(
            latitude,
            longitude,
          );
          setLocalWeather(weather);
        } catch (weatherErr) {
          console.warn("Failed to fetch local weather:", weatherErr);
        }

        // Reverse geocode to get location name
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          const locationData = await response.json();

          const locationName = `${locationData.city || locationData.locality || "Unknown City"}, ${locationData.countryName || "Unknown Country"}`;
          setUserLocation(locationName);

          setRiskAssessment(
            calculateRisk(
              latitude,
              longitude,
              locationData,
              activeCrises,
              alertsWithCoords,
              allExternalData,
              localWeather,
            ),
          );
        } catch (geocodeError) {
          console.error("Error reverse geocoding:", geocodeError);
          const locationName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
          setUserLocation(locationName);

          const locationData = {
            countryName: null,
            continent: getContinentFromLatitude(latitude),
          };

          setRiskAssessment(
            calculateRisk(
              latitude,
              longitude,
              locationData,
              activeCrises,
              alertsWithCoords,
              allExternalData,
              localWeather,
            ),
          );
        }
      } catch (error) {
        console.error("Error getting location:", error);
        setLocationError(
          "Unable to access your location. Please enable location services or type manually.",
        );
        setRiskAssessment({
          level: "UNKNOWN",
          color: "#6b7280",
          bgColor: "rgba(107, 114, 128, 0.1)",
          borderColor: "rgba(107, 114, 128, 0.3)",
        });
      }
    };

    if (!coords) {
      getUserLocation();
    }
  }, [
    activeCrises,
    alertsWithCoords,
    coords,
    calculateRisk,
    allExternalData,
    localWeather,
  ]);

  // Helper function to calculate time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  // Helper function to get stat icons
  const getStatIcon = (key) => {
    switch (key) {
      case "active_alerts":
        return <RiAlarmWarningLine />;
      case "verified_sources":
        return <FiCheckCircle />;
      case "monitored_regions":
        return <FiGlobe />;
      default:
        return <FiCheckCircle />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
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
        <div>Loading...</div>
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
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{ paddingTop: "140px" }}
    >
      {/* Hero Section */}
      <section
        className="hero"
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <motion.div variants={itemVariants} style={{ maxWidth: "800px" }}>
            <span
              style={{
                color: "var(--accent-color)",
                fontWeight: 600,
                letterSpacing: "2px",
                textTransform: "uppercase",
                fontSize: "0.9rem",
                display: "block",
                marginBottom: "1rem",
              }}
            >
              Global Danger Alert Platform
            </span>
            <h1
              className="text-gradient"
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4rem)",
                marginBottom: "1.5rem",
                lineHeight: 1.1,
              }}
            >
              Real-time Awareness for a{" "}
              <span style={{ color: "white" }}>Safer World</span>
            </h1>
            <p
              style={{
                fontSize: "1.1rem",
                color: "var(--text-secondary)",
                marginBottom: "2.5rem",
                maxWidth: "600px",
              }}
            >
              Stay ahead of global risks with verified, AI-assisted alerts and
              real-time situational reporting from across the globe.
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                marginBottom: 50,
              }}
            >
              <Link to="/map">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  style={{
                    background: "white",
                    color: "black",
                    border: "none",
                  }}
                >
                  Explore Risk Map
                </motion.button>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                //onClick={() => setShowSOSModal(true)}
                style={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                  color: "white",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: 600,
                  opacity: 0.5,
                }}
              >
                SOS Request
              </motion.button>
              <Link to="/about">
                <motion.button whileHover={{ scale: 1.05 }} className="glass">
                  How it Works
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Hero Background Elements */}
        <div
          style={{
            position: "absolute",
            right: "-10%",
            top: "10%",
            width: "60%",
            height: "80%",
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
            filter: "blur(60px)",
            zIndex: 0,
          }}
        />
      </section>

      <div className="container">
        {/* Personal Risk Radar */}
        <motion.div
          variants={itemVariants}
          className="card glass personal-assessment-responsive"
          style={{
            marginBottom: "2rem",
            padding: "1.5rem",
            background:
              "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)",
            border: "1px solid var(--border-color)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-30%",
              right: "-10%",
              width: "120px",
              height: "120px",
              background:
                "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
              opacity: 0.08,
              filter: "blur(30px)",
            }}
          />

          <div className="assessment-area">
            <div className="risk-status">📍</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.25rem" }}>
                Your Current Risk Status
              </h2>
              <p
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Personal safety assessment based on your location
              </p>
            </div>
            <form
              onSubmit={handleManualLocationSearch}
              className="location-form"
              style={{ marginTop: 15 }}
            >
              <input
                type="text"
                placeholder="Enter city or country..."
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: "0.85rem",
                  padding: "0.2rem 0.5rem",
                  outline: "none",
                  width: "180px",
                }}
              />
              <button
                type="submit"
                disabled={isSearchingLocation}
                style={{
                  padding: "0.3rem 0.7rem",
                  fontSize: "0.75rem",
                  background: "var(--accent-color)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.3rem",
                  cursor: "pointer",
                  opacity: isSearchingLocation ? 0.5 : 1,
                }}
              >
                {isSearchingLocation ? "Searching..." : "Search"}
              </button>
            </form>
          </div>

          <div className="grid location-level-grid">
            <div
              style={{
                padding: "1rem",
                background: "rgba(255,255,255,0.02)",
                borderRadius: "0.75rem",
                border: "1px solid var(--border-color)",
              }}
            >
              <h3
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  marginBottom: "0.25rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Location
              </h3>
              <p style={{ fontSize: "1rem", fontWeight: 600 }}>
                {userLocation ||
                  (locationError
                    ? "Location unavailable"
                    : "Detecting location...")}
              </p>
              {locationError && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "0.7rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {locationError}
                </p>
              )}
            </div>

            <div
              style={{
                padding: "1rem",
                background:
                  riskAssessment?.bgColor || "rgba(16, 185, 129, 0.1)",
                borderRadius: "0.75rem",
                border: `1px solid ${riskAssessment?.borderColor || "rgba(16, 185, 129, 0.3)"}`,
              }}
            >
              <h3
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  marginBottom: "0.25rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Risk Level
              </h3>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: riskAssessment?.color || "#10b981",
                  }}
                >
                  {riskAssessment?.level || "UNKNOWN"}
                </span>
                <span
                  style={{
                    padding: "0.2rem 0.6rem",
                    background:
                      riskAssessment?.bgColor || "rgba(16, 185, 129, 0.2)",
                    borderRadius: "0.75rem",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: riskAssessment?.color || "#10b981",
                  }}
                >
                  {riskAssessment?.message || "Assessing..."}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                marginBottom: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "1rem",
              }}
            >
              Nearby Events
            </h3>
            <div className="nearby-events">
              {nearbyEvents.length > 0 ? (
                nearbyEvents.map((event, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "0.75rem",
                      background: "rgba(255,255,255,0.02)",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border-color)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                      marginBottom: 10
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <div
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background:
                            event.type === "crisis"
                              ? "var(--alert-high)"
                              : "var(--alert-medium)",
                        }}
                      />
                      <span style={{ fontSize: "0.9rem" }}>{event.title}</span>
                    </div>
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {Math.round(event.distance)} km away
                    </span>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    padding: "0.75rem",
                  }}
                >
                  No significant events detected within 1000km.
                </p>
              )}
            </div>
          </div>

          {/* Local Weather Display */}
          {localWeather && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h3
                style={{
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "1rem",
                }}
              >
                <FiCloud style={{ color: "var(--accent-color)" }} />
                Local Weather
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  padding: "1rem",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "0.75rem",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "var(--accent-color)",
                    }}
                  >
                    {Math.round(localWeather.temperature)}°C
                  </p>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {localWeather.description || localWeather.weather}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <FiCloud
                      style={{ color: "#3b82f6", marginRight: "0.3rem" }}
                    />
                    <span style={{ fontSize: "0.85rem" }}>
                      Humidity: {localWeather.humidity}%
                    </span>
                  </div>
                  <div>
                    <FiZap
                      style={{ color: "#f59e0b", marginRight: "0.3rem" }}
                    />
                    <span style={{ fontSize: "0.85rem" }}>
                      Wind: {localWeather.windSpeed} m/s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              padding: "1rem",
              background:
                riskAssessment?.bgColor ||
                "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)",
              borderRadius: "0.75rem",
              border: `1px solid ${riskAssessment?.borderColor || "rgba(59, 130, 246, 0.3)"}`,
            }}
          >
            <h3
              style={{
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.95rem",
              }}
            >
              Assessment Note
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                marginBottom: "0.75rem",
                fontSize: "0.85rem",
              }}
            >
              {riskAssessment?.note ||
                "Awaiting location data to provide a detailed safety assessment."}
            </p>

            <h3
              style={{
                marginBottom: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              Recommended Awareness
            </h3>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {riskAssessment?.advice ? (
                riskAssessment.advice.map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: "0.3rem 0.6rem",
                      background: item.bg,
                      borderRadius: "0.4rem",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      color: item.color,
                    }}
                  >
                    {item.text}
                  </span>
                ))
              ) : (
                <span
                  style={{
                    padding: "0.3rem 0.6rem",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "0.4rem",
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                  }}
                >
                  No specific recommendations
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            marginTop: "-4rem",
          }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="card glass"
              style={{ textAlign: "center", padding: "1.5rem" }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  color: "var(--accent-color)",
                  marginBottom: "0.5rem",
                }}
              >
                {stat.icon}
              </div>
              <h2 style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>
                {stat.value}
              </h2>
              <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Latest Alerts */}
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "2.5rem",
              marginTop: 20,
            }}
          >
            <div>
              <h2 className="section-title" style={{ marginBottom: "0.5rem" }}>
                <RiBroadcastLine style={{ color: "var(--alert-critical)" }} />
                Latest Verified Alerts
              </h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Immediate warnings from our global network.
              </p>
            </div>
            <Link
              to="/alerts"
              style={{
                color: "var(--accent-color)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: 600,
              }}
            >
              View All Alerts <FiChevronRight />
            </Link>
          </div>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            }}
          >
            {latestAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                variants={itemVariants}
                className={`card alert-card alert-level-${alert.level}`}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "0.25rem 0.75rem",
                      borderRadius: "1rem",
                      background: "rgba(255,255,255,0.05)",
                      color:
                        alert.level === 1
                          ? "var(--alert-critical)"
                          : "var(--alert-high)",
                    }}
                  >
                    LEVEL {alert.level}
                  </span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    <FiClock /> {alert.time}
                  </span>
                </div>
                <h3 style={{ marginBottom: "0.5rem", fontSize: "1.25rem" }}>
                  {alert.title}
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <RiMapPin2Line /> {alert.location}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  {alert.verified && (
                    <span
                      style={{
                        color: "#10b981",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                      }}
                    >
                      <FiCheckCircle /> Verified Source
                    </span>
                  )}
                  <button
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                  >
                    Full Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Global Overview Section */}
        <section
          className="global-risk-overview-responsive"
          style={{
            background: "rgba(59, 130, 246, 0.03)",
            borderRadius: "2rem",
            padding: "4rem",
            margin: "4rem 0",
            border: "1px solid var(--border-color)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
        >
          <div>
            <h2 className="section-title">Global Risk Overview</h2>
            <p
              style={{
                fontSize: "1.1rem",
                color: "var(--text-secondary)",
                marginBottom: "2rem",
              }}
            >
              Our platform monitors environmental, geopolitical and societal
              data points 24/7 to provide a comprehensive view of global safety.
            </p>
            <div className="grid" style={{ gap: "1.5rem" }}>
              {[
                {
                  title: "Event Verification",
                  desc: "Advanced algorithms cross-reference multiple sources.",
                },
                {
                  title: "Community Driven",
                  desc: "On-the-ground reports from verified contributors.",
                },
                {
                  title: "Response Ready",
                  desc: "Direct links to local aid and relief organizations.",
                },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "1rem" }}>
                  <div
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "var(--accent-color)",
                      flexShrink: 0,
                      marginTop: "4px",
                    }}
                  />
                  <div>
                    <h4 style={{ marginBottom: "0.25rem" }}>{item.title}</h4>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="card glass"
            style={{
              height: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)",
                opacity: 0.3,
              }}
            />
            <FiGlobe
              style={{
                fontSize: "10rem",
                color: "var(--accent-color)",
                opacity: 0.5,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "2rem",
                textAlign: "center",
              }}
            >
              <h3 style={{ marginBottom: "0.5rem" }}>
                Interactive Risk Engine
              </h3>
              <Link to="/full-map">
                <button>Launch Full Map</button>
              </Link>
            </div>
          </div>
        </section>

        {/* Active Crises */}
        <section style={{ marginBottom: "6rem" }}>
          <h2 className="section-title">Active Humanitarian Crises</h2>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            }}
          >
            {activeCrises.map((crisis) => (
              <motion.div
                key={crisis.id}
                variants={itemVariants}
                className="card glass"
                style={{ display: "flex", gap: "2rem" }}
              >
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "1rem",
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3rem",
                    color: "var(--accent-color)",
                  }}
                >
                  <FiShield />
                </div>
                <div>
                  <h3 style={{ marginBottom: "0.5rem" }}>{crisis.title}</h3>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                      marginBottom: "1rem",
                    }}
                  >
                    {crisis.region}
                  </p>
                  <div style={{ display: "flex", gap: "2rem" }}>
                    <div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Impact
                      </p>
                      <p style={{ fontWeight: 700 }}>{crisis.impact}</p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Severity
                      </p>
                      <p
                        style={{ fontWeight: 700, color: "var(--alert-high)" }}
                      >
                        {crisis.severity}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* SOS Emergency Request Modal */}
      {showSOSModal && (
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
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "2rem",
          }}
          onClick={() => setShowSOSModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={{
              width: "80%",
              maxWidth: "1000px",
              height: "100%",
              maxHeight: "600px",
              background: "var(--bg-color)",
              borderRadius: "1rem",
              border: "1px solid var(--border-color)",
              overflow: "hidden",
              position: "relative",
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
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                  }}
                >
                  🚨
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
                    Emergency SOS Request
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    For life-threatening situations requiring immediate
                    assistance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSOSModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div
              style={{
                padding: "2rem",
                height: "calc(100% - 80px)",
                overflow: "auto",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "2rem",
                  height: "100%",
                }}
              >
                {/* Left Column - What Counts as Emergency */}
                <div>
                  <h3
                    style={{
                      color: "#ef4444",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FiAlertTriangle />
                    What Counts as an Emergency
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        padding: "1rem",
                        background: "rgba(239, 68, 68, 0.1)",
                        borderRadius: "0.5rem",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "#ef4444" }}>
                        Natural Disasters
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Someone trapped during earthquake, flood, hurricane, or
                        wildfire
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
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "#ef4444" }}>
                        Violence & Crime
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Witnessing active violence, kidnapping, or terrorist
                        incident
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
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "#ef4444" }}>
                        War & Conflict
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Stuck during active combat, needing evacuation, or
                        humanitarian crisis
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
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "#ef4444" }}>
                        Medical Emergency
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Life-threatening medical situation where local services
                        are unavailable
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Verification Process */}
                <div>
                  <h3
                    style={{
                      color: "#10b981",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FiShield />
                    Our Verification Process
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          margin: "0 0 0.5rem 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>🤖</span>
                        AI Pre-Screening
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Automatic detection of spam patterns, fake locations,
                        and repeated submissions
                      </p>
                    </div>

                    <div>
                      <h4
                        style={{
                          margin: "0 0 0.5rem 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>👥</span>
                        Human Moderation
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Trained moderators verify emergency details and assess
                        urgency levels
                      </p>
                    </div>

                    <div>
                      <h4
                        style={{
                          margin: "0 0 0.5rem 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>📍</span>
                        Location Cross-Verification
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        GPS data, IP location, and known crisis zones are
                        cross-referenced
                      </p>
                    </div>

                    <div>
                      <h4
                        style={{
                          margin: "0 0 0.5rem 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>🚨</span>
                        Priority Routing
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Critical requests go directly to emergency responders
                        and partner organizations
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "2rem",
                      padding: "1.5rem",
                      background:
                        "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)",
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <h4 style={{ margin: "0 0 1rem 0", color: "#10b981" }}>
                      Ready to Submit an Emergency Request?
                    </h4>
                    <p
                      style={{
                        margin: "0 0 1rem 0",
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      This system is for genuine life-threatening emergencies
                      only. False reports may result in account suspension.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: "100%",
                        padding: "1rem",
                        background:
                          "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Start Emergency Request
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Home;
