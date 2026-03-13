import { motion } from 'framer-motion';

const AidRelief = () => {
  const organizations = [
    {
      name: 'International Red Cross',
      description: 'Global humanitarian network providing emergency assistance',
      link: 'https://redcross.org',
      type: 'Humanitarian'
    },
    {
      name: 'United Nations Humanitarian Affairs',
      description: 'UN coordination of global humanitarian efforts',
      link: 'https://unocha.org',
      type: 'International'
    },
    {
      name: 'World Food Programme',
      description: 'Fighting hunger worldwide through food assistance',
      link: 'https://wfp.org',
      type: 'Food Security'
    },
    {
      name: 'Doctors Without Borders',
      description: 'Medical humanitarian organization providing care in crisis zones',
      link: 'https://doctorswithoutborders.org',
      type: 'Medical'
    },
    {
      name: 'International Rescue Committee',
      description: 'Helping people whose lives are shattered by conflict and disaster',
      link: 'https://rescue.org',
      type: 'Refugee Support'
    }
  ];

  const resources = [
    {
      title: 'Emergency Evacuation Resources',
      description: 'Guides and contacts for safe evacuation procedures',
      items: ['Local embassy contacts', 'International evacuation services', 'Border crossing information']
    },
    {
      title: 'Crisis Communication',
      description: 'Stay connected during emergencies',
      items: ['Satellite phones', 'Emergency radio frequencies', 'Messaging apps for crisis zones']
    },
    {
      title: 'Relief Supply Distribution',
      description: 'How aid reaches affected areas',
      items: ['Logistics coordination', 'Supply chain tracking', 'Distribution center locations']
    }
  ];

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
          <h1 style={{ marginBottom: '1rem' }}>Aid & Relief Resources</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Verified humanitarian organizations and emergency resources
          </p>
        </motion.div>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
            Humanitarian Organizations
          </h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {organizations.map(org => (
              <motion.div
                key={org.name}
                className="card"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * organizations.indexOf(org) }}
              >
                <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, marginBottom: 10 }}>{org.name}</h3>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.8rem',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)'
                  }}>
                    {org.type}
                  </span>
                </div>
                <p style={{ marginBottom: '1rem', color: '#555' }}>{org.description}</p>
                <a
                  href={org.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-block', fontWeight: 'bold' }}
                >
                  Visit Website →
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
            Emergency Resources
          </h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {resources.map(resource => (
              <motion.div
                key={resource.title}
                className="card"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * resources.indexOf(resource) }}
              >
                <h3 style={{ marginBottom: '0.5rem' }}>{resource.title}</h3>
                <p style={{ marginBottom: '1rem', color: '#555' }}>{resource.description}</p>
                <ul style={{ paddingLeft: '1.5rem' }}>
                  {resource.items.map((item, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>{item}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <div className="card">
            <h2>Donation Guidelines</h2>
            <p style={{ marginBottom: '1rem' }}>
              When donating to crisis relief, consider these best practices:
            </p>
            <ul style={{ paddingLeft: '1.5rem' }}>
              <li>Donate through established organizations with transparent operations</li>
              <li>Give cash rather than goods when possible - organizations know local needs best</li>
              <li>Research the organization's track record and efficiency</li>
              <li>Consider long-term recovery needs, not just immediate relief</li>
              <li>Be wary of unsolicited donation requests or unofficial channels</li>
            </ul>
            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
              <strong>Note:</strong> G.R.O.A does not collect donations. We only provide information about verified relief organizations.
            </p>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default AidRelief;