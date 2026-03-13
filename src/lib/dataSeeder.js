// dataSeeder.js - Script to seed Appwrite database with external API data
// Run this periodically to keep your database populated with real data

import {
  fetchReliefWebDisasters,
  fetchUSGSEarthquakes,
  fetchWeatherAlerts,
  transformDisasterToCrisis,
  transformEarthquakeToAlert,
} from "./fetchApi.js";
import {
  databases,
  APPWRITE_DATABASE_ID,
  COLLECTION_CRISES_ID,
  COLLECTION_ALERTS_ID,
  Query,
} from "./Appwrite-node.js";

/**
 * Seed crises collection with ReliefWeb disaster data
 */
export const seedCrisesFromReliefWeb = async () => {
  try {
    console.log("Fetching disasters from ReliefWeb...");
    const disasters = await fetchReliefWebDisasters({
      limit: 100,
      status: "current", // Only active disasters
    });

    console.log(`Found ${disasters.length} disasters. Processing...`);

    for (const disaster of disasters) {
      try {
        // Check if this disaster already exists
        const existing = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          COLLECTION_CRISES_ID,
          [`title=${disaster.title}`], // This is a simple check, you might want more sophisticated deduplication
        );

        if (existing.documents.length === 0) {
          // Transform and save to Appwrite
          const crisisData = transformDisasterToCrisis(disaster);

          await databases.createDocument(
            APPWRITE_DATABASE_ID,
            COLLECTION_CRISES_ID,
            "unique()", // Let Appwrite generate ID
            crisisData,
          );

          console.log(`✓ Added crisis: ${disaster.title}`);
        } else {
          console.log(`- Skipped duplicate: ${disaster.title}`);
        }
      } catch (error) {
        console.error(`✗ Failed to save disaster ${disaster.title}:`, error);
      }
    }

    console.log("Crises seeding completed!");
  } catch (error) {
    console.error("Error seeding crises:", error);
  }
};

/**
 * Seed alerts collection with earthquake data
 */
export const seedAlertsFromEarthquakes = async () => {
  try {
    console.log("Fetching earthquakes from USGS...");
    const earthquakes = await fetchUSGSEarthquakes({
      starttime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // Last 7 days
      minmagnitude: 4.0,
      limit: 100,
    });

    console.log(`Found ${earthquakes.length} earthquakes. Processing...`);

    for (const earthquake of earthquakes) {
      try {
        // Check if this alert already exists (by title and timestamp)
        const existing = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          COLLECTION_ALERTS_ID,
          [Query.equal("title", earthquake.title)],
        );

        if (existing.documents.length === 0) {
          // Transform and save to Appwrite
          const alertData = transformEarthquakeToAlert(earthquake);

          await databases.createDocument(
            APPWRITE_DATABASE_ID,
            COLLECTION_ALERTS_ID,
            "unique()",
            alertData,
          );

          console.log(`✓ Added earthquake alert: ${earthquake.title}`);
        } else {
          console.log(`- Skipped duplicate: ${earthquake.title}`);
        }
      } catch (error) {
        console.error(
          `✗ Failed to save earthquake ${earthquake.title}:`,
          error,
        );
      }
    }

    console.log("Earthquake alerts seeding completed!");
  } catch (error) {
    console.error("Error seeding earthquake alerts:", error);
  }
};

/**
 * Seed alerts collection with weather alerts
 */
