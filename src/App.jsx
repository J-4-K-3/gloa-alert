import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  databases,
  APPWRITE_DATABASE_ID,
  COLLECTION_TRACKER_ID,
  IDs,
} from "./lib/Appwrite";
import Loading from "./components/Loading";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import FullMap from "./pages/FullMap";
import Alerts from "./pages/Alerts";
import Weather from "./pages/Weather";
import Regions from "./pages/Regions";
import Crises from "./pages/Crises";
import SubmitReport from "./pages/SubmitReport";
import AidRelief from "./pages/AidRelief";
import About from "./pages/About";
import EmergencyContacts from "./pages/EmergencyContacts";
import FirstAidGuides from "./pages/FirstAidGuides";
import EmergencyKits from "./pages/EmergencyKits";
import PartnerOrganizations from "./pages/PartnerOrganizations";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);

  const handleLoadingComplete = async () => {
    setLoading(false);

    try {
      const userAgent = navigator.userAgent;

      const osMatch = userAgent.match(
        /(Windows NT|Mac OS X|Linux|Android|iPhone|iPad)/i,
      );
      const os = osMatch
        ? osMatch[1].replace(/ NT$/, "").replace(/ OS X$/, "macOS")
        : "Unknown";

      const screenWidth = window.screen.width;
      const screenHeight = window.screen.height;
      const referrer = document.referrer || "";
      const timestamp = new Date().toISOString();

      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTION_TRACKER_ID,
        IDs.unique(),
        {
          userAgent,
          os,
          screenWidth,
          screenHeight,
          referrer,
          timestamp,
        },
      );
    } catch (error) {
      console.error("Visit tracking failed:", error);
    }
  };

  if (loading) {
    return <Loading onComplete={handleLoadingComplete} />;
  }

  return (
    <Router>
      <Helmet>
        <title>G.R.O.A</title>
        <meta
          name="description"
          content="Stay informed with verified global danger alerts."
        />
        <meta property="og:title" content="G.R.O.A" />
        <meta
          property="og:description"
          content="Stay informed with verified global danger alerts."
        />
        <meta
          property="og:image"
          content="https://gloa-alerts.vercel.app/assets/logo.svg"
        />
        <meta property="og:url" content="https://gloa-alerts.vercel.app" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="G.R.O.A" />
        <meta
          name="twitter:description"
          content="Stay informed with verified global danger alerts."
        />
        <meta
          name="twitter:image"
          content="https://gloa-alert.vercel.app/assets/logo.svg"
        />
      </Helmet>
      <div
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/full-map" element={<FullMap />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/regions" element={<Regions />} />
            <Route path="/crises" element={<Crises />} />
            <Route path="/submit-report" element={<SubmitReport />} />
            <Route path="/aid-relief" element={<AidRelief />} />
            <Route path="/about" element={<About />} />
            <Route path="/emergency-contacts" element={<EmergencyContacts />} />
            <Route path="/first-aid-guides" element={<FirstAidGuides />} />
            <Route path="/emergency-kits" element={<EmergencyKits />} />
            <Route
              path="/partner-organizations"
              element={<PartnerOrganizations />}
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
