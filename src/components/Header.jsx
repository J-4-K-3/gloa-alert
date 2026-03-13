import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu } from "react-icons/fi";
import logo from "../assets/logo.svg";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 800);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/map", label: "Map" },
    { path: "/alerts", label: "Alerts" },
    { path: "/regions", label: "Regions" },
    { path: "/crises", label: "Crises" },
    { path: "/aid-relief", label: "Aid & Relief" },
    { path: "/about", label: "About" },
  ];

  return (
    <motion.header
      className={`${isScrolled ? "scrolled glass" : ""}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="header-container container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "1400px",
        }}
      >
        <div className="header-container logo-container"
          onClick={() => setShowOwnershipModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            cursor: "pointer",
          }}
        >
            <button 
            className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleMobileMenu();
            }}
            style={{
              display: !isMobile ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "35px",
              height: "35px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              zIndex: 1001,
            }}
          >
            <span style={{
              display: "block",
              width: "24px",
              height: "24px",
              margin: "4px 0",
              backgroundColor: "white",
              borderRadius: "3px",
              transition: "all 0.3s ease",
            }}>=</span>
          </button>
          <img
            src={logo}
            alt="G.R.O.A"
            style={{
              height: isScrolled ? "32px" : "40px",
              transition: "all 0.3s",
              color: "white",
            }}
          />
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                className="mobile-menu-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobileMenu}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.5)",
                  zIndex: 999,
                }}
              />
              <motion.nav
                className="mobile-sidebar"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                style={{
                  position: "fixed",
                  top: 0,
                  right: 0,
                  width: "280px",
                  height: "100vh",
                  zIndex: 1000,
                }}
              >
                <div style={{padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column"}}>
                  <button 
                    onClick={closeMobileMenu}
                    style={{
                      alignSelf: "flex-end",
                      background: "none",
                      border: "none",
                      fontSize: "2rem",
                      cursor: "pointer",
                      color: "var(--text-primary)",
                      padding: "0.5rem",
                    }}
                  >
                    ×
                  </button>
                  <ul style={{ listStyle: "none", flex: 1, padding: 0 }}>
                    {navItems.map((item) => (
                      <li key={item.path} style={{ marginBottom: "1rem" }}>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) => (isActive ? "active" : "")}
                          onClick={closeMobileMenu}
                          style={{
                            display: "block",
                            padding: "1rem",
                            fontSize: "1.1rem",
                            color: "var(--text-primary)",
                          }}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        <nav className="main-nav">
          <ul className="nav-list" style={{ gap: "2rem" }}>
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
              <NavLink
                  to={item.path}
                  className={({ isActive }) => (isActive ? "active" : "")}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="report-btn-container">
          <Link to="/submit-report">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                border: "none",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 1.2rem",
                fontSize: "0.9rem",
              }}
            >
              Report Emergency
            </motion.button>
          </Link>
        </div>
      </div>

      {/* Ownership Modal */}
      <AnimatePresence>
        {showOwnershipModal && (
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
              zIndex: 1000,
              padding: "1rem",
            }}
            onClick={() => setShowOwnershipModal(false)}
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
                  G.R.O.A
                </h3>
                <button
                  onClick={() => setShowOwnershipModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    padding: "0.25rem",
                    borderRadius: "0.25rem",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.background = "rgba(255,255,255,0.1)")
                  }
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
                  <h4 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                    About G.R.O.A
                  </h4>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.6",
                    }}
                  >
                    G.R.O.A is a free, open
                    platform designed to provide timely information on global
                    crises, risks and relief efforts. It connects people with
                    real-world organizations and communities, offering verified
                    updates and situational awareness without barriers
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                    Ownership & Development
                  </h4>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.6",
                    }}
                  >
                    G.R.O.A is owned and developed by Innoxation Tech Inc, a
                    technology company building diverse platforms for social
                    connection, app distribution and global safety. We are new,
                    growing and committed to transparency, accessibility and
                    community empowerment
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                    How It Works
                  </h4>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.6",
                    }}
                  >
                    There are no accounts, no payments, and no barriers. Simply
                    visit the platform, explore the information you need, send
                    notes if you wish, report issues and leave. It’s free,
                    convenient and designed to give you more insight with less
                    friction
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                    Get Involved
                  </h4>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      lineHeight: "1.6",
                    }}
                  >
                    Users can contact Innoxation Tech Inc through the footer
                    information for support, data requests or to suggest new
                    features they’d like to see in G.R.O.A. Your feedback helps
                    us grow and serve communities better
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginTop: "1rem",
                  }}
                >
                  <Link to="/" style={{ flex: 1 }}>
                    <button
                      style={{
                        width: "100%",
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
                      onClick={() => setShowOwnershipModal(false)}
                    >
                      Go to Homepage
                    </button>
                  </Link>
                  <button
                    onClick={() => setShowOwnershipModal(false)}
                    style={{
                      padding: "0.75rem",
                      fontSize: "0.9rem",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.background = "rgba(255,255,255,0.2)")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.background = "rgba(255,255,255,0.1)")
                    }
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
