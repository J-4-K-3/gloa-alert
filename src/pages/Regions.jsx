import { motion, AnimatePresence } from "framer-motion";
import {
  FiGlobe,
  FiAlertTriangle,
  FiUsers,
  FiTrendingUp,
  FiMapPin,
  FiX,
  FiShield,
  FiActivity,
  FiClock,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import {
  databases,
  APPWRITE_DATABASE_ID,
  COLLECTION_REGIONS_ID,
  Query,
} from "../lib/Appwrite";
import {
  fetchHDXConflictEvents,
  fetchEONETEvents,
  fetchHDXNationalRisk,
} from "../lib/fetchApi.js";

const Regions = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("risk_level");
  const [filterType, setFilterType] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);

        // Fetch Appwrite regions (existing)
        const appwriteQueries = [];
        if (filterType !== "all") {
          appwriteQueries.push(Query.equal("type", filterType));
        }
        switch (sortBy) {
          case "risk_level":
            appwriteQueries.push(Query.orderDesc("risk_level"));
            break;
          case "alerts":
            appwriteQueries.push(Query.orderDesc("active_alerts_count"));
            break;
          case "population":
            appwriteQueries.push(Query.orderDesc("population"));
            break;
          case "name":
            appwriteQueries.push(Query.orderAsc("name"));
            break;
          default:
            appwriteQueries.push(Query.orderDesc("risk_level"));
        }

        const appwriteResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          COLLECTION_REGIONS_ID,
          appwriteQueries,
        );

        // Transform Appwrite regions
        let appwriteRegions = appwriteResponse.documents.map((region) => ({
          id: `appwrite_${region.$id}`,
          name: region.name,
          code: region.code,
          type: region.type,
          riskLevel: getRiskLevelLabel(region.risk_level),
          riskLevelNum: region.risk_level || 3,
          activeAlerts: region.active_alerts_count || 0,
          activeCrises: region.active_crises_count || 0,
          population: formatPopulation(region.population || 0),
          populationNum: region.population || 0,
          area: region.area || 0,
          description: region.description || `${region.name} region overview`,
          flagEmoji: getFlagEmoji(region.code, region.name),
          lastUpdated: region.last_updated
            ? new Date(region.last_updated).toLocaleDateString()
            : "Recently",
          source: "Appwrite",
        }));

        // Fetch API data for regions (HDX + EONET only, ReliefWeb removed)
        const [hdxConflicts, eonetEvents] = await Promise.allSettled([
          fetchHDXConflictEvents(),
          fetchEONETEvents(30, 50),
        ]);

        let apiRegions = [];

        // Transform HDX conflicts to regions - use eventType for accurate typing
        if (hdxConflicts.status === "fulfilled") {
          hdxConflicts.value.forEach((conflict) => {
            const eventType = conflict.eventType || "Conflict Zone";
            apiRegions.push({
              id: `hdx_${conflict.id}`,
              name: conflict.location,
              code: null,
              type: eventType.toLowerCase().replace(/\s+/g, "_"),
              riskLevel: conflict.level || conflict.risk_level || "High Risk",
              riskLevelNum: conflict.risk_level_num || 2,
              activeAlerts: 1,
              activeCrises: 1,
              population: getCountryPopulation(conflict.location) || "N/A",
              populationNum: getCountryPopulationNum(conflict.location) || 0,
              area: 0,
              description: conflict.description || conflict.title,
              flagEmoji: getFlagEmoji(null, conflict.location),
              lastUpdated: new Date().toLocaleDateString(),
              source: "HDX",
            });
          });
        }

        // Transform EONET natural events to regions - detect location type and style differently
        if (eonetEvents.status === "fulfilled") {
          eonetEvents.value.forEach((event) => {
            const locationName =
              event.country || event.location || "Unknown Area";
            const isCountry =
              event.country &&
              !event.location?.includes(",") &&
              !event.location?.match(/,/);
            const eventCategory = event.eventCategory || "affected_area";
            apiRegions.push({
              id: `eonet_${event.id}`,
              name: locationName,
              code: isCountry ? event.country_code : null,
              type: eventCategory.toLowerCase().replace(/\s+/g, "_"),
              riskLevel: event.level || event.risk_level || "Medium Risk",
              riskLevelNum: event.risk_level_num || 3,
              activeAlerts: 1,
              activeCrises: 0,
              population: isCountry
                ? getCountryPopulation(event.country || event.location) || "N/A"
                : "Local Area",
              populationNum: isCountry
                ? getCountryPopulationNum(event.country || event.location) || 0
                : 0,
              area: 0,
              description: event.description || event.title,
              flagEmoji: isCountry
                ? getFlagEmoji(event.country_code, event.country)
                : "🌍",
              lastUpdated: new Date().toLocaleDateString(),
              source: "NASA EONET",
              isCountry: isCountry,
            });
          });
        }

        // Transform HDX conflicts to regions
        if (hdxConflicts.status === "fulfilled") {
          hdxConflicts.value.forEach((conflict) => {
            apiRegions.push({
              id: `hdx_${conflict.id}`,
              name: conflict.location,
              code: null,
              type: "conflict_zone",
              riskLevel: conflict.level || "High",
              riskLevelNum: 2,
              activeAlerts: 1,
              activeCrises: 1,
              population: getCountryPopulation(conflict.location) || "N/A",
              populationNum: getCountryPopulationNum(conflict.location) || 0,
              area: 0,
              description: conflict.description || conflict.title,
              flagEmoji: getFlagEmoji(null, conflict.location),
              lastUpdated: new Date().toLocaleDateString(),
              source: "HDX",
            });
          });
        }

        // Transform EONET natural events to regions
        if (eonetEvents.status === "fulfilled") {
          eonetEvents.value.forEach((event) => {
            apiRegions.push({
              id: `eonet_${event.id}`,
              name: event.country || event.location || "Unknown Region",
              code: null,
              type: "affected_area",
              riskLevel: event.level || "Medium",
              riskLevelNum: 3,
              activeAlerts: 1,
              activeCrises: 0,
              population:
                getCountryPopulation(event.country || event.location) || "N/A",
              populationNum:
                getCountryPopulationNum(event.country || event.location) || 0,
              area: 0,
              description: event.description || event.title,
              flagEmoji: getFlagEmoji(null, event.country || event.location),
              lastUpdated: new Date().toLocaleDateString(),
              source: "NASA EONET",
            });
          });
        }

        // Combine and deduplicate Appwrite + API regions
        const allRegions = [...appwriteRegions, ...apiRegions];

        // Deduplicate by name (keep first occurrence, prefer Appwrite)
        const seenNames = new Set();
        const uniqueRegions = allRegions.filter((region) => {
          if (seenNames.has(region.name)) return false;
          seenNames.add(region.name);
          return true;
        });

        setRegions(uniqueRegions);
      } catch (err) {
        console.error("Error fetching regions:", err);
        setError("Failed to load regional data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, [sortBy, filterType]);

  // Helper function to convert risk level number to label
  const getRiskLevelLabel = (level) => {
    switch (level) {
      case 1:
        return "Critical";
      case 2:
        return "High";
      case 3:
        return "Moderate";
      case 4:
        return "Low";
      default:
        return "Unknown";
    }
  };

  // Helper function to format population numbers
  const formatPopulation = (population) => {
    if (population >= 1000000000) {
      return `${(population / 1000000000).toFixed(1)}B`;
    } else if (population >= 1000000) {
      return `${(population / 1000000).toFixed(1)}M`;
    } else if (population >= 1000) {
      return `${(population / 1000).toFixed(1)}K`;
    }
    return population.toString();
  };

  const getRiskColor = (level) => {
    if (!level) return "var(--text-secondary)";
    const l = level.toString().toLowerCase();
    if (l.includes("critical")) return "var(--alert-critical)";
    if (l.includes("high")) return "var(--alert-high)";
    if (l.includes("moderate") || l.includes("medium"))
      return "var(--alert-medium)";
    if (l.includes("low")) return "var(--alert-info)";
    return "var(--text-secondary)";
  };

  // Helper function to get background color based on risk level
  const getRiskBackgroundColor = (level) => {
    if (!level) return "rgba(255, 255, 255, 0.05)";
    const l = level.toString().toLowerCase();
    if (l.includes("critical")) return "rgba(220, 53, 69, 0.15)";
    if (l.includes("high")) return "rgba(255, 193, 7, 0.15)";
    if (l.includes("moderate") || l.includes("medium"))
      return "rgba(255, 152, 0, 0.15)";
    if (l.includes("low")) return "rgba(23, 162, 184, 0.15)";
    return "rgba(255, 255, 255, 0.05)";
  };

  const getDetailedDescription = (region) => {
    const base = region.description || `${region.name} region overview`;
    if (base.split(" ").length >= 20) return base;

    const typeLabel = region.type ? region.type.replace(/_/g, " ") : "region";
    const riskContext =
      region.riskLevel === "Critical"
        ? "currently exhibits severe threat indicators and requires immediate humanitarian and security attention"
        : region.riskLevel === "High"
          ? "demonstrates significant security and stability concerns across multiple sectors requiring close monitoring"
          : region.riskLevel === "Moderate"
            ? "maintains manageable but present risk factors that necessitate ongoing surveillance and situational awareness"
            : "remains relatively stable with minimal documented threat levels at this time under current observation parameters";

    const enhanced = `${base}. This ${typeLabel} ${riskContext}.`;
    return enhanced;
  };

  // Helper function to get country population data (local lookup for speed)
  const COUNTRY_POPULATIONS = {
    Ukraine: { formatted: "41M", num: 41000000 },
    Syria: { formatted: "22M", num: 22000000 },
    Yemen: { formatted: "33M", num: 33000000 },
    Myanmar: { formatted: "54M", num: 54000000 },
    Ethiopia: { formatted: "123M", num: 123000000 },
    Sudan: { formatted: "47M", num: 47000000 },
    Mali: { formatted: "23M", num: 23000000 },
    "DR Congo": { formatted: "102M", num: 102000000 },
    Haiti: { formatted: "11M", num: 11000000 },
    Nigeria: { formatted: "224M", num: 224000000 },
    Somalia: { formatted: "17M", num: 17000000 },
    Iraq: { formatted: "45M", num: 45000000 },
    Libya: { formatted: "7M", num: 7000000 },
    "South Sudan": { formatted: "11M", num: 11000000 },
    "Burkina Faso": { formatted: "23M", num: 23000000 },
    Afghanistan: { formatted: "41M", num: 41000000 },
    // Add more countries as needed
  };

  const getCountryPopulation = (countryName) => {
    if (!countryName) return null;
    const normalizedName = countryName.split(",")[0].trim(); // Take first part
    return COUNTRY_POPULATIONS[normalizedName]?.formatted || "N/A";
  };

  const getCountryPopulationNum = (countryName) => {
    if (!countryName) return 0;
    const normalizedName = countryName.split(",")[0].trim();
    return COUNTRY_POPULATIONS[normalizedName]?.num || 0;
  };

  // Helper function to get flag emoji from country code or name
  const getFlagEmoji = (countryCode, countryName) => {
    // Try flagcdn first - reliable flag images
    if (countryCode && countryCode.length === 2) {
      const normalizedCode = countryCode.toLowerCase();
      const flagUrl = `https://flagcdn.com/w40/${normalizedCode}.png`;

      // Pre-check if flag exists (optional - img onerror handles gracefully)
      const img = new Image();
      img.src = flagUrl;

      return flagUrl;
    }

    // Fallback emoji map (backup)
    // Country code to flag emoji mapping (ISO 3166-1 alpha-2) - keeping as backup
    const flagMap = {
      AF: "🇦🇫",
      AL: "🇦🇱",
      DZ: "🇩🇿",
      AS: "🇦🇸",
      AD: "🇦🇩",
      AO: "🇦🇴",
      AI: "🇦🇮",
      AQ: "🇦🇶",
      AG: "🇦🇬",
      AR: "🇦🇷",
      AM: "🇦🇲",
      AW: "🇦🇼",
      AU: "🇦🇺",
      AT: "🇦🇹",
      AZ: "🇦🇿",
      BS: "🇧🇸",
      BH: "🇧🇭",
      BD: "🇧🇩",
      BB: "🇧🇧",
      BY: "🇧🇾",
      BE: "🇧🇪",
      BZ: "🇧🇿",
      BJ: "🇧🇯",
      BM: "🇧🇲",
      BT: "🇧🇹",
      BO: "🇧🇴",
      BA: "🇧🇦",
      BW: "🇧🇼",
      BR: "🇧🇷",
      BN: "🇧🇳",
      BG: "🇧🇬",
      BF: "🇧🇫",
      BI: "🇧🇮",
      KH: "🇰🇭",
      CM: "🇨🇲",
      CA: "🇨🇦",
      CV: "🇨🇻",
      KY: "🇰🇾",
      CF: "🇨🇫",
      TD: "🇹🇩",
      CL: "🇨🇱",
      CN: "🇨🇳",
      CO: "🇨🇴",
      KM: "🇰🇲",
      CG: "🇨🇬",
      CD: "🇨🇩",
      CK: "🇨🇰",
      CR: "🇨🇷",
      CI: "🇨🇮",
      HR: "🇭🇷",
      CU: "🇨🇺",
      CY: "🇨🇾",
      CZ: "🇨🇿",
      DK: "🇩🇰",
      DJ: "🇩🇯",
      DM: "🇩🇲",
      DO: "🇩🇴",
      EC: "🇪🇨",
      EG: "🇪🇬",
      SV: "🇸🇻",
      GQ: "🇬🇶",
      ER: "🇪🇷",
      EE: "🇪🇪",
      ET: "🇪🇹",
      FK: "🇫🇰",
      FO: "🇫🇴",
      FJ: "🇫🇯",
      FI: "🇫🇮",
      FR: "🇫🇷",
      GA: "🇬🇦",
      GM: "🇬🇲",
      GE: "🇬🇪",
      DE: "🇩🇪",
      GH: "🇬🇭",
      GI: "🇬🇮",
      GR: "🇬🇷",
      GL: "🇬🇱",
      GD: "🇬🇩",
      GU: "🇬🇺",
      GT: "🇬🇹",
      GG: "🇬🇬",
      GN: "🇬🇳",
      GW: "🇬🇼",
      GY: "🇬🇾",
      HT: "🇭🇹",
      HN: "🇭🇳",
      HK: "🇭🇰",
      HU: "🇭🇺",
      IS: "🇮🇸",
      IN: "🇮🇳",
      ID: "🇮🇩",
      IR: "🇮🇷",
      IQ: "🇮🇶",
      IE: "🇮🇪",
      IM: "🇮🇲",
      IL: "🇮🇱",
      IT: "🇮🇹",
      JM: "🇯🇲",
      JP: "🇯🇵",
      JE: "🇯🇪",
      JO: "🇯🇴",
      KZ: "🇰🇿",
      KE: "🇰🇪",
      KI: "🇰🇮",
      KP: "🇰🇵",
      KR: "🇰🇷",
      KW: "🇰🇼",
      KG: "🇰🇬",
      LA: "🇱🇦",
      LV: "🇱🇻",
      LB: "🇱🇧",
      LS: "🇱🇸",
      LR: "🇱🇷",
      LY: "🇱🇾",
      LI: "🇱🇮",
      LT: "🇱🇹",
      LU: "🇱🇺",
      MO: "🇲🇴",
      MK: "🇲🇰",
      MG: "🇲🇬",
      MW: "🇲🇼",
      MY: "🇲🇾",
      MV: "🇲🇻",
      ML: "🇲🇱",
      MT: "🇲🇹",
      MH: "🇲🇭",
      MR: "🇲🇷",
      MU: "🇲🇺",
      MX: "🇲🇽",
      FM: "🇫🇲",
      MD: "🇲🇩",
      MC: "🇲🇨",
      MN: "🇲🇳",
      ME: "🇲🇪",
      MS: "🇲🇸",
      MA: "🇲🇦",
      MZ: "🇲🇴",
      MM: "🇲🇲",
      NA: "🇳🇦",
      NR: "🇳🇷",
      NP: "🇳🇵",
      NL: "🇳🇱",
      NC: "🇳🇨",
      NZ: "🇳🇿",
      NI: "🇳🇮",
      NE: "🇳🇪",
      NG: "🇳🇬",
      NU: "🇳🇺",
      NF: "🇳🇫",
      MP: "🇲🇵",
      NO: "🇳🇴",
      OM: "🇴🇲",
      PK: "🇵🇰",
      PW: "🇵🇼",
      PS: "🇵🇸",
      PA: "🇵🇦",
      PG: "🇵🇬",
      PY: "🇵🇾",
      PE: "🇵🇪",
      PH: "🇵🇭",
      PN: "🇵🇳",
      PL: "🇵🇱",
      PT: "🇵🇹",
      PR: "🇵🇷",
      QA: "🇶🇦",
      RO: "🇷🇴",
      RU: "🇷🇺",
      RW: "🇷🇼",
      WS: "🇼🇸",
      SM: "🇸🇲",
      ST: "🇸🇹",
      SA: "🇸🇦",
      SN: "🇸🇳",
      RS: "🇷🇸",
      SC: "🇸🇨",
      SL: "🇸🇱",
      SG: "🇸🇬",
      SX: "🇸🇽",
      SK: "🇸🇰",
      SI: "🇸🇮",
      SB: "🇸🇧",
      SO: "🇸🇴",
      ZA: "🇿🇦",
      SS: "🇸🇸",
      ES: "🇪🇸",
      LK: "🇱🇰",
      SD: "🇸🇩",
      SR: "🇸🇷",
      SZ: "🇸🇿",
      SE: "🇸🇪",
      CH: "🇨🇭",
      SY: "🇸🇾",
      TW: "🇹🇼",
      TJ: "🇹🇯",
      TZ: "🇹🇿",
      TH: "🇹🇭",
      TL: "🇹🇱",
      TG: "🇹🇬",
      TK: "🇹🇰",
      TO: "🇹🇴",
      TT: "🇹🇹",
      TN: "🇹🇳",
      TR: "🇹🇷",
      TM: "🇹🇲",
      TC: "🇹🇨",
      TV: "🇹🇻",
      UG: "🇺🇬",
      UA: "🇺🇦",
      AE: "🇦🇪",
      GB: "🇬🇧",
      US: "🇺🇸",
      UY: "🇺🇾",
      UZ: "🇺🇿",
      VU: "🇻🇺",
      VA: "🇻🇦",
      VE: "🇻🇪",
      VN: "🇻🇳",
      VG: "🇻🇬",
      VI: "🇻🇮",
      WF: "🇼🇫",
      EH: "🇪🇭",
      YE: "🇾🇪",
      ZM: "🇿🇲",
      ZW: "🇿🇼",
    };

    // Try to normalize and extract a valid 2-letter country code
    let normalizedCode = null;

    if (countryCode) {
      // Convert to string if not already
      const codeStr = String(countryCode).trim();

      // If it's exactly 2 characters, use it directly
      if (codeStr.length === 2) {
        normalizedCode = codeStr.toLowerCase();
      }
      // If it's 3 characters (ISO 3166-1 alpha-3), convert to alpha-2
      else if (codeStr.length === 3) {
        // Common 3-letter to 2-letter code mappings
        const alpha3ToAlpha2 = {
          USA: "us",
          GBR: "gb",
          DEU: "de",
          FRA: "fr",
          ITA: "it",
          ESP: "es",
          JPN: "jp",
          CHN: "cn",
          RUS: "ru",
          BRA: "br",
          IND: "in",
          MEX: "mx",
          CAN: "ca",
          AUS: "au",
          KOR: "kr",
          NLD: "nl",
          BEL: "be",
          CHE: "ch",
          SWE: "se",
          NOR: "no",
          DNK: "dk",
          FIN: "fi",
          POL: "pl",
          UKR: "ua",
          TUR: "tr",
          ISR: "il",
          SAU: "sa",
          ARE: "ae",
          EGY: "eg",
          ZAF: "za",
          NGA: "ng",
          KEN: "ke",
          ETH: "et",
          GHA: "gh",
          ARG: "ar",
          CHL: "cl",
          COL: "co",
          PER: "pe",
          VEN: "ve",
          CUB: "ht",
          DOM: "do",
          THA: "th",
          VNM: "vn",
          PHL: "ph",
          IDN: "id",
          MYS: "my",
          SGP: "sg",
          PAK: "pk",
          BGD: "bd",
          IRN: "iq",
          IRQ: "iq",
          SYR: "sy",
          JOR: "jo",
          LBN: "lb",
          AFG: "af",
          KAZ: "kz",
          UZB: "uz",
          TKM: "tm",
          TJK: "tj",
          KGZ: "kg",
          MNG: "mn",
          PRK: "kp",
          MMR: "mm",
          KHM: "kh",
          LAO: "la",
          LKA: "lk",
          NPL: "np",
          BTN: "bt",
          MDV: "mv",
          BRN: "bn",
          TLS: "tl",
          NZL: "nz",
          FJI: "fj",
          PNG: "pg",
          SLB: "sb",
          VUT: "vu",
          WSM: "ws",
          TON: "to",
          KIR: "ki",
          TUV: "tv",
          NRU: "nr",
          MHL: "mh",
          PLW: "pw",
          FSM: "fm",
        };
        normalizedCode = alpha3ToAlpha2[codeStr.toUpperCase()] || null;
      }

      // If we have a valid 2-letter code, return the flagcdn URL
      if (normalizedCode) {
        return `https://flagcdn.com/w40/${normalizedCode}.png`;
      }
    }

    // Fallback to name-based mapping for common countries
    const nameToCodeMap = {
      "United States": "us",
      USA: "us",
      America: "us",
      "United States of America": "us",
      "United Kingdom": "gb",
      UK: "gb",
      Britain: "gb",
      England: "gb",
      Scotland: "gb",
      Wales: "gb",
      Russia: "ru",
      "Russian Federation": "ru",
      China: "cn",
      "People's Republic of China": "cn",
      PRC: "cn",
      Japan: "jp",
      Germany: "de",
      France: "fr",
      Italy: "it",
      Spain: "es",
      Canada: "ca",
      Australia: "au",
      Brazil: "br",
      India: "in",
      Mexico: "mx",
      "South Korea": "kr",
      Netherlands: "nl",
      Belgium: "be",
      Switzerland: "ch",
      Sweden: "se",
      Norway: "no",
      Denmark: "dk",
      Finland: "fi",
      Poland: "pl",
      Ukraine: "ua",
      Turkey: "tr",
      Israel: "il",
      "Saudi Arabia": "sa",
      UAE: "ae",
      Egypt: "eg",
      "South Africa": "za",
      Nigeria: "ng",
      Kenya: "ke",
      Ethiopia: "et",
      Ghana: "gh",
      Argentina: "ar",
      Chile: "cl",
      Colombia: "co",
      Peru: "pe",
      Venezuela: "ve",
      Cuba: "cu",
      Haiti: "ht",
      "Dominican Republic": "do",
      Thailand: "th",
      Vietnam: "vn",
      Philippines: "ph",
      Indonesia: "id",
      Malaysia: "my",
      Singapore: "sg",
      Pakistan: "pk",
      Bangladesh: "bd",
      Iran: "ir",
      Iraq: "iq",
      Syria: "sy",
      Jordan: "jo",
      Lebanon: "lb",
      Afghanistan: "af",
      Kazakhstan: "kz",
      Uzbekistan: "uz",
      Turkmenistan: "tm",
      Tajikistan: "tj",
      Kyrgyzstan: "kg",
      Mongolia: "mn",
      "North Korea": "kp",
      Myanmar: "mm",
      Cambodia: "kh",
      Laos: "la",
      "Sri Lanka": "lk",
      Nepal: "np",
      Bhutan: "bt",
      Maldives: "mv",
      Brunei: "bn",
      "East Timor": "tl",
      "New Zealand": "nz",
      Fiji: "fj",
      "Papua New Guinea": "pg",
      "Solomon Islands": "sb",
      Vanuatu: "vu",
      Samoa: "ws",
      Tonga: "to",
      Kiribati: "ki",
      Tuvalu: "tv",
      Nauru: "nr",
      "Marshall Islands": "mh",
      Palau: "pw",
      Micronesia: "fm",
      "Northern Mariana Islands": "mp",
      Guam: "gu",
      "American Samoa": "as",
      "Cook Islands": "ck",
      Niue: "nu",
      Tokelau: "tk",
      "French Polynesia": "pf",
      "New Caledonia": "nc",
      "Wallis and Futuna": "wf",
      "Pitcairn Islands": "pn",
      "Norfolk Island": "nf",
      "Christmas Island": "cx",
      "Cocos Islands": "cc",
      "Heard Island": "hm",
      "Macquarie Island": "au",
      Antarctica: "aq",
      "Bouvet Island": "bv",
      "South Georgia": "gs",
      "Falkland Islands": "fk",
      "South Sandwich Islands": "gs",
      "Tristan da Cunha": "sh",
      "Saint Helena": "sh",
      "Ascension Island": "sh",
      "Gough Island": "gb",
      "Inaccessible Island": "gb",
      "Nightingale Island": "gb",
      "Amsterdam Island": "nl",
      "Saint-Paul Island": "re",
      "Kerguelen Islands": "tf",
      "Crozet Islands": "tf",
      "Terre Adélie": "aq",
      "Ross Dependency": "aq",
    };

    // Try to match by country name
    if (countryName) {
      const nameStr = String(countryName).trim();

      // Check exact match first
      if (nameToCodeMap[nameStr]) {
        return `https://flagcdn.com/w40/${nameToCodeMap[nameStr]}.png`;
      }

      // Check partial match for common names
      for (const [name, code] of Object.entries(nameToCodeMap)) {
        if (
          nameStr.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(nameStr.toLowerCase())
        ) {
          return `https://flagcdn.com/w40/${code}.png`;
        }
      }
    }

    // Final fallback to emoji - check if we have a 2-char code in our map
    if (
      countryCode &&
      typeof countryCode === "string" &&
      countryCode.length === 2
    ) {
      const upperCode = countryCode.toUpperCase();
      if (flagMap[upperCode]) {
        return flagMap[upperCode];
      }
    }

    // Default globe emoji for unknown regions
    return "🌍";
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
        <div>Loading regional data...</div>
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
      style={{ paddingTop: "140px", paddingBottom: "40px" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1
            className="text-gradient"
            style={{ marginBottom: "1rem", fontSize: "3rem" }}
          >
            Regional Overview
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              marginBottom: "2rem",
            }}
          >
            Geographic breakdown of global risk levels and active alerts
          </p>
        </motion.div>

        {/* Filter and Sort Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
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
            View Options:
          </span>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <label
              style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
            >
              Sort:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "0.5rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.5rem",
                color: "white",
              }}
            >
              <option value="risk_level">Risk Level</option>
              <option value="alerts">Active Alerts</option>
              <option value="population">Population</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <label
              style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}
            >
              Filter:
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
              <option value="all">All Regions</option>
              <option value="continent">Continents</option>
              <option value="country">Countries</option>
              <option value="subregion">Subregions</option>
            </select>
          </div>

          <div
            style={{
              marginLeft: "auto",
              fontSize: "0.9rem",
              color: "var(--text-secondary)",
            }}
          >
            {regions.length} region{regions.length !== 1 ? "s" : ""} found
          </div>
        </motion.div>

        {/* Risk Level Legend */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card glass"
          style={{ marginBottom: "2rem", padding: "1.5rem" }}
        >
          <h3
            style={{
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            Risk Level Legend
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {[
              { label: "Critical Risk", color: "var(--alert-critical)" },
              { label: "High Risk", color: "var(--alert-high)" },
              { label: "Moderate Risk", color: "var(--alert-medium)" },
              { label: "Low Risk", color: "var(--alert-info)" },
            ].map((item, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: item.color,
                    borderRadius: "50%",
                    boxShadow: `0 0 8px ${item.color}40`,
                  }}
                />
                <span style={{ fontSize: "0.9rem" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {regions.length === 0 ? (
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
            <FiGlobe
              style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}
            />
            <h3>No regions found</h3>
            <p>Check your filter criteria or try again later.</p>
          </motion.div>
        ) : (
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {regions.map((region, index) => (
              <motion.div
                key={region.id}
                className="card glass"
                style={{
                  background: getRiskBackgroundColor(region.riskLevel),
                  border: `1px solid ${getRiskColor(region.riskLevel)}40`,
                }}
                whileHover={{ scale: 1.02, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.4rem" }}>
                      {region.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        textTransform: "capitalize",
                        background: region.isCountry
                          ? "transparent"
                          : "rgba(255,255,255,0.1)",
                        padding: region.isCountry ? "0" : "0.2rem 0.4rem",
                        borderRadius: region.isCountry ? "0" : "0.3rem",
                      }}
                    >
                      {region.type}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: getRiskColor(region.riskLevel),
                      borderRadius: "50%",
                      boxShadow: `0 0 8px ${getRiskColor(region.riskLevel)}60`,
                    }}
                  />
                  <span
                    style={{
                      fontWeight: 600,
                      color: getRiskColor(region.riskLevel),
                    }}
                  >
                    {region.riskLevel} Risk
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FiGlobe style={{ color: "var(--accent-color)" }} />
                    <div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Source
                      </div>
                      <div style={{ fontWeight: 600 }}>{region.source}</div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FiUsers style={{ color: "var(--accent-color)" }} />
                    <div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Population
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          opacity: region.isCountry ? 1 : 0.6,
                        }}
                      >
                        {region.population}
                      </div>
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                    lineHeight: "1.4",
                    marginBottom: "1rem",
                  }}
                >
                  {getDetailedDescription(region)}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>Updated: {region.lastUpdated}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedRegion(region);
                    }}
                    style={{
                      padding: "0.4rem 0.8rem",
                      fontSize: "0.8rem",
                      background: "var(--accent-color)",
                      border: "none",
                      borderRadius: "0.4rem",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    View Details
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Regional Intelligence Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="card glass"
          style={{ marginTop: "3rem", padding: "2rem" }}
        >
          <h3
            style={{
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            Regional Intelligence
          </h3>
          <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
            Our regional analysis combines satellite monitoring, news
            aggregation, government reports, and community intelligence to
            provide accurate risk assessments. Each region's risk level is
            updated in real-time based on verified threat intelligence and
            global events.
          </p>
        </motion.div>

        {/* Region Detail Modal */}
        <AnimatePresence>
          {selectedRegion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRegion(null)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.8)",
                backdropFilter: "blur(8px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
                padding: "1rem",
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="card glass"
                style={{
                  maxWidth: "600px",
                  width: "100%",
                  padding: "1.5rem",
                  position: "relative",
                  background: getRiskBackgroundColor(selectedRegion.riskLevel),
                  border: `1px solid ${getRiskColor(selectedRegion.riskLevel)}40`,
                }}
              >
                <button
                  onClick={() => setSelectedRegion(null)}
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    background: "none",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                  }}
                >
                  <FiX />
                </button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div style={{ fontSize: "2.25rem" }}>
                    {typeof selectedRegion.flagEmoji === "string" &&
                    selectedRegion.flagEmoji.startsWith("http") ? (
                      <img
                        src={selectedRegion.flagEmoji}
                        alt=""
                        style={{ width: "48px", borderRadius: "4px" }}
                      />
                    ) : (
                      selectedRegion.flagEmoji
                    )}
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "1.5rem" }}>{selectedRegion.name}</h2>
                    <span
                      style={{
                        color: "var(--text-secondary)",
                        textTransform: "capitalize",
                      }}
                    >
                      {selectedRegion.type?.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "0.75rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div
                    className="card"
                    style={{
                      padding: "0.75rem",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                        color: getRiskColor(selectedRegion.riskLevel),
                      }}
                    >
                      <FiShield />{" "}
                      <span style={{ fontWeight: 600 }}>Risk Level</span>
                    </div>
                    <div style={{ fontSize: "0.95rem" }}>
                      {selectedRegion.riskLevel}
                    </div>
                  </div>

                  <div
                    className="card"
                    style={{
                      padding: "0.75rem",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                        color: "var(--accent-color)",
                      }}
                    >
                      <FiUsers />{" "}
                      <span style={{ fontWeight: 600 }}>Population</span>
                    </div>
                    <div style={{ fontSize: "0.95rem" }}>
                      {selectedRegion.population}
                    </div>
                  </div>

                  <div
                    className="card"
                    style={{
                      padding: "0.75rem",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                        color: "var(--accent-color)",
                      }}
                    >
                      <FiActivity />{" "}
                      <span style={{ fontWeight: 600 }}>Alerts</span>
                    </div>
                    <div style={{ fontSize: "0.95rem" }}>
                      {selectedRegion.activeAlerts} Active
                    </div>
                  </div>

                  <div
                    className="card"
                    style={{
                      padding: "0.75rem",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem",
                        color: "var(--accent-color)",
                      }}
                    >
                      <FiClock />{" "}
                      <span style={{ fontWeight: 600 }}>Last Updated</span>
                    </div>
                    <div style={{ fontSize: "0.95rem" }}>
                      {selectedRegion.lastUpdated}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <h4 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>Detailed Analysis</h4>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      lineHeight: "1.5",
                      fontSize: "0.875rem",
                    }}
                  >
                    {getDetailedDescription(selectedRegion)}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <strong>Source:</strong> {selectedRegion.source}
                  </div>
                  {selectedRegion.code && (
                    <div
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      <strong>Region Code:</strong> {selectedRegion.code}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Regions;

