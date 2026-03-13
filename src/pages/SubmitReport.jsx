import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiSend, FiMapPin, FiPaperclip, FiShield, FiAlertTriangle, FiInfo } from 'react-icons/fi';

const SubmitReport = () => {
  const [form, setForm] = useState({
    note: '',
    source: '',
    location: '',
    evidence: null,
    category: 'military',
    urgency: 'medium'
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Report submitted for moderation. Thank you for helping keep G.R.O.A accurate.');
    setForm({
      note: '',
      source: '',
      location: '',
      evidence: null,
      category: 'military',
      urgency: 'medium'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ paddingTop: '140px', paddingBottom: '40px' }}
    >
      <div className="container" style={{ maxWidth: '900px' }}>
        <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-gradient" 
            style={{ fontSize: '3.5rem', marginBottom: '1rem' }}
          >
            Intelligence Report
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}
          >
            Contribute to global safety by sharing verified situational intelligence. Your data helps save lives.
          </motion.p>
        </section>

        <div className="grid" style={{ gridTemplateColumns: '1fr 350px', alignItems: 'start' }}>
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="card glass" 
            style={{ padding: '3rem' }}
          >
            <form onSubmit={handleSubmit}>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    <option value="military">Military Activity</option>
                    <option value="natural">Natural Disaster</option>
                    <option value="civil">Civil Unrest</option>
                    <option value="terror">Terrorism</option>
                    <option value="weather">Severe Weather</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Urgency</label>
                  <select name="urgency" value={form.urgency} onChange={handleChange}>
                    <option value="low">Low - General Info</option>
                    <option value="medium">Medium - Developing</option>
                    <option value="high">High - Immediate</option>
                    <option value="critical">Critical - Life Threat</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <FiMapPin style={{ marginRight: '0.5rem' }} /> Exact Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City, Province, Country"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Detailed Observations</label>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  placeholder="Describe the situation with as much technical detail as possible..."
                  rows="6"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <FiPaperclip style={{ marginRight: '0.5rem' }} /> Evidence & Media
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="file"
                    name="evidence"
                    onChange={handleChange}
                    style={{ position: 'absolute', opacity: 0, cursor: 'pointer', height: '100%' }}
                  />
                  <div className="glass" style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--border-color)', borderRadius: '0.75rem' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {form.evidence ? form.evidence.name : 'Drag & drop or click to upload media (Image/Video)'}
                    </p>
                  </div>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                style={{ 
                  width: '100%', 
                  background: 'var(--accent-color)', 
                  color: 'white', 
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  fontSize: '1.1rem',
                  padding: '1.25rem',
                  opacity: 0.5,
                  cursor: 'not-allowed',
                }}
              >
                Dispatch Intelligence Report
              </motion.button>
            </form>
          </motion.div>

          <aside>
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="card glass" 
              style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-color)' }}
            >
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FiShield style={{ color: 'var(--accent-color)' }} /> Verification
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Our analysts cross-reference your report with satellite imagery, social signals, and local sensors. High-quality evidence accelerates verification.
              </p>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="card glass"
              style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--alert-info)' }}
            >
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FiSend style={{ color: 'var(--alert-info)' }} /> Report Destination
              </h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                <p style={{ marginBottom: '0.75rem' }}>
                  Your intelligence reports are securely transmitted to our global network of analysts and distributed to:
                </p>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
                  <li style={{ marginBottom: '0.25rem' }}>UN Peacekeeping Operations</li>
                  <li style={{ marginBottom: '0.25rem' }}>International Red Cross & Red Crescent</li>
                  <li style={{ marginBottom: '0.25rem' }}>National Emergency Response Teams</li>
                  <li style={{ marginBottom: '0.25rem' }}>Humanitarian Aid Organizations</li>
                </ul>
                <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontStyle: 'italic' }}>
                  All submissions undergo rigorous verification before distribution to ensure accuracy and prevent misinformation.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="card glass"
              style={{ borderLeft: '4px solid var(--alert-high)' }}
            >
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FiAlertTriangle style={{ color: 'var(--alert-high)' }} /> Safety First
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Do not put yourself at risk to gather intelligence. Ensure you are in a secure location before submitting media. Your safety is paramount.
              </p>
            </motion.div>

            <div style={{ marginTop: '2rem', padding: '1rem', textAlign: 'center' }}>
              <FiInfo style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                End-to-end encrypted submission. <br />
                Privacy Protected.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
};

export default SubmitReport;
