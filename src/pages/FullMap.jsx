import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { FiSearch, FiFilter, FiMapPin, FiAlertTriangle, FiCloudRain, FiZap } from "react-icons/fi";
import {
  databases,
  APPWRITE_DATABASE_ID,
  COLLECTION_ALERTS_ID,
  COLLECTION_CRISES_ID,
  COLLECTION_RISK_ZONES_ID,
} from "../lib/Appwrite";
import {
  fetchAllAlertData,
  fetchReliefWebDisasters,
  transformDisasterToCrisis,
  fetchEONETEvents,
  fetchOpenMeteoWeatherAlerts,
  fetchGDACSAlerts,
  fetchHDXConflictEvents,
  fetchHDXNationalRisk,
  fetchHDXIDPs,
  fetchHDXRefugees,
  fetchAllWorldAPINews,
  fetchConflictEvents,
  fetchCivilUnrestEvents,
  fetchUSGSEarthquakes,
  transformEarthquakeToAlert,
} from "../lib/fetchApi";
import "leaflet/dist/leaflet.css";
import "../App.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const FullMap = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);

  const isSearching = searchQuery.trim().length > 0;

  const focusEvent = (lat, lng) => {
    if (map) {
      map.flyTo([lat, lng], 8, { duration: 1.5 });
    }
  };

  // Extract unique countries/regions from filtered events for search chips
  const getUniqueCountries = () => {
    const countries = filteredEvents
      .map(event => event.region || event.location || "")
      .filter(Boolean)
      .map(name => name.split(",")[0].trim()) // Take first part (country name)
      .filter(name => name.length > 1)
      .map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
    
    return Array.from(new Set(countries))
      .sort()
      .slice(0, 15); // Limit to 15 for clean UI
  };

  const uniqueCountries = getUniqueCountries();

  // Filter options
  const filterOptions = [
    { id: "war", label: "War & Conflict", icon: <FiAlertTriangle />, color: "#ef4444" },
    { id: "natural", label: "Natural Disaster", icon: <FiCloudRain />, color: "#f59e0b" },
    { id: "weather", label: "Severe Weather", icon: <FiZap />, color: "#8b5cf6" },
    { id: "civil", label: "Civil Unrest", icon: <FiMapPin />, color: "#ec4899" },
  ];

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);

        // Fetch NASA EONET events (primary for severe weather)
        let eonetEvents = [];
        let eonetFailed = false;
        try {
          const eonetData = await fetchEONETEvents(30, 50);
          if (eonetData && eonetData.length > 0) {
            eonetEvents = eonetData.map(event => ({
              id: event.id || Math.random().toString(),
              title: event.title,
              location: event.location,
              region: event.location,
              type: "alert",
              level: event.level === "Critical" ? 1 : event.level === "High" ? 2 : event.level === "Medium" ? 3 : 4,
              severity: event.level === "Critical" ? 1 : event.level === "High" ? 2 : event.level === "Medium" ? 3 : 4,
              latitude: event.latitude || 0,
              longitude: event.longitude || 0,
              category: "severe weather",
              source: "NASA EONET",
              verified: true,
              time: event.timestamp || new Date().toISOString(),
            }));
          }
        } catch (eonetErr) {
          console.warn("EONET fetch failed:", eonetErr);
          eonetFailed = true;
        }

        // Open-Meteo as FALLBACK (when EONET returns no valid events or fails)
        let openMeteoAlerts = [];
        const validEonetCount = eonetEvents.filter(e => e.latitude !== 0 && e.longitude !== 0).length;
        
        if (validEonetCount === 0 || eonetFailed) {
          try {
            // Fetch for multiple global regions to get more coverage
            const regions = [
              { lat: 40, lon: -74 },   // US East
              { lat: 51, lon: 0 },     // Europe
              { lat: 35, lon: 139 },   // Japan
              { lat: -33, lon: 151 },  // Australia
              { lat: -23, lon: -46 },  // Brazil
              { lat: 28, lon: 77 },    // India
              { lat: 30, lon: 31 },    // Egypt
              { lat: -1, lon: 37 },     // Kenya
              { lat: 55, lon: 37 },    // Russia
              { lat: -34, lon: -58 },  // Argentina
            ];
            
            for (const region of regions) {
              try {
                const alerts = await fetchOpenMeteoWeatherAlerts(region.lat, region.lon);
                if (alerts && alerts.length > 0) {
                  openMeteoAlerts.push(...alerts.map(alert => ({
                    id: alert.id || Math.random().toString(),
                    title: alert.title,
                    location: alert.location,
                    region: alert.location,
                    type: "alert",
                    level: alert.severity === "warning" ? 2 : alert.severity === "advisory" ? 3 : 4,
                    severity: alert.severity === "warning" ? 2 : alert.severity === "advisory" ? 3 : 4,
                    latitude: alert.latitude || 0,
                    longitude: alert.longitude || 0,
                    category: "severe weather",
                    source: "Open-Meteo",
                    verified: true,
                    time: alert.start || new Date().toISOString(),
                  })));
                }
              } catch (alertErr) {
                console.warn(`Failed to fetch alerts for region ${region.lat}, ${region.lon}:`, alertErr);
              }
            }
          } catch (meteoErr) {
            console.warn("Open-Meteo fetch failed:", meteoErr);
          }
        }

        // Fetch GDACS severe weather alerts
        let gdacsAlerts = [];
        try {
          const gdacsData = await fetchGDACSAlerts();
          if (gdacsData && gdacsData.length > 0) {
            gdacsAlerts = gdacsData.map(alert => ({
              id: alert.id || Math.random().toString(),
              title: alert.title,
              location: alert.location,
              region: alert.location,
              type: "alert",
              level: alert.level === "Critical" ? 1 : alert.level === "High" ? 2 : alert.level === "Medium" ? 3 : 4,
              severity: alert.level === "Critical" ? 1 : alert.level === "High" ? 2 : alert.level === "Medium" ? 3 : 4,
              latitude: alert.latitude || 0,
              longitude: alert.longitude || 0,
              category: "severe weather",
              source: "GDACS",
              verified: true,
              time: alert.timestamp || new Date().toISOString(),
            }));
          }
        } catch (gdacsErr) {
          console.warn("GDACS fetch failed:", gdacsErr);
        }

        // Fetch HDX Conflict Events
        let hdxConflicts = [];
        try {
          const conflictData = await fetchHDXConflictEvents();
          if (conflictData && conflictData.length > 0) {
            hdxConflicts = conflictData.map(event => ({
              id: event.id || Math.random().toString(),
              title: event.title,
              location: event.location,
              region: event.location,
              type: "alert",
              level: event.level === "Critical" ? 1 : event.level === "High" ? 2 : event.level === "Medium" ? 3 : 4,
              severity: event.level === "Critical" ? 1 : event.level === "High" ? 2 : event.level === "Medium" ? 3 : 4,
              latitude: event.latitude || 0,
              longitude: event.longitude || 0,
              category: "war",
              source: "HDX",
              verified: true,
              time: event.timestamp || new Date().toISOString(),
            }));
          }
        } catch (hdxConflictErr) {
          console.warn("HDX Conflict fetch failed:", hdxConflictErr);
        }

        // Fetch HDX National Risk
        let hdxRisk = [];
        try {
          const riskData = await fetchHDXNationalRisk();
          if (riskData && riskData.length > 0) {
            hdxRisk = riskData.map(event => ({
              id: event.id || Math.random().toString(),
              title: event.title,
              location: event.location,
              region: event.location,
              type: "alert",
              level: event.level === "Critical" ? 1 : event.level === "High" ? 2 : event.level === "Medium" ? 3 : 4,
              severity: event.level === "Critical" ? 1 : event.level === "High" ? 2 : event.level === "Medium" ? 3 : 4,
              latitude: event.latitude || 0,
              longitude: event.longitude || 0,
              category: "war",
              source: "HDX",
              verified: true,
              time: event.timestamp || new Date().toISOString(),
            }));
          }
        } catch (hdxRiskErr) {
          console.warn("HDX Risk fetch failed:", hdxRiskErr);
        }

        // Fetch HDX IDPs (Internally Displaced Persons)
        let hdxIDPs = [];
        try {
          const idpData = await fetchHDXIDPs();
          if (idpData && idpData.length > 0) {
            hdxIDPs = idpData.map(event => ({
              id: event.id || Math.random().toString(),
              title: event.title,
              location: event.location,
              region: event.location,
              type: "alert",
              level: 3,
              severity: 3,
              latitude: event.latitude || 0,
              longitude: event.longitude || 0,
              category: "humanitarian",
              source: "HDX",
              verified: true,
              time: event.timestamp || new Date().toISOString(),
            }));
          }
        } catch (hdxIDPErr) {
          console.warn("HDX IDP fetch failed:", hdxIDPErr);
        }

        // Fetch HDX Refugees
        let hdxRefugees = [];
        try {
          const refugeeData = await fetchHDXRefugees();
          if (refugeeData && refugeeData.length > 0) {
            hdxRefugees = refugeeData.map(event => ({
              id: event.id || Math.random().toString(),
              title: event.title,
              location: event.location,
              region: event.location,
              type: "alert",
              level: 3,
              severity: 3,
              latitude: event.latitude || 0,
              longitude: event.longitude || 0,
              category: "humanitarian",
              source: "HDX",
              verified: true,
              time: event.timestamp || new Date().toISOString(),
            }));
          }
        } catch (hdxRefugeeErr) {
          console.warn("HDX Refugee fetch failed:", hdxRefugeeErr);
        }

        // Fetch WorldAPI News
        let worldApiNews = [];
        try {
          const newsData = await fetchAllWorldAPINews(100);
          if (newsData && newsData.length > 0) {
            worldApiNews = newsData.map(event => ({
              id: event.id || Math.random().toString(),
              title: event.title,
              location: event.location,
              region: event.location,
              type: "alert",
              level: event.level === "Critical" ? 1 : event.level === "High" ? 2 : event.level === "Medium" ? 3 : 4,
              severity: event.level === "Critical" ? 1 : event.level === "High" ? 2 : event.level === "Medium" ? 3 : 4,
              latitude: event.latitude || 0,
              longitude: event.longitude || 0,
              category: event.category || "general",
              source: "WorldAPI",
              verified: true,
              time: event.timestamp || new Date().toISOString(),
            }));
          }
        } catch (worldApiErr) {
          console.warn("WorldAPI fetch failed:", worldApiErr);
        }

        // Fetch Conflict Events
        let conflictEvents = [];
        try {
          const conflicts = await fetchConflictEvents();
          if (conflicts && conflicts.length > 0) {
            conflictEvents = conflicts.map(event => ({
              id: event.id || Math.random().toString(),
              title: event.title,
              location: event.location,
              region: event.location,
              type: "alert",
              level: event.level === "Critical" ? 1 : event.level === "High" ? 2 : event.level === "Medium" ? 3 : 4,
              severity: event.level === "Critical" ? 1 : event.level === "High" ? 2 : event.level === "Medium" ? 3 : 4,
              latitude: event.latitude || 0,
              longitude: event.longitude || 0,
              category: "war",
              source: "Conflict Monitor",
              verified: true,
              time: event.timestamp || new Date().toISOString(),
            }));
          }
        } catch (conflictErr) {
          console.warn("Conflict Events fetch failed:", conflictErr);
        }

        // Fetch Civil Unrest Events
        let civilUnrest = [];
        try {
          const unrest = await fetchCivilUnrestEvents();
          if (unrest && unrest.length > 0) {
            civilUnrest = unrest.map(event => ({
              id: event.id || Math.random().toString(),
              title: event.title,
              location: event.location,
              region: event.location,
              type: "alert",
              level: event.level === "Critical" ? 1 : event.level === "High" ? 2 : event.level === "Medium" ? 3 : 4,
              severity: event.level === "Critical" ? 1 : event.level === "High" ? 2 : event.level === "Medium" ? 3 : 4,
              latitude: event.latitude || 0,
              longitude: event.longitude || 0,
              category: "civil",
              source: "Civil Unrest Monitor",
              verified: true,
              time: event.timestamp || new Date().toISOString(),
            }));
          }
        } catch (unrestErr) {
          console.warn("Civil Unrest fetch failed:", unrestErr);
        }

        // Fetch USGS Earthquakes
        let usgsEarthquakes = [];
        try {
          const earthquakeData = await fetchUSGSEarthquakes({
            starttime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            minmagnitude: 4.0,
            limit: 100,
          });
          if (earthquakeData && earthquakeData.length > 0) {
            usgsEarthquakes = earthquakeData.map(eq => transformEarthquakeToAlert(eq));
          }
        } catch (usgsErr) {
          console.warn("USGS Earthquake fetch failed:", usgsErr);
        }

        // Fetch data from multiple sources concurrently (Appwrite + ReliefWeb)
        const [
          appwriteAlerts,
          appwriteCrises,
          externalCrises,
        ] = await Promise.allSettled([
          // Internal alerts
          databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_ALERTS_ID, [
            { key: "active", value: true, method: "equal" }
          ]),
          // Internal crises
          databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_CRISES_ID),
          // External crises
          fetchReliefWebDisasters(),
        ]);

        // Process alerts
        const alertsData = [];
        
        // Add NASA EONET events - filter out invalid coordinates
        if (eonetEvents.length > 0) {
          const validEonetEvents = eonetEvents.filter(e => e.latitude !== 0 && e.longitude !== 0);
          alertsData.push(...validEonetEvents);
        }
        
        // Add Open-Meteo alerts - filter out invalid coordinates
        if (openMeteoAlerts.length > 0) {
          const validOpenMeteoAlerts = openMeteoAlerts.filter(e => e.latitude !== 0 && e.longitude !== 0);
          alertsData.push(...validOpenMeteoAlerts);
        }

        // Add GDACS alerts - filter out invalid coordinates
        if (gdacsAlerts.length > 0) {
          const validGdacsAlerts = gdacsAlerts.filter(e => e.latitude !== 0 && e.longitude !== 0);
          alertsData.push(...validGdacsAlerts);
        }

        // Add HDX Conflicts - filter out invalid coordinates
        if (hdxConflicts.length > 0) {
          const validHdxConflicts = hdxConflicts.filter(e => e.latitude !== 0 && e.longitude !== 0);
          alertsData.push(...validHdxConflicts);
        }

        // Add HDX Risk - filter out invalid coordinates
        if (hdxRisk.length > 0) {
          const validHdxRisk = hdxRisk.filter(e => e.latitude !== 0 && e.longitude !== 0);
          alertsData.push(...validHdxRisk);
        }

        // Add HDX IDPs - filter out invalid coordinates
        if (hdxIDPs.length > 0) {
          const validHdxIDPs = hdxIDPs.filter(e => e.latitude !== 0 && e.longitude !== 0);
          alertsData.push(...validHdxIDPs);
        }

        // Add HDX Refugees - filter out invalid coordinates
        if (hdxRefugees.length > 0) {
          const validHdxRefugees = hdxRefugees.filter(e => e.latitude !== 0 && e.longitude !== 0);
          alertsData.push(...validHdxRefugees);
        }

        // Add WorldAPI News - filter out invalid coordinates
        if (worldApiNews.length > 0) {
          const validWorldApiNews = worldApiNews.filter(e => e.latitude !== 0 && e.longitude !== 0);
          alertsData.push(...validWorldApiNews);
        }

        // Add Conflict Events - filter out invalid coordinates
        if (conflictEvents.length > 0) {
          const validConflictEvents = conflictEvents.filter(e => e.latitude !== 0 && e.longitude !== 0);
          alertsData.push(...validConflictEvents);
        }

        // Add Civil Unrest - filter out invalid coordinates
        if (civilUnrest.length > 0) {
          const validCivilUnrest = civilUnrest.filter(e => e.latitude !== 0 && e.longitude !== 0);
          alertsData.push(...validCivilUnrest);
        }

        // Add USGS Earthquakes - filter out invalid coordinates
        if (usgsEarthquakes.length > 0) {
          const validUsgsEarthquakes = usgsEarthquakes.filter(e => e.latitude !== 0 && e.longitude !== 0);
          alertsData.push(...validUsgsEarthquakes.map(eq => ({
            id: eq.id || Math.random().toString(),
            title: eq.title,
            location: eq.location,
            region: eq.location,
            type: "alert",
            level: eq.level === "Critical" ? 1 : eq.level === "High" ? 2 : eq.level === "Medium" ? 3 : 4,
            severity: eq.level === "Critical" ? 1 : eq.level === "High" ? 2 : eq.level === "Medium" ? 3 : 4,
            latitude: eq.latitude || 0,
            longitude: eq.longitude || 0,
            category: "natural disaster",
            source: "USGS",
            verified: true,
            time: eq.timestamp || new Date().toISOString(),
          })));
        }
        
        // Add appwrite alerts - filter out invalid coordinates
        if (appwriteAlerts.status === "fulfilled") {
          const validAppwriteAlerts = appwriteAlerts.value.documents
            .filter(a => a.latitude !== 0 && a.longitude !== 0);
          alertsData.push(
            ...validAppwriteAlerts.map((alert) => ({
              id: alert.$id,
              title: alert.title,
              location: alert.location,
              region: alert.region,
              type: "alert",
              level: alert.level,
              severity: alert.level,
              latitude: alert.latitude || 0,
              longitude: alert.longitude || 0,
              category: alert.category || "general",
              source: alert.source || "G.R.O.A",
              verified: alert.verified || false,
              time: alert.$createdAt,
            }))
          );
        }

        // Process crises - filter out invalid coordinates
        const crisesData = [];
        if (appwriteCrises.status === "fulfilled") {
          const validCrises = appwriteCrises.value.documents
            .filter(c => c.latitude !== 0 && c.longitude !== 0);
          crisesData.push(
            ...validCrises.map((crisis) => ({
              id: crisis.$id,
              title: crisis.title,
              location: crisis.location,
              region: crisis.region,
              type: "crisis",
              severity: crisis.severity || 3,
              latitude: crisis.latitude || 0,
              longitude: crisis.longitude || 0,
              category: crisis.category || "crisis",
              source: crisis.source || "G.R.O.A",
              verified: crisis.verified || false,
              time: crisis.$createdAt,
            }))
          );
        }

        if (externalCrises.status === "fulfilled") {
          const validExternalCrises = externalCrises.value
            .map(transformDisasterToCrisis)
            .filter(c => c.latitude !== 0 && c.longitude !== 0);
          crisesData.push(...validExternalCrises);
        }

        const combinedEvents = [...alertsData, ...crisesData];
        setAllEvents(combinedEvents);
        setFilteredEvents(combinedEvents);
      } catch (err) {
        console.error("Error fetching map data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  // Filter events based on search and filters
  useEffect(() => {
    let filtered = allEvents;

    // Apply search filter - Enhanced with keyword matching for global alerts
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((event) => {
        const title = (event.title || "").toLowerCase();
        const location = (event.location || event.region || "").toLowerCase();
        const category = (event.category || "").toLowerCase();
        const source = (event.source || "").toLowerCase();

        // Direct text match (title, location, category, source)
        if (
          title.includes(query) ||
          location.includes(query) ||
          category.includes(query) ||
          source.includes(query)
        ) {
          return true;
        }

        // Smart keyword matching for common disaster types
        const keywords = {
          // Natural disasters
          flood: ["flood", "flooding", "inundation"],
          earthquake: ["earthquake", "quake", "seismic", "tremor"],
          tsunami: ["tsunami", "tidal wave"],
          volcano: ["volcano", "eruption", "lava", "ash cloud"],
          wildfire: ["wildfire", "bushfire", "forest fire", "fire"],
          landslide: ["landslide", "mudslide", "avalanche"],
          
          // Weather
          hurricane: ["hurricane", "typhoon", "cyclone"],
          tornado: ["tornado", "twister"],
          storm: ["storm", "thunderstorm", "lightning"],
          
          // Human-made
          gasleak: ["gas leak", "gas explosion", "chemical leak"],
          oilspill: ["oil spill", "oil leak"],
          chemical: ["chemical spill", "toxic leak", "hazardous"],
          
          // Other emergencies
          riot: ["riot", "civil unrest", "protest"],
          explosion: ["explosion", "blast", "bomb"],
          disease: ["epidemic", "pandemic", "outbreak"],
        };

        // Check if query matches any keyword category
        for (const [key, terms] of Object.entries(keywords)) {
          if (terms.some(term => query.includes(term))) {
            // Match if event has relevant category or keywords in title/location
            const relevantCategories = {
              flood: ["weather", "severe weather", "natural"],
              earthquake: ["natural disaster", "earthquake"],
              tsunami: ["severeStorms", "weather"],
              volcano: ["natural disaster"],
              wildfire: ["severe weather", "wildfire"],
              hurricane: ["severeStorms", "weather"],
              gasleak: ["industrial", "humanitarian"],
            }[key] || ["natural", "weather"];

            if (
              relevantCategories.some(cat => category.includes(cat)) ||
              title.includes(key) ||
              location.includes(key)
            ) {
              return true;
            }
          }
        }

        return false;
      });
    }

    // Apply category filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter((event) => {
        const eventCategory = event.category?.toLowerCase() || "";
        return activeFilters.some((filter) => {
          switch (filter) {
            case "war":
              return eventCategory.includes("war") || eventCategory.includes("conflict") || eventCategory.includes("military");
            case "natural":
              return eventCategory.includes("natural") || eventCategory.includes("disaster") || eventCategory.includes("earthquake");
            case "weather":
              return eventCategory.includes("weather") || eventCategory.includes("storm") || eventCategory.includes("hurricane") || eventCategory.includes("thunder") || eventCategory.includes("snow") || eventCategory.includes("warning") || eventCategory.includes("alert") || eventCategory.includes("severe") || eventCategory.includes("rain") || eventCategory.includes("flood");
            case "civil":
              return eventCategory.includes("civil") || eventCategory.includes("unrest") || eventCategory.includes("protest");
            default:
              return false;
          }
        });
      });
    }

    setFilteredEvents(filtered);
  }, [searchQuery, activeFilters, allEvents]);

  const toggleFilter = (filterId) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const getEventIcon = (event) => {
    const severity = event.severity || event.level || 3;
    let iconUrl, color;

    switch (severity) {
      case 1:
        iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png";
        color = "#ef4444";
        break;
      case 2:
        iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png";
        color = "#f59e0b";
        break;
      case 3:
        iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png";
        color = "#eab308";
        break;
      case 4:
        iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png";
        color = "#22c55e";
        break;
      default:
        iconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png";
        color = "#6b7280";
    }

    return new L.Icon({
      iconUrl: iconUrl,
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fullmap-main"
      style={{ paddingTop: "140px", minHeight: "100vh" }}
    >
      <div
        className="fullmap-flex"
        style={{
          display: "flex",
          height: "calc(100vh - 140px)",
          position: "relative",
        }}
      >
        {/* Left Sidebar - 20% */}
        <div
          className="fullmap-sidebar"
          style={{
            width: "20%",
            background: "var(--bg-primary)",
            borderRight: "1px solid var(--border-color)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            overflowY: "auto",
          }}
        >
          {/* Search Input */}
          <div className="fullmap-search-section">
            <h3
              style={{
                fontSize: "1.1rem",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Search Events
            </h3>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search by location, title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          </div>

          {/* Filters - Hidden when searching */}
          {!isSearching && (
            <>
              {/* Filters */}
              <div className="fullmap-filter-section">
                <h3
                  style={{
                    fontSize: "1.1rem",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FiFilter /> Filter by Type
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {filterOptions.map((filter) => (
                    <motion.button
                      key={filter.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleFilter(filter.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        border: activeFilters.includes(filter.id)
                          ? `2px solid ${filter.color}`
                          : "1px solid var(--border-color)",
                        background: activeFilters.includes(filter.id)
                          ? `${filter.color}20`
                          : "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontSize: "0.9rem",
                      }}
                    >
                      <span style={{ color: filter.color, fontSize: "1.1rem" }}>
                        {filter.icon}
                      </span>
                      {filter.label}
                      {activeFilters.includes(filter.id) && (
                        <span
                          style={{
                            marginLeft: "auto",
                            background: filter.color,
                            color: "white",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                            fontWeight: "bold",
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Results Summary */}
          <div className="fullmap-results"
            style={{
              padding: "1rem",
              background: "var(--bg-secondary)",
              borderRadius: "0.5rem",
              border: "1px solid var(--border-color)",
            }}
          >
            <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
              Results: {filteredEvents.length} events
            </h4>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {isSearching 
                ? "Matching your search"
                : activeFilters.length > 0
                ? `Filtered by: ${activeFilters.map(id => filterOptions.find(f => f.id === id)?.label).join(", ")}`
                : "Showing all events"}
            </p>
          </div>

          {/* Countries Chips - Show when searching with results */}
          {isSearching && uniqueCountries.length > 0 && (
            <div
              style={{
                padding: "1rem",
                background: "var(--bg-secondary)",
                borderRadius: "0.5rem",
                border: "1px solid var(--border-color)",
              }}
            >
              <h3 style={{ 
                fontSize: "1rem", 
                marginBottom: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--text-primary)"
              }}>
                <FiMapPin /> Countries ({uniqueCountries.length})
              </h3>
              <div style={{ 
                display: "flex", 
                flexWrap: "wrap", 
                gap: "0.5rem",
                maxHeight: "150px",
                overflowY: "auto"
              }}>
                {uniqueCountries.map((country) => (
                  <motion.span
                    key={country}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSearchQuery(country)}
                    style={{
                      padding: "0.4rem 0.8rem",
                      background: "rgba(59, 130, 246, 0.1)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      borderRadius: "20px",
                      color: "#3b82f6",
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {country}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Top Events List - Show when searching with results */}
          {isSearching && filteredEvents.length > 0 && (
            <div
              style={{
                padding: "1rem",
                background: "var(--bg-secondary)",
                borderRadius: "0.5rem",
                border: "1px solid var(--border-color)",
              }}
            >
              <h3 style={{ 
                fontSize: "1rem", 
                marginBottom: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--text-primary)"
              }}>
                <FiAlertTriangle /> Top Events ({filteredEvents.length})
              </h3>
              <div style={{ 
                maxHeight: "300px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem"
              }}>
                {filteredEvents
                  .filter(event => event.latitude !== 0 && event.longitude !== 0)
                  .slice(0, 10)
                  .map((event, index) => (
                    <motion.div
                      key={event.id || index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSearchQuery(event.title?.slice(0, 50) + "...");
                        focusEvent(event.latitude, event.longitude);
                      }}
                      style={{
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        background: "rgba(34, 197, 94, 0.1)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontSize: "0.85rem",
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: "0.25rem", color: "var(--text-primary)" }}>
                        {event.title?.slice(0, 60)}{event.title?.length > 60 ? "..." : ""}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-secondary)", flexWrap: "wrap", gap: "0.25rem" }}>
                        <span style={{ fontWeight: 500 }}>{event.title?.slice(0, 40)}{event.title?.length > 40 ? "..." : ""}</span>
                        <span style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", background: "rgba(0,0,0,0.2)", borderRadius: "0.25rem" }}>
                          {event.category || "General"}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem", fontSize: "0.7rem" }}>
                        <span>{event.source}</span>
                        <span style={{
                          fontWeight: "bold",
                          color: event.severity === 1 ? "#ef4444" : event.severity === 2 ? "#f59e0b" : "#22c55e",
                        }}>
                          L{event.level || event.severity || "?"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Map Container - 80% */}
        <div className="fullmap-map" style={{ width: "80%", position: "relative" }}>
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: "100%", width: "100%" }}
            className="leaflet-container"
            whenCreated={setMap}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredEvents
              .filter(event => event.latitude !== 0 && event.longitude !== 0)
              .map((event) => (
              <Marker
                key={event.id}
                position={[event.latitude || 0, event.longitude || 0]}
                icon={getEventIcon(event)}
              >
                <Popup>
                  <div style={{ minWidth: "200px" }}>
                    <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>
                      {event.title}
                    </h4>
                    <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.5rem" }}>
                      {/*event.location && <p>📍 {event.location}</p>*/}
                      {event.region && <p>🌍 {event.region}</p>}
                      <p>🏷️ {event.category || "General"}</p>
                      <p>📡 {event.source}</p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: "bold",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "0.3rem",
                          background: "rgba(0,0,0,0.1)",
                        }}
                      >
                        {event.type === "alert" ? `LEVEL ${event.level}` : `SEVERITY ${event.severity}`}
                      </span>
                      {event.verified && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "#10b981",
                            fontWeight: "bold",
                          }}
                        >
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default FullMap;