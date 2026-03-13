import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiWind,
  FiDroplet,
  FiSun,
  FiCloud,
  FiCloudRain,
  FiCloudSnow,
  FiMapPin,
} from "react-icons/fi";
import { 
  geocodeWithFallback, 
  fetchWeatherWithFallback, 
  fetchForecastWithFallback 
} from "../lib/fetchApi";

const Weather = () => {
  const [search, setSearch] = useState("");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weatherSource, setWeatherSource] = useState("");

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // Use Open-Meteo geocoding first, fallback to OpenWeatherMap
      const geoData = await geocodeWithFallback(search, API_KEY);

      if (geoData) {
        const { latitude: lat, longitude: lon } = geoData;
        const [curr, fore] = await Promise.all([
          fetchWeatherWithFallback(API_KEY, lat, lon),
          fetchForecastWithFallback(API_KEY, lat, lon),
        ]);
        setCurrentWeather({ ...curr, location: geoData.name, country: geoData.country });
        setForecast(fore);
        setWeatherSource(curr.source || "Open-Meteo");
      } else {
        setError("City not found. Please try again.");
      }
    } catch (err) {
      console.error("Weather search error:", err);
      setError("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch for a default city or user location
    const initWeather = async () => {
      setLoading(true);
      try {
        // Default to London or use geolocation if available
        const defaultLat = 51.5074;
        const defaultLon = -0.1278;
        const [curr, fore] = await Promise.all([
          fetchWeatherWithFallback(API_KEY, defaultLat, defaultLon),
          fetchForecastWithFallback(API_KEY, defaultLat, defaultLon),
        ]);
        setCurrentWeather({ ...curr, location: "London", country: "GB" });
        setForecast(fore);
        setWeatherSource(curr.source || "Open-Meteo");
      } catch (err) {
        console.error("Initial weather fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    initWeather();
  }, [API_KEY]);

  const getWeatherIcon = (description) => {
    const desc = description?.toLowerCase() || "";
    if (desc.includes("rain")) return <FiCloudRain />;
    if (desc.includes("snow")) return <FiCloudSnow />;
    if (desc.includes("cloud")) return <FiCloud />;
    return <FiSun />;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="container"
      style={{ paddingTop: "140px", paddingBottom: "60px" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="weather-header"
        style={{ marginBottom: "3rem", textAlign: "center" }}
      >
        <h1
          className="text-gradient"
          style={{ fontSize: "3rem", marginBottom: "1.5rem" }}
        >
          Weather Forecast
        </h1>

        <form
          onSubmit={handleSearch}
          style={{ maxWidth: "600px", margin: "0 auto", position: "relative" }}
        >
          <input
            type="text"
            className="glass"
            placeholder="Search for a city or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "1.2rem 1.5rem 1.2rem 3.5rem",
              borderRadius: "1rem",
              border: "1px solid var(--border-color)",
              fontSize: "1.1rem",
              color: "white",
              outline: "none",
            }}
          />
          <FiSearch
            style={{
              position: "absolute",
              left: "1.2rem",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "1.4rem",
              color: "var(--text-secondary)",
            }}
          />
          <button
            type="submit"
            style={{
              position: "absolute",
              right: "0.8rem",
              top: "50%",
              transform: "translateY(-50%)",
              padding: "0.6rem 1.2rem",
              borderRadius: "0.6rem",
              background: "var(--accent-color)",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Search
          </button>
        </form>
        {error && (
          <p style={{ color: "#ef4444", marginTop: "1rem" }}>{error}</p>
        )}
      </motion.div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          Loading weather data...
        </div>
      ) : (
        currentWeather && (
          <div className="weather-content">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card glass"
              style={{
                padding: "3rem",
                marginBottom: "3rem",
                background:
                  "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "2rem",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "var(--accent-color)",
                    marginBottom: "0.5rem",
                  }}
                >
                  <FiMapPin />
                  <span style={{ fontWeight: 600, letterSpacing: "1px" }}>
                    {currentWeather.location}, {currentWeather.country}
                  </span>
                </div>
                <h2
                  style={{
                    fontSize: "5rem",
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                  }}
                >
                  {Math.round(currentWeather.temperature)}°C
                </h2>
                <p
                  style={{
                    fontSize: "1.5rem",
                    color: "var(--text-secondary)",
                    textTransform: "capitalize",
                  }}
                >
                  {currentWeather.description}
                </p>
              </div>

              <div style={{ fontSize: "8rem", color: "var(--accent-color)" }}>
                {getWeatherIcon(currentWeather.description)}
              </div>

              <div style={{ display: "flex", gap: "3rem" }}>
                <div style={{ textAlign: "center" }}>
                  <FiDroplet
                    style={{
                      fontSize: "2rem",
                      color: "#3b82f6",
                      marginBottom: "0.5rem",
                    }}
                  />
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Humidity
                  </p>
                  <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                    {currentWeather.humidity}%
                  </p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <FiWind
                    style={{
                      fontSize: "2rem",
                      color: "#10b981",
                      marginBottom: "0.5rem",
                    }}
                  />
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    Wind
                  </p>
                  <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>
                    {currentWeather.windSpeed} m/s
                  </p>
                </div>
              </div>
            </motion.div>

            <h3 style={{ fontSize: "1.8rem", marginBottom: "2rem" }}>
              7-Day Forecast
            </h3>
            <div
              className="grid"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {forecast.map((day, idx) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="card glass"
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      marginBottom: "1rem",
                      fontWeight: 500,
                    }}
                  >
                    {formatDate(day.date)}
                  </p>
                  <div
                    style={{
                      fontSize: "3rem",
                      color: "var(--accent-color)",
                      marginBottom: "1rem",
                    }}
                  >
                    {getWeatherIcon(day.description)}
                  </div>
                  <h4 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                    {day.temp}°C
                  </h4>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      textTransform: "capitalize",
                    }}
                  >
                    {day.description}
                  </p>
                  <div
                    style={{
                      marginTop: "1.5rem",
                      display: "flex",
                      justifyContent: "center",
                      gap: "1rem",
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2rem",
                      }}
                    >
                      <FiDroplet /> {day.humidity}%
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2rem",
                      }}
                    >
                      <FiWind /> {day.windSpeed}m/s
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Weather;
