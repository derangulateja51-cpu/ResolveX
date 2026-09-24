import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  Edit3, 
  CheckCircle2, 
  ShieldAlert, 
  RotateCcw,
  Info,
  Loader2,
  ArrowRight,
  FileCheck,
  Check
} from 'lucide-react';
import { parseComplaintWithAI, VALID_CATEGORIES } from '../services/aiService';
import { complaintService } from '../services/complaintService';
import ErrorBanner from '../components/ErrorBanner';

export default function ReportComplaint() {
  const navigate = useNavigate();

  // Mode: 'ai' or 'manual'
  const [mode, setMode] = useState('ai');

  // AI Prompt Input State
  const [naturalPrompt, setNaturalPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState('');
  const [aiError, setAiError] = useState('');

  // Structured Complaint Form State (used for both review of AI output and manual submission)
  const [hasAiParsed, setHasAiParsed] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'IT/WiFi',
    description: '',
    location: '',
    priority: 'Medium',
    isSensitive: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  // Quick prompt chips
  const samplePrompts = [
    'The WiFi in the CSE block has not been working for three days.',
    'Hot water geyser malfunctioning in Block B 2nd floor washroom.',
    'Mess dinner food quality was undercooked and cold on Tuesday.',
    'HDMI projector flickering every 30 seconds in Lecture Hall 402.'
  ];

  // Step 2: Handle AI Natural Language Intake
  const handleAiParse = async (e) => {
    if (e) e.preventDefault();
    setAiError('');
    setAiNotice('');

    if (!naturalPrompt.trim() || naturalPrompt.trim().length < 5) {
      setAiError('Please enter a description of at least 5 characters for AI structuring.');
      return;
    }

    setAiLoading(true);

    try {
      const result = await parseComplaintWithAI(naturalPrompt);

      if (result.success && result.data) {
        // AI Success: Populate fields for user REVIEW and EDITING
        setFormData(prev => ({
          ...prev,
          subject: result.data.subject,
          category: result.data.category,
          description: result.data.description,
          location: prev.location || (naturalPrompt.toLowerCase().includes('cse block') ? 'CSE Block' : '')
        }));
        setHasAiParsed(true);
        if (result.notice) {
          setAiNotice(result.notice);
        }
      } else {
        // Automatic Fallback to manual form on failure/timeout
        setAiError(result.error || 'AI parsing could not complete. Switched to manual form.');
        setMode('manual');
        setFormData(prev => ({
          ...prev,
          description: naturalPrompt
        }));
      }
    } catch (err) {
      setAiError('AI service unavailable or timed out. Switched to manual entry form.');
      setMode('manual');
      setFormData(prev => ({
        ...prev,
        description: naturalPrompt
      }));
    } finally {
      setAiLoading(false);
    }
  };

  // Step 4: Handle final submission (AI never submits directly; student confirms submission)
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setSubmissionError('');

    if (!formData.subject.trim()) {
      setSubmissionError('Please provide a subject line for your complaint.');
      return;
    }
    if (!formData.description.trim()) {
      setSubmissionError('Please provide a detailed description.');
      return;
    }
    if (!formData.category) {
      setSubmissionError('Please select a valid complaint category.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await complaintService.createComplaint({
        ...formData,
        isAIGenerated: hasAiParsed
      });

      navigate(`/complaints/${created._id || created.id}`);
    } catch (err) {
      setSubmissionError(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAi = () => {
    setHasAiParsed(false);
    setAiNotice('');
    setAiError('');
  };

  const categories = ['IT/WiFi', 'Hostel', 'Academic', 'Mess', 'Infrastructure', 'Transport', 'Other'];

  return (
    <div className="app-container page-wrapper">
      <div style={{ maxWidth: '820px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary-deep)', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary-border)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Issue Submission
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Report an Issue
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Describe your grievance in everyday language. IssueHub AI converts it into an actionable university ticket for fast resolution.
          </p>
        </div>

        {/* Visual Stepper Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.75rem',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: !hasAiParsed ? 'var(--primary)' : 'var(--status-resolved)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              {hasAiParsed ? <Check size={14} /> : '1'}
            </span>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
              Describe Issue
            </span>
          </div>

          <div style={{ height: '2px', flex: 1, backgroundColor: hasAiParsed ? 'var(--status-resolved)' : '#e2e8f0', margin: '0 12px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: hasAiParsed ? 'var(--primary)' : '#e2e8f0',
                color: hasAiParsed ? '#ffffff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              2
            </span>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: hasAiParsed ? 'var(--text-main)' : 'var(--text-muted)' }}>
              Structure with AI
            </span>
          </div>

          <div style={{ height: '2px', flex: 1, backgroundColor: hasAiParsed ? '#e2e8f0' : '#e2e8f0', margin: '0 12px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#e2e8f0',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              3
            </span>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Review & Submit
            </span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            backgroundColor: '#f1f5f9',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
            width: 'fit-content'
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('ai'); setSubmissionError(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 15px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.86rem',
              fontWeight: 600,
              backgroundColor: mode === 'ai' ? '#ffffff' : 'transparent',
              color: mode === 'ai' ? 'var(--primary-deep)' : 'var(--text-muted)',
              boxShadow: mode === 'ai' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            <Sparkles size={15} style={{ color: mode === 'ai' ? 'var(--primary)' : 'inherit' }} />
            <span>AI Natural-Language Intake</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('manual'); setSubmissionError(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 15px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.86rem',
              fontWeight: 600,
              backgroundColor: mode === 'manual' ? '#ffffff' : 'transparent',
              color: mode === 'manual' ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: mode === 'manual' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            <Edit3 size={15} />
            <span>Manual Form</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {submissionError && <ErrorBanner message={submissionError} onDismiss={() => setSubmissionError('')} />}

        {/* FLOW 1: AI INTAKE */}
        {mode === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Step 1 & 2: Describe & Structure */}
            {!hasAiParsed ? (
              <div
                className="card-panel"
                style={{
                  padding: '2rem',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>
                      Step 1: Describe the Problem
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Enter your complaint naturally. AI will structure and categorize it.
                    </p>
                  </div>
                </div>

                {aiError && <ErrorBanner message={aiError} onDismiss={() => setAiError('')} />}

                <form onSubmit={handleAiParse}>
                  <div className="form-group">
                    <textarea
                      className="form-textarea"
                      placeholder="e.g. The WiFi in the CSE block has not been working for three days, and we cannot submit our lab assignments..."
                      value={naturalPrompt}
                      onChange={(e) => setNaturalPrompt(e.target.value)}
                      style={{
                        minHeight: '130px',
                        fontSize: '0.98rem',
                        lineHeight: 1.6
                      }}
                      disabled={aiLoading}
                    />
                  </div>

                  {/* Sample Chips */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Click to try sample complaint:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {samplePrompts.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNaturalPrompt(sample)}
                          style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: 'var(--text-secondary)',
                            padding: '5px 11px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            textAlign: 'left'
                          }}
                        >
                          "{sample}"
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      <Info size={15} style={{ color: 'var(--primary)' }} />
                      <span>AI extracts title, category, and details for you to verify.</span>
                    </div>

                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={aiLoading || !naturalPrompt.trim()}
                      style={{ padding: '11px 22px' }}
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} />
                          <span>Structuring with AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={17} />
                          <span>Structure with AI</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Step 3: Review and Edit AI Generated Output */
              <div
                className="card-panel"
                style={{
                  padding: '2rem',
                  border: '1px solid var(--status-resolved-border)',
                  backgroundColor: '#ffffff'
                }}
              >
                {/* AI Review Banner */}
                <div
                  style={{
                    backgroundColor: 'var(--status-resolved-bg)',
                    border: '1px solid var(--status-resolved-border)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.75rem',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 size={20} style={{ color: 'var(--status-resolved)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--status-resolved-text)', fontSize: '0.92rem' }}>
                        Step 3: Review & Edit Generated Fields
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#065f46' }}>
                        AI has structured your complaint. Please verify or adjust any fields before final submission.
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetAi}
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '5px 12px' }}
                  >
                    <RotateCcw size={13} />
                    <span>Re-enter Issue</span>
                  </button>
                </div>

                {aiNotice && (
                  <div style={{ marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 500 }}>
                    ℹ️ {aiNotice}
                  </div>
                )}

                {/* The Editable Form */}
                <form onSubmit={handleSubmitComplaint}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="ai-subject">
                      Complaint Title / Subject <span style={{ color: 'var(--status-rejected)' }}>*</span>
                    </label>
                    <input
                      id="ai-subject"
                      type="text"
                      className="form-input"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label className="form-label" htmlFor="ai-category">
                        Category <span style={{ color: 'var(--status-rejected)' }}>*</span>
                      </label>
                      <select
                        id="ai-category"
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      >
                        {categories.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label" htmlFor="ai-priority">
                        Priority Level
                      </label>
                      <select
                        id="ai-priority"
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="Low">Low — Minor issue</option>
                        <option value="Medium">Medium — Standard priority</option>
                        <option value="High">High — Impeding academic work</option>
                        <option value="Urgent">Urgent — Safety / Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label" htmlFor="ai-location">
                        Campus Location / Block
                      </label>
                      <input
                        id="ai-location"
                        type="text"
                        className="form-input"
                        placeholder="e.g. CSE Block 3rd Floor"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="ai-description">
                      Complaint Details <span style={{ color: 'var(--status-rejected)' }}>*</span>
                    </label>
                    <textarea
                      id="ai-description"
                      className="form-textarea"
                      rows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  {/* Confidential Grievance Toggle */}
                  <div
                    style={{
                      backgroundColor: '#fff1f2',
                      border: '1px solid #fecdd3',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '1.75rem'
                    }}
                  >
                    <input
                      type="checkbox"
                      id="sensitive-toggle-ai"
                      checked={formData.isSensitive}
                      onChange={(e) => setFormData({ ...formData, isSensitive: e.target.checked })}
                      style={{ marginTop: '3px', cursor: 'pointer', width: '17px', height: '17px' }}
                    />
                    <label htmlFor="sensitive-toggle-ai" style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#9f1239', fontSize: '0.88rem' }}>
                        <ShieldAlert size={16} />
                        <span>Confidential Grievance Protocol (Ombudsman)</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#881337', marginTop: '2px' }}>
                        Check this box if your report involves harassment, ragging, safety issues, or confidential staff disputes. Student identity is protected.
                      </div>
                    </label>
                  </div>

                  {/* Submit Confirmation Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleResetAi}
                      className="btn-secondary"
                    >
                      Discard & Re-enter
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={submitting}
                      style={{ padding: '12px 26px' }}
                    >
                      {submitting ? (
                        <span>Submitting Ticket...</span>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Submit Complaint</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* FLOW 2: STANDARD MANUAL FORM */}
        {mode === 'manual' && (
          <div className="card-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
              Manual Complaint Registration
            </h3>

            <form onSubmit={handleSubmitComplaint}>
              <div className="form-group">
                <label className="form-label" htmlFor="manual-subject">
                  Subject / Summary <span style={{ color: 'var(--status-rejected)' }}>*</span>
                </label>
                <input
                  id="manual-subject"
                  type="text"
                  className="form-input"
                  placeholder="e.g. WiFi connectivity issue in CSE Block"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label" htmlFor="manual-category">
                    Category <span style={{ color: 'var(--status-rejected)' }}>*</span>
                  </label>
                  <select
                    id="manual-category"
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" htmlFor="manual-priority">
                    Priority Level
                  </label>
                  <select
                    id="manual-priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" htmlFor="manual-location">
                    Campus Location
                  </label>
                  <input
                    id="manual-location"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Hostel Block B, Room 214"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="manual-description">
                  Full Description <span style={{ color: 'var(--status-rejected)' }}>*</span>
                </label>
                <textarea
                  id="manual-description"
                  className="form-textarea"
                  rows={5}
                  placeholder="Provide all relevant details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              {/* Confidential Toggle */}
              <div
                style={{
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '1.75rem'
                }}
              >
                <input
                  type="checkbox"
                  id="sensitive-toggle-manual"
                  checked={formData.isSensitive}
                  onChange={(e) => setFormData({ ...formData, isSensitive: e.target.checked })}
                  style={{ marginTop: '3px', cursor: 'pointer', width: '17px', height: '17px' }}
                />
                <label htmlFor="sensitive-toggle-manual" style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#9f1239', fontSize: '0.88rem' }}>
                    <ShieldAlert size={16} />
                    <span>Confidential Grievance Protocol (Ombudsman)</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#881337', marginTop: '2px' }}>
                    Check this if your report involves sensitive allegations or confidential matters.
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                  style={{ padding: '12px 26px' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
