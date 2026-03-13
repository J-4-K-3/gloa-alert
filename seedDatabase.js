// seedDatabase.js - Command-line script to seed the database with external data
// Usage: node seedDatabase.js

import {
  seedAllData,
  getSeedingStats,
  cleanupOldAlerts,
  seedAlertsFromWeather,
} from "./src/lib/dataSeeder.js";

// Load environment variables
const OPENWEATHER_API_KEY = process.env.VITE_OPENWEATHER_API_KEY || null;

async function main() {
  const command = process.argv[2] || "seed";

  console.log("🌍 G.R.O.A Database Seeder");
  console.log("==========================\n");

  try {
    switch (command) {
      case "seed":
        console.log("🌱 Seeding database with external data...\n");
        await seedAllData({
          openWeatherApiKey: OPENWEATHER_API_KEY,
          weatherLocations: [
            { name: "New York", lat: 40.7128, lon: -74.006 },
            { name: "London", lat: 51.5074, lon: -0.1278 },
            { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
            { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
            { name: "Sydney", lat: -33.8688, lon: 151.2093 },
          ],
        });
        break;

      case "stats":
        console.log("📊 Getting database statistics...\n");
        const stats = await getSeedingStats();
        if (stats) {
          console.log(`Crises: ${stats.crisesCount}`);
          console.log(`Alerts: ${stats.alertsCount}`);
          console.log(`Last Updated: ${stats.lastUpdated}`);
        }
        break;

      case "cleanup":
        console.log("🧹 Cleaning up old alerts...\n");
        await cleanupOldAlerts(30); // Clean alerts older than 30 days
        break;

      case "crises":
        console.log("🏛️ Seeding crises from ReliefWeb...\n");
        const { seedCrisesFromReliefWeb } =
          await import("./src/lib/dataSeeder.js");
        await seedCrisesFromReliefWeb();
        break;

      case "earthquakes":
        console.log("🌋 Seeding earthquake alerts...\n");
        const { seedAlertsFromEarthquakes } =
          await import("./src/lib/dataSeeder.js");
        await seedAlertsFromEarthquakes();
        break;

      case "weather":
        if (!OPENWEATHER_API_KEY) {
          console.error(
            "❌ OpenWeatherMap API key not found. Set VITE_OPENWEATHER_API_KEY environment variable.",
          );
          process.exit(1);
        }
        console.log("🌤️ Seeding weather alerts...\n");
        const { seedAlertsFromWeather: weatherSeeder } =
          await import("./src/lib/dataSeeder.js");
        await weatherSeeder(OPENWEATHER_API_KEY);
        break;

      default:
        console.log("Usage: node seedDatabase.js [command]");
        console.log("");
        console.log("Commands:");
        console.log(
          "  seed        - Seed all data (crises, earthquakes, weather)",
        );
        console.log("  crises      - Seed only crises from ReliefWeb");
        console.log("  earthquakes - Seed only earthquake alerts");
        console.log("  weather     - Seed only weather alerts");
        console.log("  stats       - Show database statistics");
        console.log("  cleanup     - Clean up old alerts (30+ days)");
        console.log("");
        console.log("Environment Variables:");
        console.log("  VITE_OPENWEATHER_API_KEY - Required for weather alerts");
        break;
    }

    console.log("\n✅ Operation completed successfully!");
  } catch (error) {
    console.error("\n❌ Operation failed:", error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});

// Run the script
main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