export const seedAlertsFromWeather = async (apiKey, locations = []) => {
  if (!apiKey) {
    console.log(
      "No OpenWeatherMap API key provided, skipping weather alerts...",
    );
    return;
  }

  // Default locations if none provided
  const defaultLocations = [
    { name: "New York", lat: 40.7128, lon: -74.006 },
    { name: "London", lat: 51.5074, lon: -0.1278 },
    { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
    { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  ];

  const locationsToCheck = locations.length > 0 ? locations : defaultLocations;

  try {
    console.log("Fetching weather alerts...");

    for (const location of locationsToCheck) {
      try {
        const alerts = await fetchWeatherAlerts(
          apiKey,
          location.lat,
          location.lon,
        );

        // Always add at least one test alert for each location to verify functionality
        if (alerts.length === 0) {
          alerts.push({
            id: `test_${location.name}_${Date.now()}`,
            title: `Weather Check - ${location.name}`,
            description: `Weather monitoring active in ${location.name}. No severe conditions detected.`,
            start: new Date().toISOString(),
            end: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            sender: "OpenWeatherMap",
            tags: ["monitoring", "weather"],
            severity: "info",
            latitude: location.lat,
            longitude: location.lon,
            source: "OpenWeatherMap",
            location: location.name,
          });
        }

        for (const alert of alerts) {
          try {
            // Check if this alert already exists
            const existing = await databases.listDocuments(
              APPWRITE_DATABASE_ID,
              COLLECTION_ALERTS_ID,
              [Query.equal("title", alert.title)],
            );

            if (existing.documents.length === 0) {
              // Transform and save to Appwrite
              const alertData = {
                title: alert.title,
                level:
                  alert.severity === "critical"
                    ? "Critical"
                    : alert.severity === "high"
                      ? "High"
                      : alert.severity === "medium"
                        ? "Medium"
                        : "Low",
                category: "Weather",
                location: location.name,
                latitude: alert.latitude,
                longitude: alert.longitude,
                active: new Date(alert.end) > new Date(),
                created_at: new Date().toISOString(),
              };

              await databases.createDocument(
                APPWRITE_DATABASE_ID,
                COLLECTION_ALERTS_ID,
                "unique()",
                alertData,
              );

              console.log(
                `✓ Added weather alert: ${alert.title} (${location.name})`,
              );
            } else {
              console.log(`- Skipped duplicate weather alert: ${alert.title}`);
            }
          } catch (error) {
            console.error(
              `✗ Failed to save weather alert ${alert.title}:`,
              error,
            );
          }
        }
      } catch (error) {
        console.error(
          `Error fetching weather alerts for ${location.name}:`,
          error,
        );
      }
    }

    console.log("Weather alerts seeding completed!");
  } catch (error) {
    console.error("Error seeding weather alerts:", error);
  }
};

/**
 * Run all seeding operations
 */
export const seedAllData = async (options = {}) => {
  const { openWeatherApiKey = null, weatherLocations = [] } = options;

  console.log("🚀 Starting data seeding process...");

  try {
    // Seed crises from ReliefWeb
    await seedCrisesFromReliefWeb();

    // Seed alerts from earthquakes
    await seedAlertsFromEarthquakes();

    // Seed alerts from weather (if API key provided)
    await seedAlertsFromWeather(openWeatherApiKey, weatherLocations);

    console.log("✅ All data seeding completed successfully!");
  } catch (error) {
    console.error("❌ Data seeding failed:", error);
  }
};

// ============================================================================
// SCHEDULER FUNCTIONS
// ============================================================================

/**
 * Schedule data seeding to run periodically
 * This is a simple implementation - in production, use a proper job scheduler
 */
export const scheduleDataSeeding = (intervalHours = 6) => {
  console.log(`📅 Scheduling data seeding every ${intervalHours} hours...`);

  const runSeeding = async () => {
    console.log(
      `🔄 Running scheduled data seeding at ${new Date().toISOString()}`,
    );
    await seedAllData();
  };

  // Run immediately
  runSeeding();

  // Schedule recurring runs
  setInterval(runSeeding, intervalHours * 60 * 60 * 1000);
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clean up old alerts (older than specified days)
 */
export const cleanupOldAlerts = async (daysOld = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    console.log(
      `🧹 Cleaning up alerts older than ${cutoffDate.toISOString()}...`,
    );

    // Get all alerts
    const alerts = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      COLLECTION_ALERTS_ID,
    );

    let deletedCount = 0;
    for (const alert of alerts.documents) {
      if (new Date(alert.timestamp || alert.$createdAt) < cutoffDate) {
        await databases.deleteDocument(
          APPWRITE_DATABASE_ID,
          COLLECTION_ALERTS_ID,
          alert.$id,
        );
        deletedCount++;
      }
    }

    console.log(`🗑️ Cleaned up ${deletedCount} old alerts`);
  } catch (error) {
    console.error("Error cleaning up old alerts:", error);
  }
};

/**
 * Get seeding statistics
 */
export const getSeedingStats = async () => {
  try {
    const [crises, alerts] = await Promise.all([
      databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_CRISES_ID),
      databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTION_ALERTS_ID),
    ]);

    return {
      crisesCount: crises.total,
      alertsCount: alerts.total,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error getting seeding stats:", error);
    return null;
  }
};
