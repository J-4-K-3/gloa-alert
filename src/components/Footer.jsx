import { motion } from "framer-motion";
import {
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiMail,
  FiGlobe,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.svg";

// Import popup components
import EvacuationRoutesPopup from "./popups/EvacuationRoutesPopup";
import SafeZonesPopup from "./popups/SafeZonesPopup";
import SafetyProtocolsPopup from "./popups/SafetyProtocolsPopup";
import TrainingProgramsPopup from "./popups/TrainingProgramsPopup";
import CommunityNotesPopup from "./popups/CommunityNotesPopup";
import PredictionsPopup from "./popups/PredictionsPopup";
import AnonymousTipsPopup from "./popups/AnonymousTipsPopup";
import LocalNetworksPopup from "./popups/LocalNetworksPopup";
import SupportGroupsPopup from "./popups/SupportGroupsPopup";
import DiscussionsPopup from "./popups/DiscussionsPopup";
import VotingsPopup from "./popups/VotingsPopup";
import ReportVerificationPopup from "./popups/ReportVerificationPopup";
import ImpactTrackingPopup from "./popups/ImpactTrackingPopup";
import CollaborativeMappingPopup from "./popups/CollaborativeMappingPopup";

const Footer = () => {
  // State for popup visibility
  const [showEvacuationRoutes, setShowEvacuationRoutes] = useState(false);
  const [showSafeZones, setShowSafeZones] = useState(false);
  const [showSafetyProtocols, setShowSafetyProtocols] = useState(false);
  const [showTrainingPrograms, setShowTrainingPrograms] = useState(false);
  const [showCommunityNotes, setShowCommunityNotes] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [showAnonymousTips, setShowAnonymousTips] = useState(false);
  const [showLocalNetworks, setShowLocalNetworks] = useState(false);
  const [showSupportGroups, setShowSupportGroups] = useState(false);
  const [showSurvivorStories, setShowSurvivorStories] = useState(false);
  const [showDiscussions, setShowDiscussions] = useState(false);
  const [showVotings, setShowVotings] = useState(false);
  const [showPolls, setShowPolls] = useState(false);
  const [showReportVerification, setShowReportVerification] = useState(false);
  const [showImpactTracking, setShowImpactTracking] = useState(false);
  const [showCollaborativeMapping, setShowCollaborativeMapping] =
    useState(false);
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container">
        <div
          className="footer-grid"
        >
          <div>
            <Link
              to="/"
              className="footer-logo"
            >
            <img src={logo} alt="G.R.O.A" className="footer-logo-img" />
            </Link>
            <p className="footer-description"
            >
              Global Danger Alert Platform providing real-time, verified
              situational awareness for humanitarian response and individual
              safety.
            </p>
            {/*<div className="footer-socials"
            >
              <motion.a
                whileHover={{ color: "var(--accent-color)", y: -2 }}
                href="#"
              >
                <FiTwitter />
              </motion.a>
              <motion.a
                whileHover={{ color: "var(--accent-color)", y: -2 }}
                href="#"
              >
                <FiLinkedin />
              </motion.a>
              <motion.a
                whileHover={{ color: "var(--accent-color)", y: -2 }}
                href="#"
              >
                <FiGithub />
              </motion.a>
              <motion.a
                whileHover={{ color: "var(--accent-color)", y: -2 }}
                href="#"
              >
                <FiMail />
              </motion.a>
            </div>*/}
          </div>

          <div>
            <h4 className="footer-h4">Platform</h4>
            <ul className="footer-nav"
            >
              <li>
                <Link to="/map" style={{ color: "var(--text-secondary)" }}>
                  Global Risk Map
                </Link>
              </li>
              <li>
                <Link to="/alerts" style={{ color: "var(--text-secondary)" }}>
                  Live Alert Feed
                </Link>
              </li>
              <li>
                <Link to="/weather" style={{ color: "var(--text-secondary)" }}>
                  Weather Monitoring
                </Link>
              </li>
              <li>
                <Link to="/regions" style={{ color: "var(--text-secondary)" }}>
                  Regional Analysis
                </Link>
              </li>
              <li>
                <Link to="/crises" style={{ color: "var(--text-secondary)" }}>
                  Active Crises
                </Link>
              </li>
              <li>
                <Link
                  to="/emergency-contacts"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Emergency Contacts
                </Link>
              </li>
              <li>
                <span
                  onClick={() => setShowEvacuationRoutes(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Evacuation Routes
                </span>
              </li>
              <li>
                <span
                  onClick={() => setShowSafeZones(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Safe Zones
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-h4">
              Resources
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <li>
                <Link to="/about" style={{ color: "var(--text-secondary)" }}>
                  How it Works
                </Link>
              </li>
              <li>
                <Link
                  to="/aid-relief"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Aid Directory
                </Link>
              </li>
              <li>
                <span
                  onClick={() => setShowSafetyProtocols(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Safety Protocols
                </span>
              </li>
              <li>
                <Link
                  to="/first-aid-guides"
                  style={{ color: "var(--text-secondary)" }}
                >
                  First Aid Guides
                </Link>
              </li>
              <li>
                <Link
                  to="/emergency-kits"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Emergency Kits
                </Link>
              </li>
              <li>
                <span
                  onClick={() => setShowTrainingPrograms(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Training Programs
                </span>
              </li>
              <li>
                <Link
                  to="/partner-organizations"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Trusted Organizations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-h4">
              Community
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <li>
                <span
                  onClick={() => setShowCommunityNotes(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Community Notes
                </span>
              </li>
              <li>
                <span
                  onClick={() => setShowPredictions(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Predictions
                </span>
              </li>
              <li>
                <span
                  onClick={() => setShowAnonymousTips(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Anonymous Tips
                </span>
              </li>
              <li>
                <span
                  onClick={() => setShowLocalNetworks(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Local Networks
                </span>
              </li>
              <li>
                <span
                  onClick={() => setShowSupportGroups(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Support Groups
                </span>
              </li>
              <li>
                <span
                  onClick={() => setShowDiscussions(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Discussions
                </span>
              </li>
              <li>
                <span
                  onClick={() => setShowVotings(true)}
                  style={{ cursor: "pointer", color: "var(--text-secondary)" }}
                >
                  Votings
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom"
        >
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            &copy; 2026{" "}
            <span style={{ color: "white", fontWeight: 600 }}>Innoxation</span>.
            All rights reserved.
          </p>
          <div
            style={{
              display: "flex",
              gap: "2rem",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
            }}
          >
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a
              href="#"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <FiGlobe /> English (US)
            </a>
          </div>
        </div>
      </div>

      {/* Popup Components */}
      <EvacuationRoutesPopup
        isOpen={showEvacuationRoutes}
        onClose={() => setShowEvacuationRoutes(false)}
      />
      <SafeZonesPopup
        isOpen={showSafeZones}
        onClose={() => setShowSafeZones(false)}
      />
      <SafetyProtocolsPopup
        isOpen={showSafetyProtocols}
        onClose={() => setShowSafetyProtocols(false)}
      />
      <TrainingProgramsPopup
        isOpen={showTrainingPrograms}
        onClose={() => setShowTrainingPrograms(false)}
      />
      <CommunityNotesPopup
        isOpen={showCommunityNotes}
        onClose={() => setShowCommunityNotes(false)}
      />
      <PredictionsPopup
        isOpen={showPredictions}
        onClose={() => setShowPredictions(false)}
      />
      <AnonymousTipsPopup
        isOpen={showAnonymousTips}
        onClose={() => setShowAnonymousTips(false)}
      />
      <LocalNetworksPopup
        isOpen={showLocalNetworks}
        onClose={() => setShowLocalNetworks(false)}
      />
      <SupportGroupsPopup
        isOpen={showSupportGroups}
        onClose={() => setShowSupportGroups(false)}
      />
      <DiscussionsPopup
        isOpen={showDiscussions}
        onClose={() => setShowDiscussions(false)}
      />
      <VotingsPopup
        isOpen={showVotings}
        onClose={() => setShowVotings(false)}
      />
      <ReportVerificationPopup
        isOpen={showReportVerification}
        onClose={() => setShowReportVerification(false)}
      />
      <ImpactTrackingPopup
        isOpen={showImpactTracking}
        onClose={() => setShowImpactTracking(false)}
      />
      <CollaborativeMappingPopup
        isOpen={showCollaborativeMapping}
        onClose={() => setShowCollaborativeMapping(false)}
      />
    </motion.footer>
  );
};

export default Footer;

{
  /*
  <li>
                <button
                  onClick={() => setShowCollaborativeMapping(true)}
                  style={{
                    color: "var(--text-secondary)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    padding: 0,
                    fontSize: "inherit",
                    fontFamily: "inherit",
                    textDecoration: "none",
                    display: "inline",
                  }}
                >
                  Collaborative Mapping
                </button>
              </li>
   <li>
                <button
                  onClick={() => setShowImpactTracking(true)}
                  style={{
                    color: "var(--text-secondary)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    padding: 0,
                    fontSize: "inherit",
                    fontFamily: "inherit",
                    textDecoration: "none",
                    display: "inline",
                  }}
                >
                  Impact Tracking
                </button>
              </li>
  <li>
                <button
                  onClick={() => setShowReportVerification(true)}
                  style={{
                    color: "var(--text-secondary)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    padding: 0,
                    fontSize: "inherit",
                    fontFamily: "inherit",
                    textDecoration: "none",
                    display: "inline",
                  }}
                >
                  Report Verification
                </button> 
              </li>
              */
}
