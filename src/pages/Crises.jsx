import { motion } from 'framer-motion';
import { FiAlertTriangle, FiClock, FiUsers, FiMapPin, FiTrendingUp, FiFilter, FiCalendar, FiLink } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { databases, APPWRITE_DATABASE_ID, COLLECTION_CRISES_ID, Query } from '../lib/Appwrite';
import { fetchHDXConflictEvents, fetchEONETEvents } from '../lib/fetchApi';

const Crises = () => {
  const [crises, setCrises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('severity');

  useEffect(() => {
    const fetchCrises = async () => {
      try {
        setLoading(true);

        // Fetch data from multiple sources
        const [appwriteResponse, hdxConflicts, eonetEvents] = await Promise.allSettled([
          // Fetch from Appwrite database
          (async () => {
            const queries = [];

            if (filterStatus !== 'all') {
              queries.push(Query.equal('status', filterStatus));
            }

            // Add sorting
            switch (sortBy) {
              case 'severity':
                queries.push(Query.orderDesc('severity'));
                break;
              case 'impact':
                queries.push(Query.orderDesc('impact'));
                break;
              case 'date':
                queries.push(Query.orderDesc('$createdAt'));
                break;
              case 'name':
                queries.push(Query.orderAsc('title'));
                break;
              default:
                queries.push(Query.orderDesc('severity'));
            }

            const response = await databases.listDocuments(
              APPWRITE_DATABASE_ID,
              COLLECTION_CRISES_ID,
              queries
            );

            return response.documents.map(crisis => ({
              id: crisis.$id,
              title: crisis.title,
              status: crisis.status,
              severity: crisis.severity,
              severityLabel: getSeverityLabel(crisis.severity),
              startDate: crisis.start_date ? new Date(crisis.start_date).toLocaleDateString() : 'Unknown',
              affected: crisis.impact || 'Unknown impact',
              description: crisis.description || 'Ongoing crisis situation',
              region: crisis.region,
              timeline: crisis.timeline || [],
              sources: crisis.sources || [],
              createdAt: crisis.$createdAt,
              updatedAt: crisis.$updatedAt,
              source: 'internal'
            }));
          })(),

          // Fetch HDX Conflict Events
          fetchHDXConflictEvents(),

          // Fetch NASA EONET Events (natural disasters)
          fetchEONETEvents(30, 50)
        ]);

        // Combine data from all sources
        let allCrises = [];

        // Add Appwrite crises
        if (appwriteResponse.status === 'fulfilled') {
          allCrises.push(...appwriteResponse.value);
        }

        // Add HDX Conflict Events
        if (hdxConflicts.status === 'fulfilled') {
          const conflicts = hdxConflicts.value;
          const transformedConflicts = conflicts.map(conflict => ({
            id: conflict.id,
            title: conflict.title || conflict.eventType || 'Conflict Event',
            status: 'active',
            severity: conflict.riskLevelNum || conflict.severity === 'Critical' ? 9 : conflict.severity === 'High' ? 8 : 5,
            severityLabel: conflict.riskLevel || conflict.level || 'High Risk',
            startDate: conflict.lastUpdated || 'Ongoing',
            affected: conflict.population || 'Regional Impact',
            description: conflict.description,
            region: conflict.location || conflict.country,
            timeline: conflict.event_date ? [`Started: ${new Date(conflict.event_date).toLocaleDateString()}`] : [],
            sources: [],
            createdAt: conflict.timestamp || new Date().toISOString(),
            updatedAt: conflict.lastUpdated || new Date().toISOString(),
            source: 'HDX'
          }));
          allCrises.push(...transformedConflicts);
        }

        // Add NASA EONET Events (natural disasters)
        if (eonetEvents.status === 'fulfilled') {
          const events = eonetEvents.value;
          const transformedEvents = events.map(event => ({
            id: event.id,
            title: event.title || event.name || 'Natural Disaster',
            status: 'active',
            severity: event.riskLevelNum || 6,
            severityLabel: event.riskLevel || 'Medium Risk',
            startDate: event.lastUpdated || 'Recent',
            affected: event.population || 'Regional',
            description: event.description || 'Natural disaster event',
            region: event.location || event.country,
            timeline: event.geometry && event.geometry[0]?.date ? [`Started: ${new Date(event.geometry[0].date).toLocaleDateString()}`] : [],
            sources: event.link ? [event.link] : [],
            createdAt: event.timestamp || new Date().toISOString(),
            updatedAt: event.lastUpdated || new Date().toISOString(),
            source: 'NASA EONET'
          }));
          allCrises.push(...transformedEvents);
        }

        // Add HDX Conflict Events
        if (hdxConflicts.status === 'fulfilled') {
          const conflicts = hdxConflicts.value;
          const transformedConflicts = conflicts.map(conflict => ({
            id: conflict.id,
            title: conflict.title || conflict.eventType || 'Conflict Event',
            status: 'active',
            severity: conflict.riskLevelNum || conflict.severity === 'Critical' ? 9 : conflict.severity === 'High' ? 8 : 5,
            severityLabel: conflict.riskLevel || conflict.level || 'High Risk',
            startDate: conflict.lastUpdated || 'Ongoing',
            affected: conflict.population || 'Regional Impact',
            description: conflict.description,
            region: conflict.location || conflict.country,
            timeline: [conflict.description || 'Ongoing conflict monitoring'],
            sources: [],
            createdAt: conflict.timestamp || new Date().toISOString(),
            updatedAt: conflict.lastUpdated || new Date().toISOString(),
            source: 'HDX'
          }));
          allCrises.push(...transformedConflicts);
        }

        // Add NASA EONET Events (natural disasters)
        if (eonetEvents.status === 'fulfilled') {
          const events = eonetEvents.value;
          const transformedEvents = events.map(event => ({
            id: event.id,
            title: event.title || event.name || 'Natural Disaster',
            status: 'active',
            severity: event.riskLevelNum || 6,
            severityLabel: event.riskLevel || 'Medium Risk',
            startDate: event.lastUpdated || 'Recent',
            affected: event.population || 'Regional',
            description: event.description || 'Natural disaster event',
            region: event.location || event.country,
            timeline: [event.description],
            sources: event.link ? [event.link] : [],
            createdAt: event.timestamp || new Date().toISOString(),
            updatedAt: event.lastUpdated || new Date().toISOString(),
            source: 'NASA EONET'
          }));
          allCrises.push(...transformedEvents);
        }

        // Apply client-side filtering and sorting
        if (filterStatus !== 'all') {
          allCrises = allCrises.filter(crisis => crisis.status === filterStatus);
        }

        // Apply sorting
        switch (sortBy) {
          case 'severity':
            allCrises.sort((a, b) => b.severity - a.severity);
            break;
          case 'impact':
            allCrises.sort((a, b) => (b.affected || '').localeCompare(a.affected || ''));
            break;
          case 'date':
            allCrises.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
          case 'name':
            allCrises.sort((a, b) => a.title.localeCompare(b.title));
            break;
          default:
            allCrises.sort((a, b) => b.severity - a.severity);
        }

        setCrises(allCrises);
      } catch (err) {
        console.error('Error fetching crises:', err);
        setError('Failed to load crisis data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCrises();
  }, [filterStatus, sortBy]);

  // Helper function to convert severity number to label
  const getSeverityLabel = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'Critical';
      case 'high': return 'High';
      case 'moderate': return 'Moderate';
      case 'low': return 'Low';
      default: return 'Unknown';
    }
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'active': return 'var(--alert-critical)';
      case 'monitoring': return 'var(--alert-high)';
      case 'resolved': return 'var(--alert-info)';
      case 'recent': return 'var(--alert-medium)';
      default: return 'var(--text-secondary)';
    }
  };

  // Helper function to get severity level number for CSS classes
  const getSeverityLevel = (severity) => {
    switch (String(severity || '').toLowerCase()) {
      case 'critical': return 1;
      case 'high': return 2;
      case 'moderate': return 3;
      case 'low': return 4;
      default: return 4;
    }
  };

  if (loading) {
    return (
      <div style={{
        paddingTop: '140px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <div>Loading crisis data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        paddingTop: '140px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh'
      }}>
        <div style={{ color: 'red' }}>{error}</div>
      </div>
    );
  }

  return (
    <motion.div
      style={{ paddingTop: '140px', paddingBottom: '40px' }}
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
          <h1 className="text-gradient" style={{ marginBottom: '1rem', fontSize: '3rem' }}>
            Global Crises
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Long-running conflicts and major disasters with detailed timelines and impact assessments
          </p>
        </motion.div>

        {/* Filter and Sort Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card glass"
          style={{
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontWeight: 600, marginRight: '1rem' }}>View Options:</span>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '0.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                color: 'white'
              }}
            >
              <option value="all">All Crises</option>
              <option value="active">Active</option>
              <option value="monitoring">Monitoring</option>
              <option value="resolved">Resolved</option>
              <option value="recent">Recent</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                color: 'white'
              }}
            >
              <option value="severity">Severity</option>
              <option value="impact">Impact</option>
              <option value="date">Date</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {crises.length} crise{crises.length !== 1 ? 's' : ''} found
          </div>
        </motion.div>

        {crises.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card glass"
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}
          >
            <FiAlertTriangle style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
            <h3>No crises match your filters</h3>
            <p>Try adjusting your filter criteria or check back later for updates.</p>
          </motion.div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {crises.map((crisis, index) => (
              <motion.div
                key={crisis.id}
                className={`card glass alert-level-${getSeverityLevel(crisis.severity)}`}
                whileHover={{ scale: 1.02, y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', lineHeight: '1.3' }}>{crisis.title}</h3>
                  <span style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: `${getStatusColor(crisis.status)}20`,
                    color: getStatusColor(crisis.status),
                    border: `1px solid ${getStatusColor(crisis.status)}40`
                  }}>
                    {crisis.status?.toUpperCase()}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: getStatusColor(crisis.severity),
                    borderRadius: '50%',
                    boxShadow: `0 0 8px ${getStatusColor(crisis.severity)}60`
                  }} />
                  <span style={{
                    fontWeight: 600,
                    color: getStatusColor(crisis.severity)
                  }}>
                    {crisis.severityLabel} Severity
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiCalendar style={{ color: 'var(--accent-color)' }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Started</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{crisis.startDate}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiUsers style={{ color: 'var(--alert-high)' }} />
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Affected</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{crisis.affected}</div>
                    </div>
                  </div>
                </div>

                {crisis.region && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <FiMapPin style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {crisis.region}
                    </span>
                  </div>
                )}

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.4', marginBottom: '1.5rem' }}>
                  {crisis.description}
                </p>

                {crisis.timeline && crisis.timeline.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'white', marginBottom: '0.75rem' }}>
                      <FiTrendingUp style={{ color: 'var(--accent-color)' }} />
                      Timeline
                    </h4>
                    <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                      <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
                        {crisis.timeline.slice(0, 3).map((event, eventIndex) => (
                          <li key={eventIndex} style={{ marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {event}
                          </li>
                        ))}
                        {crisis.timeline.length > 3 && (
                          <li style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                            +{crisis.timeline.length - 3} more events...
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {crisis.sources && crisis.sources.length > 0 && (
                  <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'white', marginBottom: '0.75rem' }}>
                      <FiClock style={{ color: 'var(--accent-color)' }} />
                      Verified Sources
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
{crisis.sources.slice(0, 3).map((source, sourceIndex) => {
                        const isEonetApi = source.startsWith('https://eonet.gsfc.nasa.gov/api');
                        const displayText = isEonetApi
                          ? 'NASA EONET Data'
                          : source.length > 40 ? source.slice(0, 40) + '...' : source;
                        return (
                          <a
                            key={sourceIndex}
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '0.3rem 0.6rem',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              borderRadius: '0.4rem',
                              fontSize: '0.75rem',
                              color: '#60A5FA',
                              textDecoration: 'none',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              fontWeight: 500,
                              transition: 'all 0.2s ease-in-out'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                              e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                              e.target.style.transform = 'scale(1)';
                            }}
                          >
                            {displayText}
                            <FiLink size={11} style={{ flexShrink: 0 }} />
                          </a>
                        );
                      })}
                      {crisis.sources.length > 3 && (
                        <span style={{
                          padding: '0.3rem 0.6rem',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: '0.4rem',
                          fontSize: '0.75rem',
                          color: '#60A5FA',
                          fontStyle: 'italic',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          fontWeight: 500
                        }}>
                          +{crisis.sources.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Commented out View Full Details button 
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, var(--accent-color), var(--accent-glow))',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    View Full Details
                  </button>
                </div> */}
              </motion.div>
            ))}
          </div>
        )}

        {/* Crisis Intelligence Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card glass"
          style={{ marginTop: '3rem', padding: '2rem' }}
        >
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Crisis Intelligence & Analysis
          </h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Our crisis tracking combines real-time monitoring with historical analysis to provide
            comprehensive coverage of major global events. Each crisis entry includes verified
            timelines, impact assessments, and links to official sources. Our AI-powered analysis
            helps predict crisis escalation and recommends optimal response strategies.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Crises;