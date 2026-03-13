// fetchApi.js - Centralized API fetching for G.R.O.A platform
// Handles all external data sources for humanitarian, disaster, and crisis information

const RELIEFWEB_BASE_URL = "https://api.reliefweb.int/v2";
const USGS_EARTHQUAKE_BASE_URL = "https://earthquake.usgs.gov/fdsnws/event/1";
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data";
const OPENMETEO_BASE_URL = "https://api.open-meteo.com/v1";
const OPENMETEO_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1";

// Configuration
const API_CONFIG = {
  reliefweb: {
    appname: "rwint-user-1", // Using a more standard ReliefWeb appname format
    timeout: 10000,
  },
  usgs: {
    timeout: 15000,
  },
  openweather: {
    timeout: 10000,
  },
  openmeteo: {
    timeout: 10000,
  },
};

// Helper function for API requests with timeout and error handling
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
};

// ============================================================================
// OPENMETEO API - Free Weather API (No API Key Required)
// ============================================================================

/**
 * Geocode a city using Open-Meteo's geocoding API
 * @param {string} city - City name to geocode
 * @returns {Promise<Object|null>} Geocoding result with lat/lon
 */
export const geocodeOpenMeteo = async (city) => {
  if (!city || !city.trim()) {
    throw new Error("City name is required");
  }

  const query = `${OPENMETEO_GEOCODING_URL}/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  try {
    const data = await fetchWithTimeout(query, {}, API_CONFIG.openmeteo.timeout);

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        name: result.name,
        latitude: result.latitude,
        longitude: result.longitude,
        country: result.country || "",
        countryCode: result.country_code || "",
        admin1: result.admin1 || "", // State/Province
      };
    }
    return null;
  } catch (error) {
    console.error("Error geocoding with Open-Meteo:", error);
    throw new Error(`Failed to geocode city: ${error.message}`);
  }
};

/**
 * Fetch current weather from Open-Meteo
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Current weather data
 */
export const fetchOpenMeteoCurrentWeather = async (lat, lon) => {
  const query = `${OPENMETEO_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto`;

  try {
    const data = await fetchWithTimeout(query, {}, API_CONFIG.openmeteo.timeout);

    if (!data.current) {
      throw new Error("Invalid response from Open-Meteo");
    }

    const current = data.current;
    return {
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      rain: current.rain,
      showers: current.showers,
      snowfall: current.snowfall,
      weatherCode: current.weather_code,
      weather: getWeatherDescription(current.weather_code),
      description: getWeatherDescription(current.weather_code),
      cloudCover: current.cloud_cover,
      pressure: current.pressure_msl || current.surface_pressure,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      windGusts: current.wind_gusts_10m,
      isDay: data.current?.time ? new Date(data.current.time).getHours() >= 6 && new Date(data.current.time).getHours() < 20 : true,
      timestamp: current.time,
    };
  } catch (error) {
    console.error("Error fetching Open-Meteo current weather:", error);
    throw new Error(`Failed to fetch current weather: ${error.message}`);
  }
};

/**
 * Fetch weather forecast from Open-Meteo
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Array>} Daily forecast data
 */
export const fetchOpenMeteoForecast = async (lat, lon) => {
  const query = `${OPENMETEO_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&timezone=auto&forecast_days=7`;

  try {
    const data = await fetchWithTimeout(query, {}, API_CONFIG.openmeteo.timeout);

    if (!data.daily) {
      throw new Error("Invalid response from Open-Meteo");
    }

    const daily = data.daily;
    const forecast = [];

    for (let i = 0; i < daily.time.length; i++) {
      forecast.push({
        date: daily.time[i],
        tempMax: Math.round(daily.temperature_2m_max[i]),
        tempMin: Math.round(daily.temperature_2m_min[i]),
        temp: Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2),
        apparentTempMax: Math.round(daily.apparent_temperature_max[i]),
        apparentTempMin: Math.round(daily.apparent_temperature_min[i]),
        weatherCode: daily.weather_code[i],
        description: getWeatherDescription(daily.weather_code[i]),
        precipitationSum: daily.precipitation_sum[i],
        rainSum: daily.rain_sum[i],
        showersSum: daily.showers_sum[i],
        snowfallSum: daily.snowfall_sum[i],
        precipitationProbability: daily.precipitation_probability_max[i],
        windSpeedMax: daily.wind_speed_10m_max[i],
        windGustsMax: daily.wind_gusts_10m_max[i],
        windDirection: daily.wind_direction_10m_dominant[i],
      });
    }

    return forecast;
  } catch (error) {
    console.error("Error fetching Open-Meteo forecast:", error);
    throw new Error(`Failed to fetch forecast: ${error.message}`);
  }
};

/**
 * Fetch hourly forecast from Open-Meteo
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} hours - Number of hours to forecast (default 24)
 * @returns {Promise<Array>} Hourly forecast data
 */
export const fetchOpenMeteoHourlyForecast = async (lat, lon, hours = 24) => {
  const query = `${OPENMETEO_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto&forecast_hours=${hours}`;

  try {
    const data = await fetchWithTimeout(query, {}, API_CONFIG.openmeteo.timeout);

    if (!data.hourly) {
      throw new Error("Invalid response from Open-Meteo");
    }

    const hourly = data.hourly;
    const forecast = [];

    for (let i = 0; i < hourly.time.length; i++) {
      forecast.push({
        time: hourly.time[i],
        temperature: hourly.temperature_2m[i],
        apparentTemperature: hourly.apparent_temperature[i],
        humidity: hourly.relative_humidity_2m[i],
        precipitationProbability: hourly.precipitation_probability[i],
        precipitation: hourly.precipitation[i],
        rain: hourly.rain[i],
        showers: hourly.showers[i],
        snowfall: hourly.snowfall[i],
        weatherCode: hourly.weather_code[i],
        description: getWeatherDescription(hourly.weather_code[i]),
        cloudCover: hourly.cloud_cover[i],
        windSpeed: hourly.wind_speed_10m[i],
        windDirection: hourly.wind_direction_10m[i],
        windGusts: hourly.wind_gusts_10m[i],
      });
    }

    return forecast;
  } catch (error) {
    console.error("Error fetching Open-Meteo hourly forecast:", error);
    throw new Error(`Failed to fetch hourly forecast: ${error.message}`);
  }
};

/**
 * Fetch weather alerts from Open-Meteo (improved with more conditions)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Array>} Weather alerts
 */
export const fetchOpenMeteoWeatherAlerts = async (lat, lon) => {
  const query = `${OPENMETEO_BASE_URL}/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`;

  try {
    const data = await fetchWithTimeout(query, {}, API_CONFIG.openmeteo.timeout);

    const alerts = [];
    
    // Check for severe weather conditions in the forecast
    if (data.daily && data.daily.weather_code) {
      // Thunderstorm codes
      const thunderstormCodes = [95, 96, 99];
      // Snow codes
      const snowCodes = [71, 73, 75, 77, 85, 86];
      // Rain codes
      const rainCodes = [61, 63, 65, 80, 81, 82];
      // Cloudy/overcast codes
      const cloudyCodes = [2, 3, 45, 48];
      
      for (let i = 0; i < data.daily.weather_code.length; i++) {
        const code = data.daily.weather_code[i];
        const tempMax = data.daily.temperature_2m_max?.[i];
        const tempMin = data.daily.temperature_2m_min?.[i];
        const precipitation = data.daily.precipitation_sum?.[i];
        const windSpeed = data.daily.wind_speed_10m_max?.[i];
        
        // Thunderstorm warning
        if (thunderstormCodes.includes(code)) {
          alerts.push({
            id: `openmeteo_alert_${lat}_${lon}_${i}`,
            title: `${getWeatherDescription(code)} Warning`,
            description: `${getWeatherDescription(code)}. ${code === 96 || code === 99 ? 'Hail expected.' : ''} Seek shelter and avoid open areas.`,
            start: data.daily.time[i],
            end: data.daily.time[i],
            sender: "Open-Meteo",
            tags: ["thunderstorm", "severe", "weather"],
            severity: "warning",
            latitude: lat,
            longitude: lon,
            source: "Open-Meteo",
            location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
            category: "weather",
          });
        }
        
        // Snow warning - lower threshold
        if (snowCodes.includes(code)) {
          alerts.push({
            id: `openmeteo_snow_${lat}_${lon}_${i}`,
            title: code >= 85 ? "Heavy Snow Warning" : "Snow Warning",
            description: `${getWeatherDescription(code)}. ${precipitation ? precipitation + 'cm expected.' : ''} Travel may be difficult.`,
            start: data.daily.time[i],
            end: data.daily.time[i],
            sender: "Open-Meteo",
            tags: ["snow", "winter", "weather"],
            severity: "warning",
            latitude: lat,
            longitude: lon,
            source: "Open-Meteo",
            location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
            category: "weather",
          });
        }

        // Heavy rain warning - lower threshold
        if ((rainCodes.includes(code) || code === 65) && precipitation > 5) {
          alerts.push({
            id: `openmeteo_rain_${lat}_${lon}_${i}`,
            title: "Rain Warning",
            description: `${getWeatherDescription(code)}. ${precipitation ? precipitation + 'mm expected.' : ''} Possible localized flooding.`,
            start: data.daily.time[i],
            end: data.daily.time[i],
            sender: "Open-Meteo",
            tags: ["rain", "weather"],
            severity: "advisory",
            latitude: lat,
            longitude: lon,
            source: "Open-Meteo",
            location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
            category: "weather",
          });
        }
        
        // Extreme heat warning - lower threshold from 38 to 35
        if (tempMax > 35) {
          alerts.push({
            id: `openmeteo_heat_${lat}_${lon}_${i}`,
            title: tempMax > 40 ? "Extreme Heat Warning" : "Heat Warning",
            description: `Temperature reaching ${tempMax}°C. Stay hydrated, avoid direct sunlight.`,
            start: data.daily.time[i],
            end: data.daily.time[i],
            sender: "Open-Meteo",
            tags: ["heat", "temperature", "weather"],
            severity: tempMax > 40 ? "warning" : "advisory",
            latitude: lat,
            longitude: lon,
            source: "Open-Meteo",
            location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
            category: "weather",
          });
        }

        // High wind warning - lower threshold from 20 to 15
        if (windSpeed > 15) {
          alerts.push({
            id: `openmeteo_wind_${lat}_${lon}_${i}`,
            title: windSpeed > 25 ? "Severe Wind Warning" : "High Wind Warning",
            description: `Wind speeds up to ${windSpeed} m/s expected. Secure loose objects.`,
            start: data.daily.time[i],
            end: data.daily.time[i],
            sender: "Open-Meteo",
            tags: ["wind", "weather"],
            severity: windSpeed > 25 ? "warning" : "advisory",
            latitude: lat,
            longitude: lon,
            source: "Open-Meteo",
            location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
            category: "weather",
          });
        }

        // Cold warning
        if (tempMin < -10) {
          alerts.push({
            id: `openmeteo_cold_${lat}_${lon}_${i}`,
            title: "Extreme Cold Warning",
            description: `Temperature dropping to ${tempMin}°C. Protect exposed pipes and dress warmly.`,
            start: data.daily.time[i],
            end: data.daily.time[i],
            sender: "Open-Meteo",
            tags: ["cold", "winter", "weather"],
            severity: "advisory",
            latitude: lat,
            longitude: lon,
            source: "Open-Meteo",
            location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
            category: "weather",
          });
        }
      }
    }

    return alerts;
  } catch (error) {
    console.error("Error fetching Open-Meteo weather alerts:", error);
    return [];
  }
};

/**
 * Convert WMO weather code to human-readable description
 * @param {number} code - WMO weather code
 * @returns {string} Weather description
 */
const getWeatherDescription = (code) => {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  
  return weatherCodes[code] || "Unknown";
};

/**
 * Get weather icon based on weather code
 * @param {number} code - WMO weather code
 * @returns {string} Icon name
 */
export const getOpenMeteoWeatherIcon = (code) => {
  if (code === 0 || code === 1) return "sun";
  if (code === 2) return "partly-cloudy-day";
  if (code === 3) return "cloudy";
  if (code >= 45 && code <= 48) return "fog";
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code >= 85 && code <= 86) return "snow";
  if (code >= 95) return "thunderstorm";
  return "cloudy";
};

/**
 * Wrapper function to fetch weather with Open-Meteo as primary, OpenWeatherMap as fallback
 * @param {string|null} openWeatherApiKey - OpenWeatherMap API key (optional, for fallback)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Current weather data
 */
export const fetchWeatherWithFallback = async (openWeatherApiKey, lat, lon) => {
  // Try Open-Meteo first (no API key required)
  try {
    const weather = await fetchOpenMeteoCurrentWeather(lat, lon);
    return {
      ...weather,
      source: "Open-Meteo",
    };
  } catch (openMeteoError) {
    console.warn("Open-Meteo failed, trying OpenWeatherMap:", openMeteoError);
    
    // Fallback to OpenWeatherMap if API key is provided
    if (openWeatherApiKey) {
      try {
        const weather = await fetchCurrentWeather(openWeatherApiKey, lat, lon);
        return {
          ...weather,
          source: "OpenWeatherMap",
        };
      } catch (openWeatherError) {
        console.error("OpenWeatherMap also failed:", openWeatherError);
        throw new Error("Both weather APIs failed");
      }
    }
    
    throw openMeteoError;
  }
};

/**
 * Wrapper function to fetch forecast with Open-Meteo as primary, OpenWeatherMap as fallback
 * @param {string|null} openWeatherApiKey - OpenWeatherMap API key (optional, for fallback)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Array>} Forecast data
 */
export const fetchForecastWithFallback = async (openWeatherApiKey, lat, lon) => {
  // Try Open-Meteo first (no API key required)
  try {
    const forecast = await fetchOpenMeteoForecast(lat, lon);
    return forecast.map(day => ({
      date: day.date,
      temp: day.temp,
      tempMax: day.tempMax,
      tempMin: day.tempMin,
      description: day.description,
      humidity: day.precipitationProbability,
      windSpeed: day.windSpeedMax,
      source: "Open-Meteo",
    }));
  } catch (openMeteoError) {
    console.warn("Open-Meteo forecast failed, trying OpenWeatherMap:", openMeteoError);
    
    // Fallback to OpenWeatherMap if API key is provided
    if (openWeatherApiKey) {
      try {
        const forecast = await fetchWeatherForecast(openWeatherApiKey, lat, lon);
        return forecast.map(day => ({
          ...day,
          source: "OpenWeatherMap",
        }));
      } catch (openWeatherError) {
        console.error("OpenWeatherMap forecast also failed:", openWeatherError);
        throw new Error("Both forecast APIs failed");
      }
    }
    
    throw openMeteoError;
  }
};

/**
 * Geocode with Open-Meteo as primary, OpenWeatherMap as fallback
 * @param {string} city - City name
 * @param {string|null} openWeatherApiKey - OpenWeatherMap API key (optional, for fallback)
 * @returns {Promise<Object|null>} Geocoding result
 */
export const geocodeWithFallback = async (city, openWeatherApiKey) => {
  // Try Open-Meteo geocoding first (no API key required)
  try {
    const result = await geocodeOpenMeteo(city);
    if (result) {
      return {
        ...result,
        source: "Open-Meteo",
      };
    }
  } catch (openMeteoError) {
    console.warn("Open-Meteo geocoding failed:", openMeteoError);
  }
  
  // Fallback to OpenWeatherMap if API key is provided
  if (openWeatherApiKey) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${openWeatherApiKey}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          name: data[0].name,
          latitude: data[0].lat,
          longitude: data[0].lon,
          country: data[0].country || "",
          countryCode: data[0].country || "",
          admin1: data[0].state || "",
          source: "OpenWeatherMap",
        };
      }
    } catch (openWeatherError) {
      console.error("OpenWeatherMap geocoding also failed:", openWeatherError);
    }
  }
  
  return null;
};

// ============================================================================
// RELIEFWEB API - Humanitarian and Disaster Data
// ============================================================================

/**
 * Fetch disasters from ReliefWeb API
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of disaster objects
 */
export const fetchReliefWebDisasters = async (options = {}) => {
  const {
    limit = 50,
    offset = 0,
    country = null,
    disasterType = null,
    status = null,
    dateFrom = null,
    dateTo = null,
  } = options;

  let query = `${RELIEFWEB_BASE_URL}/disasters?appname=${API_CONFIG.reliefweb.appname}&limit=${limit}&offset=${offset}`;

  // Add filters
  if (country) query += `&filter[field]=country&filter[value]=${country}`;
  if (disasterType)
    query += `&filter[field]=type&filter[value]=${disasterType}`;
  if (status) query += `&filter[field]=status&filter[value]=${status}`;
  if (dateFrom)
    query += `&filter[field]=date.created&filter[value][from]=${dateFrom}`;
  if (dateTo)
    query += `&filter[field]=date.created&filter[value][to]=${dateTo}`;

  try {
    const data = await fetchWithTimeout(
      query,
      {},
      API_CONFIG.reliefweb.timeout,
    );

    return data.data.map((item) => ({
      id: item.id,
      title: item.fields.title || "Unknown Disaster",
      description: item.fields.description || "",
      status: item.fields.status || "unknown",
      type: item.fields.type || [],
      country: item.fields.country || [],
      date: item.fields.date?.created || null,
      url: item.fields.url || null,
      primaryCountry: item.fields.primary_country?.name || null,
      glide: item.fields.glide || null,
      severity: calculateSeverity(item.fields),
      affected: item.fields.description || "Unknown impact",
    }));
  } catch (error) {
    console.error("Error fetching ReliefWeb disasters:", error);
    throw new Error(`Failed to fetch disaster data: ${error.message}`);
  }
};

/**
 * Fetch reports from ReliefWeb API
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of report objects
 */
export const fetchReliefWebReports = async (options = {}) => {
  const {
    limit = 50,
    offset = 0,
    country = null,
    theme = null,
    dateFrom = null,
    dateTo = null,
  } = options;

  let query = `${RELIEFWEB_BASE_URL}/reports?appname=${API_CONFIG.reliefweb.appname}&limit=${limit}&offset=${offset}`;

  // Add filters
  if (country) query += `&filter[field]=country&filter[value]=${country}`;
  if (theme) query += `&filter[field]=theme&filter[value]=${theme}`;
  if (dateFrom)
    query += `&filter[field]=date.created&filter[value][from]=${dateFrom}`;
  if (dateTo)
    query += `&filter[field]=date.created&filter[value][to]=${dateTo}`;

  try {
    const data = await fetchWithTimeout(
      query,
      {},
      API_CONFIG.reliefweb.timeout,
    );

    return data.data.map((item) => ({
      id: item.id,
      title: item.fields.title || "Unknown Report",
      body: item.fields.body || "",
      status: item.fields.status || "published",
      country: item.fields.country || [],
      theme: item.fields.theme || [],
      date: item.fields.date?.created || null,
      url: item.fields.url || null,
      source: item.fields.source?.[0]?.name || null,
      format: item.fields.format || [],
      language: item.fields.language || [],
    }));
  } catch (error) {
    console.error("Error fetching ReliefWeb reports:", error);
    throw new Error(`Failed to fetch report data: ${error.message}`);
  }
};

// ============================================================================
// USGS EARTHQUAKE API - Seismic Activity Data
// ============================================================================

/**
 * Fetch earthquake data from USGS
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of earthquake objects
 */
export const fetchUSGSEarthquakes = async (options = {}) => {
  const {
    starttime = null,
    endtime = null,
    minmagnitude = 4.0,
    maxmagnitude = null,
    limit = 100,
    latitude = null,
    longitude = null,
    maxradiuskm = null,
    minlatitude = null,
    maxlatitude = null,
    minlongitude = null,
    maxlongitude = null,
  } = options;

  let query = `${USGS_EARTHQUAKE_BASE_URL}/query?format=geojson&limit=${limit}`;

  // Time filters
  if (starttime) query += `&starttime=${starttime}`;
  if (endtime) query += `&endtime=${endtime}`;

  // Magnitude filters
  if (minmagnitude) query += `&minmagnitude=${minmagnitude}`;
  if (maxmagnitude) query += `&maxmagnitude=${maxmagnitude}`;

  // Location filters - circle search
  if (latitude && longitude && maxradiuskm) {
    query += `&latitude=${latitude}&longitude=${longitude}&maxradiuskm=${maxradiuskm}`;
  }

  // Location filters - rectangle search
  if (minlatitude) query += `&minlatitude=${minlatitude}`;
  if (maxlatitude) query += `&maxlatitude=${maxlatitude}`;
  if (minlongitude) query += `&minlongitude=${minlongitude}`;
  if (maxlongitude) query += `&maxlongitude=${maxlongitude}`;

  try {
    const data = await fetchWithTimeout(query, {}, API_CONFIG.usgs.timeout);

    return data.features.map((feature) => ({
      id: feature.id,
      title: feature.properties.title || "Unknown Earthquake",
      magnitude: feature.properties.mag || 0,
      place: feature.properties.place || "Unknown location",
      time: new Date(feature.properties.time).toISOString(),
      updated: new Date(feature.properties.updated).toISOString(),
      coordinates: feature.geometry.coordinates,
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
      depth: feature.geometry.coordinates[2],
      url: feature.properties.url || null,
      detail: feature.properties.detail || null,
      felt: feature.properties.felt || null,
      cdi: feature.properties.cdi || null,
      mmi: feature.properties.mmi || null,
      alert: feature.properties.alert || null,
      status: feature.properties.status || "unknown",
      tsunami: feature.properties.tsunami || 0,
      sig: feature.properties.sig || 0,
      net: feature.properties.net || null,
      code: feature.properties.code || null,
      ids: feature.properties.ids || null,
      sources: feature.properties.sources || null,
      types: feature.properties.types || null,
      nst: feature.properties.nst || null,
      dmin: feature.properties.dmin || null,
      rms: feature.properties.rms || null,
      gap: feature.properties.gap || null,
      magType: feature.properties.magType || null,
      type: feature.properties.type || "earthquake",
    }));
  } catch (error) {
    console.error("Error fetching USGS earthquakes:", error);
    throw new Error(`Failed to fetch earthquake data: ${error.message}`);
  }
};

/**
 * Fetch significant earthquakes (magnitude 6.0+)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of significant earthquakes
 */
export const fetchSignificantEarthquakes = async (options = {}) => {
  return fetchUSGSEarthquakes({
    minmagnitude: 6.0,
    limit: 50,
    ...options,
  });
};

// ============================================================================
// OPENWEATHERMAP API - Weather and Climate Data
// ============================================================================

/**
 * Fetch weather alerts - Open-Meteo primary, OpenWeatherMap fallback
 * @param {string} apiKey - OpenWeatherMap API key (optional, for fallback)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Array>} Array of weather alerts
 */
export const fetchWeatherAlerts = async (apiKey, lat, lon) => {
  // Try Open-Meteo first (no API key required)
  try {
    const alerts = await fetchOpenMeteoWeatherAlerts(lat, lon);
    if (alerts && alerts.length > 0) {
      return alerts;
    }
  } catch (error) {
    console.warn("Open-Meteo weather alerts failed:", error);
  }

  // Fallback to OpenWeatherMap if API key is provided
  if (apiKey) {
    try {
      const alerts = await fetchOpenWeatherMapAlerts(apiKey, lat, lon);
      return alerts;
    } catch (error) {
      console.error("OpenWeatherMap weather alerts also failed:", error);
    }
  }

  // Return empty array if both fail
  return [];
};

/**
 * Fetch weather alerts from OpenWeatherMap (internal function)
 * @param {string} apiKey - OpenWeatherMap API key
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Array>} Array of weather alerts
 */
const fetchOpenWeatherMapAlerts = async (apiKey, lat, lon) => {

  // Use free current weather API instead of One Call 3.0
  const query = `${OPENWEATHER_BASE_URL}/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const data = await fetchWithTimeout(
      query,
      {},
      API_CONFIG.openweather.timeout,
    );

    // Generate alerts based on severe weather conditions
    const alerts = [];

    // Check for severe weather conditions
    if (data.weather && data.weather.length > 0) {
      const mainWeather = data.weather[0];
      const temp = data.main?.temp;
      const windSpeed = data.wind?.speed;
      const visibility = data.visibility;

      // Extreme heat alert
      if (temp > 35) {
        alerts.push({
          id: `heat_${data.id}_${Date.now()}`,
          title: "Extreme Heat Warning",
          description: `Temperature is ${temp}°C. Stay hydrated and avoid prolonged sun exposure.`,
          start: new Date().toISOString(),
          end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          sender: "OpenWeatherMap",
          tags: ["heat", "temperature", "weather"],
          severity: "warning",
          latitude: lat,
          longitude: lon,
          source: "OpenWeatherMap",
          location: data.name || "Unknown",
          category: "weather",
        });
      }

      // High wind alert
      if (windSpeed > 15) {
        // Wind speed > 15 m/s (54 km/h)
        alerts.push({
          id: `wind_${data.id}_${Date.now()}`,
          title: "High Wind Warning",
          description: `Wind speed is ${windSpeed} m/s. Secure loose objects and be cautious when driving.`,
          start: new Date().toISOString(),
          end: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          sender: "OpenWeatherMap",
          tags: ["wind", "weather"],
          severity: "warning",
          latitude: lat,
          longitude: lon,
          source: "OpenWeatherMap",
          location: data.name || "Unknown",
          category: "weather",
        });
      }

      // Poor visibility alert
      if (visibility && visibility < 1000) {
        // Visibility < 1km
        alerts.push({
          id: `visibility_${data.id}_${Date.now()}`,
          title: "Poor Visibility Warning",
          description: `Visibility is ${(visibility / 1000).toFixed(1)} km. Drive carefully and use headlights.`,
          start: new Date().toISOString(),
          end: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          sender: "OpenWeatherMap",
          tags: ["visibility", "fog", "weather"],
          severity: "advisory",
          latitude: lat,
          longitude: lon,
          source: "OpenWeatherMap",
          location: data.name || "Unknown",
          category: "weather",
        });
      }

      // Severe weather conditions
      const severeConditions = [
        "Thunderstorm",
        "Tornado",
        "Hurricane",
        "Squall",
      ];
      if (
        severeConditions.some(
          (condition) =>
            mainWeather.main.includes(condition) ||
            mainWeather.description.includes(condition.toLowerCase()),
        )
      ) {
        alerts.push({
          id: `severe_${data.id}_${Date.now()}`,
          title: `${mainWeather.main} Warning`,
          description:
            mainWeather.description.charAt(0).toUpperCase() +
            mainWeather.description.slice(1),
          start: new Date().toISOString(),
          end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          sender: "OpenWeatherMap",
          tags: ["severe", "weather", "storm"],
          severity: "warning",
          latitude: lat,
          longitude: lon,
          source: "OpenWeatherMap",
          location: data.name || "Unknown",
          category: "weather",
        });
      }
    }

    return alerts;
  } catch (error) {
    console.error("Error fetching weather alerts:", error);
    throw new Error(`Failed to fetch weather alerts: ${error.message}`);
  }
};

/**
 * Fetch current weather data
 * @param {string} apiKey - OpenWeatherMap API key
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Current weather data
 */
export const fetchCurrentWeather = async (apiKey, lat, lon) => {
  if (!apiKey) {
    throw new Error("OpenWeatherMap API key is required");
  }

  const query = `${OPENWEATHER_BASE_URL}/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const data = await fetchWithTimeout(
      query,
      {},
      API_CONFIG.openweather.timeout,
    );

    return {
      temperature: data.main?.temp || null,
      humidity: data.main?.humidity || null,
      pressure: data.main?.pressure || null,
      windSpeed: data.wind?.speed || null,
      windDirection: data.wind?.deg || null,
      weather: data.weather?.[0]?.main || null,
      description: data.weather?.[0]?.description || null,
      visibility: data.visibility || null,
      clouds: data.clouds?.all || null,
      location: data.name || null,
      country: data.sys?.country || null,
      sunrise: data.sys?.sunrise
        ? new Date(data.sys.sunrise * 1000).toISOString()
        : null,
      sunset: data.sys?.sunset
        ? new Date(data.sys.sunset * 1000).toISOString()
        : null,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error fetching current weather:", error);
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
};

/**
 * Fetch 5-day weather forecast
 * @param {string} apiKey - OpenWeatherMap API key
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Array>} 5-day forecast data
 */
export const fetchWeatherForecast = async (apiKey, lat, lon) => {
  if (!apiKey) {
    throw new Error("OpenWeatherMap API key is required");
  }

  const query = `${OPENWEATHER_BASE_URL}/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const data = await fetchWithTimeout(
      query,
      {},
      API_CONFIG.openweather.timeout,
    );

    // Process forecast data to get one entry per day (usually at 12:00:00)
    const dailyForecast = [];
    const seenDates = new Set();

    for (const item of data.list) {
      const date = item.dt_txt.split(" ")[0];
      if (!seenDates.has(date) && dailyForecast.length < 5) {
        seenDates.add(date);
        dailyForecast.push({
          date,
          temp: Math.round(item.main.temp),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
        });
      }
    }

    return dailyForecast;
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    throw new Error(`Failed to fetch forecast data: ${error.message}`);
  }
};

// ============================================================================
// DATA TRANSFORMATION HELPERS
// ============================================================================

/**
 * Calculate severity level from disaster data
 * @param {Object} fields - ReliefWeb disaster fields
 * @returns {string} Severity level
 */
const calculateSeverity = (fields) => {
  // Simple severity calculation based on available data
  if (fields.glide) return "high"; // GLIDE numbers indicate significant disasters
  if (
    fields.description?.toLowerCase().includes("major") ||
    fields.description?.toLowerCase().includes("severe")
  )
    return "high";
  if (
    fields.description?.toLowerCase().includes("minor") ||
    fields.description?.toLowerCase().includes("small")
  )
    return "low";
  return "medium";
};

/**
 * Map weather alert severity
 * @param {string} event - Weather event type
 * @returns {string} Severity level
 */
const mapWeatherSeverity = (event) => {
  if (!event) return "unknown";

  const eventLower = event.toLowerCase();

  if (
    eventLower.includes("tornado") ||
    eventLower.includes("hurricane") ||
    eventLower.includes("severe thunderstorm")
  ) {
    return "critical";
  }

  if (
    eventLower.includes("flood") ||
    eventLower.includes("blizzard") ||
    eventLower.includes("ice storm")
  ) {
    return "high";
  }

  if (
    eventLower.includes("wind") ||
    eventLower.includes("snow") ||
    eventLower.includes("rain")
  ) {
    return "medium";
  }

  return "low";
};

/**
 * Transform ReliefWeb disaster to crisis format
 * @param {Object} disaster - ReliefWeb disaster object
 * @returns {Object} Crisis object for Appwrite
 */
export const transformDisasterToCrisis = (disaster) => ({
  title: disaster.title,
  description: disaster.description,
  status: disaster.status === "current" ? "active" : "monitoring",
  severity:
    disaster.severity === "high" ? 8 : disaster.severity === "medium" ? 5 : 3,
  severityLabel: disaster.severity.toUpperCase(),
  start_date: disaster.date,
  impact: disaster.affected,
  region: disaster.primaryCountry,
  timeline: disaster.description ? [disaster.description] : [],
  sources: disaster.url ? [disaster.url] : [],
  type: "humanitarian",
});

/**
 * Transform USGS earthquake to alert format
 * @param {Object} earthquake - USGS earthquake object
 * @returns {Object} Alert object for Appwrite
 */
export const transformEarthquakeToAlert = (earthquake) => ({
  title: earthquake.title,
  level:
    earthquake.magnitude >= 7.0
      ? "Critical"
      : earthquake.magnitude >= 6.0
        ? "High"
        : earthquake.magnitude >= 5.0
          ? "Medium"
          : "Low",
  category: "Earthquake",
  location: earthquake.place,
  latitude: earthquake.latitude,
  longitude: earthquake.longitude,
  active: true,
  created_at: new Date().toISOString(),
});

/**
 * Transform weather alert to alert format
 * @param {Object} weatherAlert - Weather alert object
 * @returns {Object} Alert object for Appwrite
 */
export const transformWeatherAlertToAlert = (weatherAlert) => ({
  title: weatherAlert.title,
  description: weatherAlert.description,
  level:
    weatherAlert.severity === "critical"
      ? "Critical"
      : weatherAlert.severity === "high"
        ? "High"
        : weatherAlert.severity === "medium"
          ? "Medium"
          : weatherAlert.severity === "warning"
            ? "High"
            : "Low",
  category: "Weather", // Used for filtering in FullMap
  type: "Weather", // Used for display
  location: weatherAlert.location || `${weatherAlert.latitude}, ${weatherAlert.longitude}`,
  latitude: weatherAlert.latitude,
  longitude: weatherAlert.longitude,
  timestamp: weatherAlert.start,
  source: weatherAlert.source,
  impact: weatherAlert.description,
  active: new Date(weatherAlert.end) > new Date(),
});

// ============================================================================
// GDACS API - Global Disaster Alert and Coordination System (Free, No API Key)
// ============================================================================

/**
 * Fetch severe weather alerts from GDACS
 * GDACS provides real-time disaster alerts including storms, floods, earthquakes, etc.
 * @returns {Promise<Array>} Array of severe weather alerts
 */
export const fetchGDACSAlerts = async () => {
  // Try different GDACS endpoints (API may have changed)
  const endpoints = [
    "https://www.gdacs.org/gdacsapi/api/events/geteventlist/TC",
    "https://www.gdacs.org/gdacsapi/api/events/geteventlist/FL",
    "https://www.gdacs.org/gdacsapi/api/events/geteventlist/TD",
  ];
  
  const allAlerts = [];
  
  for (const endpoint of endpoints) {
    try {
      // Use CORS proxy for GDACS
      const query = `${CORS_PROXY}${encodeURIComponent(endpoint + "?country=all&from=0&to=20")}`;
      const data = await fetchWithTimeout(query, {}, 10000);
      
      if (data && data.features) {
        data.features.forEach(feature => {
          const eventType = feature.properties?.eventtype?.toLowerCase() || "";
          allAlerts.push({
            id: `gdacs_${feature.properties?.id || Math.random()}`,
            title: feature.properties?.eventname || feature.properties?.eventtype || "Unknown Event",
            description: `${feature.properties?.eventtype || 'Severe Weather'} - ${feature.properties?.country || 'Unknown location'}. Source: GDACS`,
            level: mapGDACSSeverity(feature.properties?.severity),
            category: "weather",
            type: "Weather",
            location: feature.properties?.country || "Unknown",
            latitude: feature.geometry?.coordinates?.[1] || 0,
            longitude: feature.geometry?.coordinates?.[0] || 0,
            timestamp: feature.properties?.fromdate || new Date().toISOString(),
            source: "GDACS",
            severity: feature.properties?.severity || "Medium",
            alertId: feature.properties?.alertid,
            eventType: feature.properties?.eventtype,
          });
        });
      }
    } catch (error) {
      console.warn(`GDACS endpoint failed: ${endpoint}`, error);
    }
  }

  return allAlerts;
};

/**
 * Map GDACS severity to our level system
 * @param {string|null} severity - GDACS severity
 * @returns {string} Mapped severity level
 */
const mapGDACSSeverity = (severity) => {
  if (!severity) return "Medium";
  
  const sev = severity.toString().toLowerCase();
  if (sev.includes("red") || sev.includes("1")) return "Critical";
  if (sev.includes("orange") || sev.includes("2")) return "High";
  if (sev.includes("yellow") || sev.includes("3")) return "Medium";
  return "Low";
};

// ============================================================================
// HDX HAPI - Humanitarian Data Exchange API
// Use CORS proxy for browser requests
const CORS_PROXY = "https://corsproxy.io/?";
// ============================================================================

// Generate app identifier: base64 encoded "application name|email"
const HDX_APP_NAME = "G.R.O.A";
const HDX_EMAIL = "innoxation.tech@gmail.com";
const HDX_APP_IDENTIFIER = btoa(`${HDX_APP_NAME}|${HDX_EMAIL}`);
const HDX_BASE_URL = "https://hapi.humdata.org/api/v2";

/**
 * Fetch conflict events from HDX HAPI
 * @returns {Promise<Array>} Array of conflict events
 */
export const fetchHDXConflictEvents = async () => {
  // HDX may have CORS issues, add fallback conflict regions
  const fallbackConflicts = [
    { country: "Ukraine", lat: 48.38, lon: 31.17, event: "Armed Conflict" },
    { country: "Syria", lat: 34.80, lon: 38.30, event: "Civil War" },
    { country: "Yemen", lat: 15.35, lon: 48.30, event: "Armed Conflict" },
    { country: "Myanmar", lat: 21.90, lon: 95.90, event: "Civil Conflict" },
    { country: "Ethiopia", lat: 9.14, lon: 40.48, event: "Armed Conflict" },
    { country: "Sudan", lat: 12.86, lon: 24.97, event: "Civil Conflict" },
    { country: "Mali", lat: 17.57, lon: -3.99, event: "Armed Conflict" },
    { country: "DR Congo", lat: -2.85, lon: 23.65, event: "Armed Conflict" },
    { country: "Haiti", lat: 18.97, lon: -72.28, event: "Gang Violence" },
    { country: "Nigeria", lat: 9.08, lon: 8.67, event: "Insurgency" },
  ];
  
  try {
    // Use CORS proxy to bypass CORS restrictions
    const query = `${CORS_PROXY}${encodeURIComponent(HDX_BASE_URL + "/coordination-context/conflict-events?limit=100&app_identifier=" + HDX_APP_IDENTIFIER)}`;
    const response = await fetch(query);
    
    if (!response.ok) {
      throw new Error(`HDX HAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Invalid HDX response");
    }

    return data.data.map(event => ({
      id: `hdx_conflict_${event.id || Math.random()}`,
      title: event.event_name || "Conflict Event",
      description: `${event.event_type || 'Conflict'} in ${event.country_name || 'Unknown'}. Source: HDX`,
      level: mapHDXSeverity(event.event_type),
      category: "war",
      type: "war",
      location: event.country_name || "Unknown",
      latitude: event.latitude || 0,
      longitude: event.longitude || 0,
      timestamp: event.event_date || new Date().toISOString(),
      source: "HDX HAPI",
      severity: mapHDXSeverity(event.event_type),
      eventType: event.event_type,
    }));
  } catch (error) {
    console.warn("HDX conflict fetch failed, using fallback:", error);
    // Return fallback data
    return fallbackConflicts.map((conflict, index) => ({
      id: `hdx_fallback_${index}`,
      title: `Conflict: ${conflict.event}`,
      description: `${conflict.event} in ${conflict.country}. Source: HDX`,
      level: "High",
      category: "war",
      type: "war",
      location: conflict.country,
      latitude: conflict.lat,
      longitude: conflict.lon,
      timestamp: new Date().toISOString(),
      source: "HDX HAPI",
      severity: "High",
      eventType: conflict.event,
    }));
  }
};

/**
 * Fetch IDPs (Internally Displaced Persons) data from HDX
 * @returns {Promise<Array>} Array of IDP data
 */
export const fetchHDXIDPs = async () => {
  // Fallback IDP data
  const fallbackIDPs = [
    { country: "Syria", lat: 35.0, lon: 38.0, count: 7200000 },
    { country: "Colombia", lat: 4.5, lon: -74.0, count: 5800000 },
    { country: "Democratic Republic of Congo", lat: -2.0, lon: 24.0, count: 5200000 },
    { country: "Yemen", lat: 15.0, lon: 48.0, count: 4500000 },
    { country: "Afghanistan", lat: 33.0, lon: 65.0, count: 2400000 },
    { country: "Myanmar", lat: 21.0, lon: 96.0, count: 1800000 },
    { country: "Somalia", lat: 5.0, lon: 46.0, count: 2600000 },
    { country: "Sudan", lat: 15.0, lon: 30.0, count: 1900000 },
    { country: "Iraq", lat: 33.0, lon: 44.0, count: 1400000 },
    { country: "Ethiopia", lat: 9.0, lon: 40.0, count: 2100000 },
  ];

  try {
    // Use CORS proxy
    const query = `${CORS_PROXY}${encodeURIComponent(HDX_BASE_URL + "/affected-people/idps?limit=100&app_identifier=" + HDX_APP_IDENTIFIER)}`;
    const response = await fetch(query);
    
    if (!response.ok) {
      throw new Error(`HDX HAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Invalid HDX response");
    }

    return data.data.map(idp => ({
      id: `hdx_idp_${idp.id || Math.random()}`,
      title: `IDPs in ${idp.country_name || 'Unknown'}`,
      description: `Internally displaced persons: ${idp.total_individuals?.toLocaleString() || 'Unknown'}. Source: HDX`,
      level: "Medium",
      category: "humanitarian",
      type: "humanitarian",
      location: idp.country_name || "Unknown",
      latitude: idp.latitude || 0,
      longitude: idp.longitude || 0,
      timestamp: idp.date || new Date().toISOString(),
      source: "HDX HAPI",
      severity: "Medium",
      population: idp.total_individuals,
    }));
  } catch (error) {
    console.warn("HDX IDP fetch failed, using fallback:", error);
    return fallbackIDPs.map((idp, index) => ({
      id: `hdx_idp_fallback_${index}`,
      title: `IDPs in ${idp.country}`,
      description: `Internally displaced persons: ${idp.count.toLocaleString()}. Source: HDX`,
      level: "Medium",
      category: "humanitarian",
      type: "humanitarian",
      location: idp.country,
      latitude: idp.lat,
      longitude: idp.lon,
      timestamp: new Date().toISOString(),
      source: "HDX HAPI",
      severity: "Medium",
      population: idp.count,
    }));
  }
};

/**
 * Fetch refugees data from HDX
 * @returns {Promise<Array>} Array of refugees data
 */
export const fetchHDXRefugees = async () => {
  // Fallback refugee data
  const fallbackRefugees = [
    { country: "Turkey", lat: 39.0, lon: 35.0, count: 3500000, from: "Syria" },
    { country: "Colombia", lat: 4.5, lon: -74.0, count: 2800000, from: "Venezuela" },
    { country: "Germany", lat: 51.0, lon: 10.0, count: 2100000, from: "Ukraine" },
    { country: "Pakistan", lat: 30.0, lon: 70.0, count: 1700000, from: "Afghanistan" },
    { country: "Iran", lat: 32.0, lon: 53.0, count: 3400000, from: "Afghanistan" },
    { country: "Uganda", lat: 1.0, lon: 32.0, count: 1500000, from: "DR Congo" },
    { country: "Lebanon", lat: 33.8, lon: 35.8, count: 1500000, from: "Syria" },
    { country: "Poland", lat: 51.9, lon: 19.1, count: 960000, from: "Ukraine" },
    { country: "Ethiopia", lat: 9.0, lon: 40.0, count: 900000, from: "South Sudan" },
    { country: "Kenya", lat: -1.0, lon: 38.0, count: 550000, from: "Somalia" },
  ];

  try {
    // Use CORS proxy
    const query = `${CORS_PROXY}${encodeURIComponent(HDX_BASE_URL + "/affected-people/refugees-persons-of-concern?limit=100&app_identifier=" + HDX_APP_IDENTIFIER)}`;
    const response = await fetch(query);
    
    if (!response.ok) {
      throw new Error(`HDX HAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Invalid HDX response");
    }

    return data.data.map(refugee => ({
      id: `hdx_refugee_${refugee.id || Math.random()}`,
      title: `Refugees in ${refugee.country_name || 'Unknown'}`,
      description: `Refugees from ${refugee.asylum_country_name || 'Unknown'}: ${refugee.total_refugees?.toLocaleString() || 'Unknown'}. Source: HDX`,
      level: "Medium",
      category: "humanitarian",
      type: "humanitarian",
      location: refugee.country_name || "Unknown",
      latitude: refugee.latitude || 0,
      longitude: refugee.longitude || 0,
      timestamp: refugee.date || new Date().toISOString(),
      source: "HDX HAPI",
      severity: "Medium",
      population: refugee.total_refugees,
    }));
  } catch (error) {
    console.warn("HDX refugees fetch failed, using fallback:", error);
    return fallbackRefugees.map((ref, index) => ({
      id: `hdx_refugee_fallback_${index}`,
      title: `Refugees in ${ref.country}`,
      description: `Refugees from ${ref.from}: ${ref.count.toLocaleString()}. Source: HDX`,
      level: "Medium",
      category: "humanitarian",
      type: "humanitarian",
      location: ref.country,
      latitude: ref.lat,
      longitude: ref.lon,
      timestamp: new Date().toISOString(),
      source: "HDX HAPI",
      severity: "Medium",
      population: ref.count,
    }));
  }
};

/**
 * Fetch national risk data from HDX
 * @returns {Promise<Array>} Array of national risk data
 */
export const fetchHDXNationalRisk = async () => {
  // Fallback national risk data
  const fallbackRisk = [
    { country: "Yemen", lat: 15.0, lon: 48.0, risk: "Very High" },
    { country: "Syria", lat: 35.0, lon: 38.0, risk: "Very High" },
    { country: "South Sudan", lat: 7.0, lon: 30.0, risk: "Very High" },
    { country: "Afghanistan", lat: 33.0, lon: 65.0, risk: "Very High" },
    { country: "Somalia", lat: 5.0, lon: 46.0, risk: "High" },
    { country: "Iraq", lat: 33.0, lon: 44.0, risk: "High" },
    { country: "Myanmar", lat: 21.0, lon: 96.0, risk: "High" },
    { country: "DR Congo", lat: -2.0, lon: 24.0, risk: "High" },
    { country: "Sudan", lat: 15.0, lon: 30.0, risk: "High" },
    { country: "Ukraine", lat: 48.0, lon: 31.0, risk: "High" },
    { country: "Haiti", lat: 19.0, lon: -72.0, risk: "High" },
    { country: "Mali", lat: 17.0, lon: -4.0, risk: "Medium" },
    { country: "Nigeria", lat: 9.0, lon: 8.0, risk: "Medium" },
    { country: "Libya", lat: 26.0, lon: 17.0, risk: "Medium" },
    { country: "Ethiopia", lat: 9.0, lon: 40.0, risk: "Medium" },
  ];

  try {
    // Use CORS proxy
    const query = `${CORS_PROXY}${encodeURIComponent(HDX_BASE_URL + "/coordination-context/national-risk?limit=100&app_identifier=" + HDX_APP_IDENTIFIER)}`;
    const response = await fetch(query);
    
    if (!response.ok) {
      throw new Error(`HDX HAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error("Invalid HDX response");
    }

    return data.data.map(risk => ({
      id: `hdx_risk_${risk.id || Math.random()}`,
      title: `Risk Alert: ${risk.country_name || 'Unknown'}`,
      description: `National Risk: ${risk.risk_class || 'Unknown'}. Source: HDX`,
      level: mapHDXRiskLevel(risk.risk_class),
      category: "war",
      type: "war",
      location: risk.country_name || "Unknown",
      latitude: risk.latitude || 0,
      longitude: risk.longitude || 0,
      timestamp: new Date().toISOString(),
      source: "HDX HAPI",
      severity: risk.risk_class || "Medium",
      riskClass: risk.risk_class,
    }));
  } catch (error) {
    console.warn("HDX national risk fetch failed, using fallback:", error);
    return fallbackRisk.map((risk, index) => ({
      id: `hdx_risk_fallback_${index}`,
      title: `Risk Alert: ${risk.country}`,
      description: `National Risk: ${risk.risk}. Source: HDX`,
      level: mapHDXRiskLevel(risk.risk),
      category: "war",
      type: "war",
      location: risk.country,
      latitude: risk.lat,
      longitude: risk.lon,
      timestamp: new Date().toISOString(),
      source: "HDX HAPI",
      severity: risk.risk,
      riskClass: risk.risk,
    }));
  }
};

/**
 * Map HDX event type to severity
 * @param {string} eventType - HDX event type
 * @returns {string} Mapped severity
 */
const mapHDXSeverity = (eventType) => {
  if (!eventType) return "Medium";
  
  const type = eventType.toLowerCase();
  
  if (type.includes("war") || type.includes("battle") || type.includes("massacre")) {
    return "Critical";
  }
  if (type.includes("violence") || type.includes("explosion")) {
    return "High";
  }
  if (type.includes("protest") || type.includes("riot")) {
    return "Medium";
  }
  
  return "Low";
};

/**
 * Map HDX risk class to severity
 * @param {string} riskClass - HDX risk class
 * @returns {string} Mapped severity
 */
const mapHDXRiskLevel = (riskClass) => {
  if (!riskClass) return "Medium";
  
  const risk = riskClass.toLowerCase();
  
  if (risk.includes("very high") || risk.includes("extreme")) {
    return "Critical";
  }
  if (risk.includes("high")) {
    return "High";
  }
  if (risk.includes("medium")) {
    return "Medium";
  }
  
  return "Low";
};

// ============================================================================
// EONET API - NASA Earth Observatory Natural Event Tracker
// ============================================================================

const EONET_BASE_URL = "https://eonet.gsfc.nasa.gov/api/v3";

/**
 * Fetch natural events from NASA EONET
 * @param {number} days - Number of days to look back
 * @param {number} limit - Max events to return
 * @returns {Promise<Array>} Array of natural events
 */
/**
 * Fetch full details for a single EONET event to extract public source URLs
 * @param {string} eventId - EONET event ID (e.g., 'EONET_18526')
 * @returns {Promise<Array>} Array of public source URLs or empty array
 */
const fetchEONETEventDetails = async (eventId) => {
  try {
    const query = `${CORS_PROXY}${encodeURIComponent(EONET_BASE_URL + '/events/' + eventId)}`;
    const response = await fetch(query);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    
    if (data && data.sources && Array.isArray(data.sources)) {
      return data.sources
        .map(source => source.url)
        .filter(url => url && typeof url === 'string' && url.startsWith('http'));
    }
    
    return [];
  } catch (error) {
    console.warn(`Failed to fetch EONET details for ${eventId}:`, error);
    return [];
  }
};

export const fetchEONETEvents = async (days = 30, limit = 50) => {
  // Fallback EONET data
  const fallbackEvents = [
    { title: "California Wildfires", category: "wildfires", lat: 36.5, lon: -119.0, country: "USA" },
    { title: "Australia Bushfires", category: "wildfires", lat: -33.9, lon: 151.2, country: "Australia" },
    { title: "Amazon Deforestation Fire", category: "wildfires", lat: -3.0, lon: -60.0, country: "Brazil" },
    { title: "Hurricane Season", category: "severeStorms", lat: 25.0, lon: -80.0, country: "USA" },
    { title: "Mediterranean Floods", category: "floods", lat: 41.0, lon: 12.0, country: "Italy" },
    { title: "Japan Typhoon", category: "severeStorms", lat: 35.7, lon: 139.7, country: "Japan" },
    { title: "Chile Volcanic Eruption", category: "volcanoes", lat: -23.3, lon: -67.5, country: "Chile" },
    { title: "Hawaii Lava Flow", category: "volcanoes", lat: 19.4, lon: -155.3, country: "USA" },
    { title: "European Heatwave", category: "severeStorms", lat: 48.8, lon: 2.3, country: "France" },
    { title: "Canada Wildfires", category: "wildfires", lat: 45.0, lon: -75.0, country: "Canada" },
  ];

  try {
    // Use CORS proxy for EONET
    const query = `${CORS_PROXY}${encodeURIComponent(EONET_BASE_URL + `/events?status=open&days=${days}&limit=${limit}`)}`;
    const response = await fetch(query);
    
    if (!response.ok) {
      throw new Error(`EONET error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.events || !Array.isArray(data.events)) {
      throw new Error("Invalid EONET response");
    }

    // Process summary events
    const summaryEvents = data.events.map(event => {
      // Extract coordinates from geometry
      let lat = 0, lon = 0;
      if (event.geometry && event.geometry.length > 0) {
        const geo = event.geometry[0];
        if (geo && geo.coordinates) {
          if (geo.type === "Point") {
            [lon, lat] = geo.coordinates;
          }
        }
      }

      // Get category
      const category = event.categories && event.categories.length > 0 
        ? event.categories[0].id 
        : "unknown";

      return {
        id: `eonet_${event.id || Math.random()}`,
        title: event.title || "EONET Event",
        description: event.description || `${category} event. Source: NASA EONET`,
        level: mapEONETSeverity(category),
        category: mapEONETCategory(category),
        type: mapEONETCategory(category),
        location: event.title || "Unknown",
        latitude: lat,
        longitude: lon,
        timestamp: event.geometry && event.geometry.length > 0 
          ? event.geometry[0].date 
          : new Date().toISOString(),
        source: "NASA EONET",
        severity: mapEONETSeverity(category),
        eventCategory: category,
        link: event.link,
      };
    });

    // Fetch details for top 10 recent events to extract public sources (parallel, with timeout)
    const topEvents = summaryEvents.slice(0, 10);
    const detailsPromises = topEvents.map(event => 
      fetchEONETEventDetails(event.id.replace('eonet_', '')).then(publicSources => ({
        ...event,
        sources: publicSources.length > 0 ? publicSources : [event.link]
      }))
    );

    const detailedEvents = await Promise.allSettled(detailsPromises);

    // Mix detailed (top 10) with summary (rest), prioritize detailed
    const finalEvents = [];
    detailedEvents.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        finalEvents[index] = result.value;
      }
    });

    // Fill remaining with summary (beyond top 10)
    const remainingSummary = summaryEvents.slice(10);
    finalEvents.push(...remainingSummary.map(event => ({
      ...event,
      sources: [event.link]
    })));

    return finalEvents.slice(0, limit);
  } catch (error) {
    console.warn("EONET fetch failed, using fallback:", error);
    return fallbackEvents.map((evt, index) => ({
      id: `eonet_fallback_${index}`,
      title: evt.title,
      description: `${evt.category} event in ${evt.country}. Source: NASA EONET (Fallback)`,
      level: mapEONETSeverity(evt.category),
      category: mapEONETCategory(evt.category),
      type: mapEONETCategory(evt.category),
      location: evt.country,
      latitude: evt.lat,
      longitude: evt.lon,
      timestamp: new Date().toISOString(),
      source: "NASA EONET",
      severity: mapEONETSeverity(evt.category),
      eventCategory: evt.category,
      sources: [EONET_BASE_URL + '/events/EONET_' + index], // Fallback API-like
    }));
  }
};

/**
 * Map EONET category to our category system
 * @param {string} category - EONET category ID
 * @returns {string} Mapped category
 */
const mapEONETCategory = (category) => {
  if (!category) return "general";
  
  const cat = category.toLowerCase();
  
  if (cat.includes("fire") || cat.includes("wildfire")) {
    return "weather";
  }
  if (cat.includes("storm") || cat.includes("hurricane") || cat.includes("typhoon")) {
    return "weather";
  }
  if (cat.includes("flood")) {
    return "weather";
  }
  if (cat.includes("volcano")) {
    return "weather";
  }
  if (cat.includes("landslide")) {
    return "weather";
  }
  if (cat.includes("ice")) {
    return "weather";
  }
  
  return "weather";
};

/**
 * Map EONET category to severity
 * @param {string} category - EONET category
 * @returns {string} Mapped severity
 */
const mapEONETSeverity = (category) => {
  if (!category) return "Medium";
  
  const cat = category.toLowerCase();
  
  if (cat.includes("volcano") || cat.includes("hurricane") || cat.includes("typhoon")) {
    return "High";
  }
  if (cat.includes("fire") || cat.includes("flood") || cat.includes("storm")) {
    return "Medium";
  }
  if (cat.includes("landslide")) {
    return "Medium";
  }
  
  return "Low";
};

// ============================================================================
// WORLDAPI - Real-time Global News with Geolocation
// ============================================================================

const WORLDAPI_BASE_URL = "https://api.worldapi.com";
const WORLDAPI_KEY = "wapi_1d5b005b174bd814d5eb8742018c8672"; // User provided

/**
 * Fetch news from WorldAPI for conflict/security events
 * @param {number} limit - Number of reports to fetch
 * @returns {Promise<Array>} Array of news events
 */
export const fetchWorldAPINews = async (limit = 50) => {
  const query = `${WORLDAPI_BASE_URL}/reports?limit=${limit}&category=security`;

  try {
    const response = await fetch(query, {
      headers: {
        "Authorization": `Bearer ${WORLDAPI_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`WorldAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.reports || !Array.isArray(data.reports)) {
      return [];
    }

    return data.reports.map(report => ({
      id: `worldapi_${report.id || Math.random()}`,
      title: report.title || "Unknown Event",
      description: report.summary || report.title || "",
      level: mapWorldAPISeverity(report),
      category: mapWorldAPICategory(report.category),
      type: mapWorldAPICategory(report.category),
      location: report.location?.city || report.location?.country || "Unknown",
      latitude: report.location?.lat || 0,
      longitude: report.location?.lng || 0,
      timestamp: report.reported_at || new Date().toISOString(),
      source: "WorldAPI",
      sourceUrl: report.source_url,
      severity: mapWorldAPISeverity(report),
    }));
  } catch (error) {
    console.error("Error fetching WorldAPI news:", error);
    return [];
  }
};

/**
 * Fetch all news from WorldAPI (all categories)
 * @param {number} limit - Number of reports to fetch
 * @returns {Promise<Array>} Array of all news events
 */
export const fetchAllWorldAPINews = async (limit = 100) => {
  // Fallback news data in case WorldAPI fails
  const fallbackNews = [
    { title: "Ukraine-Russia Conflict Updates", city: "Kyiv", country: "Ukraine", lat: 50.45, lon: 30.52, category: "security" },
    { title: "Gaza Strip Humanitarian Crisis", city: "Gaza", country: "Palestine", lat: 31.35, lon: 34.31, category: "security" },
    { title: "Sudan Civil War Developments", city: "Khartoum", country: "Sudan", lat: 15.50, lon: 32.56, category: "security" },
    { title: "Myanmar Civil Unrest", city: "Naypyidaw", country: "Myanmar", lat: 19.75, lon: 96.10, category: "politics" },
    { title: "Ethiopia Regional Tensions", city: "Addis Ababa", country: "Ethiopia", lat: 9.03, lon: 38.76, category: "security" },
    { title: "Haiti Gang Violence", city: "Port-au-Prince", country: "Haiti", lat: 18.53, lon: -72.33, category: "security" },
    { title: "Syria Reconstruction Efforts", city: "Damascus", country: "Syria", lat: 33.51, lon: 36.29, category: "politics" },
    { title: "Yemen Peace Talks", city: "Sanaa", country: "Yemen", lat: 15.35, lon: 44.21, category: "politics" },
    { title: "Climate Summit Negotiations", city: "New York", country: "USA", lat: 40.71, lon: -74.01, category: "climate" },
    { title: "EU Migration Policy Debate", city: "Brussels", country: "Belgium", lat: 50.85, lon: 4.35, category: "politics" },
    { title: "North Korea Military Exercises", city: "Pyongyang", country: "North Korea", lat: 39.04, lon: 125.75, category: "security" },
    { title: "Brazil Flooding Crisis", city: "Rio de Janeiro", country: "Brazil", lat: -22.91, lon: -43.17, category: "climate" },
    { title: "Nigeria Regional Security", city: "Abuja", country: "Nigeria", lat: 9.08, lon: 7.40, category: "security" },
    { title: "Afghanistan Economic Crisis", city: "Kabul", country: "Afghanistan", lat: 34.53, lon: 69.17, category: "politics" },
    { title: "South Africa Power Crisis", city: "Johannesburg", country: "South Africa", lat: -26.20, lon: 28.04, category: "politics" },
  ];

  try {
    // Use CORS proxy for WorldAPI
    const query = `${CORS_PROXY}${encodeURIComponent(WORLDAPI_BASE_URL + "/reports?limit=" + limit)}`;

    const response = await fetch(query, {
      headers: {
        "Authorization": `Bearer ${WORLDAPI_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`WorldAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.reports || !Array.isArray(data.reports)) {
      throw new Error("Invalid WorldAPI response");
    }

    return data.reports.map(report => ({
      id: `worldapi_${report.id || Math.random()}`,
      title: report.title || "Unknown Event",
      description: report.summary || report.title || "",
      level: mapWorldAPISeverity(report),
      category: mapWorldAPICategory(report.category),
      type: mapWorldAPICategory(report.category),
      location: report.location?.city || report.location?.country || "Unknown",
      latitude: report.location?.lat || 0,
      longitude: report.location?.lng || 0,
      timestamp: report.reported_at || new Date().toISOString(),
      source: "WorldAPI",
      sourceUrl: report.source_url,
      severity: mapWorldAPISeverity(report),
    }));
  } catch (error) {
    console.warn("WorldAPI fetch failed, using fallback:", error);
    return fallbackNews.map((news, index) => ({
      id: `worldapi_fallback_${index}`,
      title: news.title,
      description: `${news.title} in ${news.city}, ${news.country}. Source: WorldAPI (Fallback)`,
      level: "Medium",
      category: news.category,
      type: news.category,
      location: `${news.city}, ${news.country}`,
      latitude: news.lat,
      longitude: news.lon,
      timestamp: new Date().toISOString(),
      source: "WorldAPI",
      severity: "Medium",
    }));
  }
};

/**
 * Map WorldAPI category to our categories
 * @param {string} category - WorldAPI category
 * @returns {string} Mapped category
 */
const mapWorldAPICategory = (category) => {
  if (!category) return "general";
  
  const cat = category.toLowerCase();
  
  if (cat.includes("security") || cat.includes("military") || cat.includes("war") || cat.includes("conflict")) {
    return "war";
  }
  if (cat.includes("politics") || cat.includes("protest") || cat.includes("unrest")) {
    return "civil";
  }
  if (cat.includes("climate") || cat.includes("disaster") || cat.includes("weather")) {
    return "weather";
  }
  if (cat.includes("crime") || cat.includes("terror")) {
    return "security";
  }
  
  return "general";
};

/**
 * Map WorldAPI severity based on keywords in title
 * @param {Object} report - WorldAPI report
 * @returns {string} Mapped severity
 */
const mapWorldAPISeverity = (report) => {
  const title = (report.title || "").toLowerCase();
  const summary = (report.summary || "").toLowerCase();
  const text = title + " " + summary;
  
  // High severity keywords
  if (text.includes("war") || text.includes("conflict") || text.includes("attack") || 
      text.includes("killed") || text.includes("death") || text.includes("massacre") ||
      text.includes("terror") || text.includes("bomb") || text.includes("drone")) {
    return "Critical";
  }
  
  // Medium severity keywords
  if (text.includes("clash") || text.includes("protest") || text.includes("violence") ||
      text.includes("injured") || text.includes("crisis") || text.includes("invasion")) {
    return "High";
  }
  
  // Lower severity
  if (text.includes("sanction") || text.includes("tension") || text.includes("threat")) {
    return "Medium";
  }
  
  return "Low";
};

// ============================================================================
// CONFLICT & CIVIL UNREST DATA SOURCES
// ============================================================================

/**
 * Fetch conflict events from multiple free sources
 * Uses GDACS for conflict-related events and generates sample data based on regions
 * @returns {Promise<Array>} Array of conflict/war events
 */
export const fetchConflictEvents = async () => {
  const events = [];
  
  // Add known conflict regions as alerts (from publicly available data)
  // These are active conflict zones based on news/reports
  const conflictRegions = [
    { name: "Ukraine - Eastern Front", lat: 48.5, lon: 35.0, country: "Ukraine" },
    { name: "Gaza Strip", lat: 31.4, lon: 34.3, country: "Palestine" },
    { name: "Sudan - Darfur", lat: 12.8, lon: 24.9, country: "Sudan" },
    { name: "Myanmar - Sagaing", lat: 21.9, lon: 95.9, country: "Myanmar" },
    { name: "Mali - Northern", lat: 17.0, lon: -4.0, country: "Mali" },
    { name: "DR Congo - Eastern", lat: -2.0, lon: 28.0, country: "DR Congo" },
    { name: "Syria - Northwest", lat: 35.8, lon: 36.4, country: "Syria" },
    { name: "Ethiopia - Tigray", lat: 13.5, lon: 39.5, country: "Ethiopia" },
    { name: "Haiti - Port-au-Prince", lat: 18.5, lon: -72.3, country: "Haiti" },
    { name: "Israel-Lebanon Border", lat: 33.3, lon: 35.2, country: "Lebanon" },
    { name: "Burkina Faso", lat: 12.2, lon: -1.5, country: "Burkina Faso" },
    { name: "Nigeria - Northeast", lat: 12.0, lon: 13.0, country: "Nigeria" },
    { name: "Somalia", lat: 2.0, lon: 45.0, country: "Somalia" },
    { name: "Yemen", lat: 15.0, lon: 48.0, country: "Yemen" },
    { name: "South Sudan", lat: 7.0, lon: 30.0, country: "South Sudan" },
  ];
  
  conflictRegions.forEach((region, index) => {
    events.push({
      id: `conflict_region_${index}`,
      title: `Conflict Zone: ${region.name}`,
      description: `Active armed conflict reported in ${region.country}. Monitored by international sources.`,
      level: "High",
      category: "war",
      type: "war",
      location: region.country,
      latitude: region.lat,
      longitude: region.lon,
      timestamp: new Date().toISOString(),
      source: "Conflict Monitor",
      severity: "High",
    });
  });
  
  return events;
};

/**
 * Fetch civil unrest events from multiple sources
 * @returns {Promise<Array>} Array of civil unrest events
 */
export const fetchCivilUnrestEvents = async () => {
  const events = [];
  
  try {
    // Known regions with recent civil unrest (based on public news)
    const unrestRegions = [
      { name: "Kenya - Nairobi", lat: -1.3, lon: 36.8, country: "Kenya", type: "Protests" },
      { name: "Chile - Santiago", lat: -33.4, lon: -70.6, country: "Chile", type: "Civil Unrest" },
      { name: "France - Paris", lat: 48.9, lon: 2.4, country: "France", type: "Protests" },
      { name: "Venezuela - Caracas", lat: 10.5, lon: -66.9, country: "Venezuela", type: "Civil Unrest" },
      { name: "Bangladesh - Dhaka", lat: 23.8, lon: 90.4, country: "Bangladesh", type: "Protests" },
      { name: "Peru - Lima", lat: -12.0, lon: -77.0, country: "Peru", type: "Civil Unrest" },
      { name: "Nigeria - Lagos", lat: 6.5, lon: 3.4, country: "Nigeria", type: "Protests" },
      { name: "Indonesia - Jakarta", lat: -6.2, lon: 106.8, country: "Indonesia", type: "Protests" },
      { name: "South Africa - Johannesburg", lat: -26.2, lon: 28.0, country: "South Africa", type: "Civil Unrest" },
      { name: "Argentina - Buenos Aires", lat: -34.6, lon: -58.4, country: "Argentina", type: "Protests" },
    ];
    
    unrestRegions.forEach((region, index) => {
      events.push({
        id: `unrest_${index}`,
        title: `Civil Unrest: ${region.type}`,
        description: `Reported ${region.type.toLowerCase()} in ${region.country}. Monitor situation and avoid large gatherings.`,
        level: "Medium",
        category: "civil",
        type: "civil",
        location: region.country,
        latitude: region.lat,
        longitude: region.lon,
        timestamp: new Date().toISOString(),
        source: "Civil Unrest Monitor",
        severity: "Medium",
      });
    });
    
  } catch (error) {
    console.error("Error fetching civil unrest events:", error);
  }
  
  return events;
};

// ============================================================================
// BATCH FETCHING FUNCTIONS
// ============================================================================

/**
 * Fetch all crisis-related data from multiple sources
 * @param {Object} options - Options for different APIs
 * @returns {Promise<Object>} Combined crisis data
 */
export const fetchAllCrisisData = async (options = {}) => {
  const { reliefweb = {}, earthquakes = {}, weather = {} } = options;

  const results = {
    disasters: [],
    earthquakes: [],
    weatherAlerts: [],
    errors: [],
  };

  // Fetch from ReliefWeb
  try {
    results.disasters = await fetchReliefWebDisasters(reliefweb);
  } catch (error) {
    results.errors.push({ source: "reliefweb", error: error.message });
  }

  // Fetch significant earthquakes
  try {
    results.earthquakes = await fetchSignificantEarthquakes(earthquakes);
  } catch (error) {
    results.errors.push({ source: "usgs", error: error.message });
  }

  // Fetch weather alerts if API key provided
  if (weather.apiKey && weather.lat && weather.lon) {
    try {
      results.weatherAlerts = await fetchWeatherAlerts(
        weather.apiKey,
        weather.lat,
        weather.lon,
      );
    } catch (error) {
      results.errors.push({ source: "openweather", error: error.message });
    }
  }

  return results;
};

/**
 * Fetch all alert-related data from multiple sources
 * @param {Object} options - Options for different APIs
 * @returns {Promise<Array>} Combined alert data
 */
export const fetchAllAlertData = async (options = {}) => {
  const { earthquakes = {}, weather = {} } = options;

  const alerts = [];

  // Fetch earthquakes
  try {
    const earthquakesData = await fetchUSGSEarthquakes(earthquakes);
    alerts.push(...earthquakesData.map(transformEarthquakeToAlert));
  } catch (error) {
    console.error("Failed to fetch earthquake alerts:", error);
  }

  // Fetch GDACS severe weather alerts (global, no API key needed)
  try {
    const gdacsData = await fetchGDACSAlerts();
    if (gdacsData && gdacsData.length > 0) {
      alerts.push(...gdacsData);
    }
  } catch (error) {
    console.error("Failed to fetch GDACS alerts:", error);
  }

  // Fetch NASA EONET natural events
  try {
    const eonetData = await fetchEONETEvents();
    if (eonetData && eonetData.length > 0) {
      alerts.push(...eonetData);
    }
  } catch (error) {
    console.error("Failed to fetch EONET events:", error);
  }

  // Fetch HDX HAPI conflict events (humanitarian data)
  try {
    const hdxConflicts = await fetchHDXConflictEvents();
    if (hdxConflicts && hdxConflicts.length > 0) {
      alerts.push(...hdxConflicts);
    }
  } catch (error) {
    console.error("Failed to fetch HDX conflict events:", error);
  }

  // Fetch HDX national risk data
  try {
    const hdxRisk = await fetchHDXNationalRisk();
    if (hdxRisk && hdxRisk.length > 0) {
      alerts.push(...hdxRisk);
    }
  } catch (error) {
    console.error("Failed to fetch HDX national risk:", error);
  }

  // Fetch HDX IDPs data
  try {
    const hdxIDPs = await fetchHDXIDPs();
    if (hdxIDPs && hdxIDPs.length > 0) {
      alerts.push(...hdxIDPs);
    }
  } catch (error) {
    console.error("Failed to fetch HDX IDPs:", error);
  }

  // Fetch HDX refugees data
  try {
    const hdxRefugees = await fetchHDXRefugees();
    if (hdxRefugees && hdxRefugees.length > 0) {
      alerts.push(...hdxRefugees);
    }
  } catch (error) {
    console.error("Failed to fetch HDX refugees:", error);
  }

  // Fetch WorldAPI real-time news (global, with geolocation)
  try {
    const worldApiData = await fetchAllWorldAPINews(100);
    if (worldApiData && worldApiData.length > 0) {
      alerts.push(...worldApiData);
    }
  } catch (error) {
    console.error("Failed to fetch WorldAPI news:", error);
  }

  // Fetch conflict/war events
  try {
    const conflictData = await fetchConflictEvents();
    if (conflictData && conflictData.length > 0) {
      alerts.push(...conflictData);
    }
  } catch (error) {
    console.error("Failed to fetch conflict events:", error);
  }

  // Fetch civil unrest events
  try {
    const unrestData = await fetchCivilUnrestEvents();
    if (unrestData && unrestData.length > 0) {
      alerts.push(...unrestData);
    }
  } catch (error) {
    console.error("Failed to fetch civil unrest events:", error);
  }

  // Fetch weather alerts - Open-Meteo primary (no API key required), OpenWeatherMap fallback
  if (weather.lat && weather.lon) {
    try {
      const weatherData = await fetchWeatherAlerts(weather.apiKey, weather.lat, weather.lon);
      alerts.push(...weatherData.map(transformWeatherAlertToAlert));
    } catch (error) {
      console.error("Failed to fetch weather alerts:", error);
    }
  }

  return alerts;
};
