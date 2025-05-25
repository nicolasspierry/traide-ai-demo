import React, { useState, useEffect } from 'react';

// NZ-Specific Knowledge Base
const NZ_TRADE_KNOWLEDGE = {
  terms: {
    'chippy': 'builder',
    'sparky': 'electrician', 
    'gib': 'plasterboard',
    'preline': 'pre-line inspection',
    'rough-in': 'rough-in work'
  },
  
  materials: {
    builder: ['2x4 timber', 'gib sheets', 'nails', 'screws', 'insulation', 'weatherboards'],
    electrician: ['cable', 'junction boxes', 'power outlets', 'light fittings', 'conduit'],
    plumber: ['copper pipe', 'PVC pipe', 'fittings', 'taps', 'toilet suite', 'shower mixer']
  },
  
  rates: {
    builder: { hourly: 65, daily: 520 },
    electrician: { hourly: 75, daily: 600 },
    plumber: { hourly: 70, daily: 560 }
  },
  
  compliance: {
    daily: ['Site safety check', 'Tool tag verification', 'PPE compliance'],
    job: ['Building consent reference', 'Site Safe registration', 'Method statement']
  }
};

// User Profiles for Demo
const DEMO_PROFILES = {
  builder: {
    trade: 'builder',
    teamSize: 4,
    name: 'Dave',
    preferences: {
      featuresUsed: ['jobLogging', 'materials', 'quotes', 'progress'],
      dailySummary: true,
      photoUpload: false
    }
  },
  electrician: {
    trade: 'electrician', 
    teamSize: 2,
    name: 'Mike',
    preferences: {
      featuresUsed: ['jobLogging', 'materials', 'compliance'],
      dailySummary: true,
      photoUpload: true
    }
  }
};

const TradieAIAgent = () => {
  const [currentUser, setCurrentUser] = useState(DEMO_PROFILES.builder);
  const [activeJob, setActiveJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [voiceInput, setVoiceInput] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [showAlert, setShowAlert] = useState(null);

  // AI Command Processing
  const processVoiceCommand = (input) => {
    const command = input.toLowerCase();
    
    // Job Start
    if (command.startsWith('job start')) {
      const jobName = input.replace(/job start,?\s*/i, '');
      startNewJob(jobName);
    }
    // Material Tracking
    else if (command.includes('used')) {
      addMaterials(input);
    }
    // Quote Generation
    else if (command.startsWith('quote for')) {
      generateQuote(input);
    }
    // Progress Update
    else if (command.includes('complete') || command.includes('done')) {
      addProgress(input);
    }
    // Safety Check
    else if (command.includes('safety check')) {
      generateComplianceReport();
    }
    // Job Complete
    else if (command === 'job complete') {
      completeJob();
    }
    else {
      showAlertMessage('Command not recognized', 'Try: "Job start, [job name]" or "Used [materials]"');
    }
    
    setVoiceInput('');
  };

  const showAlertMessage = (title, message) => {
    setShowAlert({ title, message });
    setTimeout(() => setShowAlert(null), 3000);
  };

  const startNewJob = (jobName) => {
    const newJob = {
      id: Date.now(),
      name: jobName,
      startTime: new Date(),
      status: 'In Progress',
      location: 'Auckland, NZ', // Mock GPS
      materials: [],
      progress: [],
      compliance: [],
      timerRunning: true,
      elapsedTime: 0
    };
    
    setJobs(prev => [...prev, newJob]);
    setActiveJob(newJob);
    showAlertMessage('Job Started', `${jobName} - Timer running`);
  };

  const addMaterials = (input) => {
    if (!activeJob) {
      showAlertMessage('No Active Job', 'Start a job first');
      return;
    }

    // Parse materials from voice input
    const materialEntry = {
      id: Date.now(),
      timestamp: new Date(),
      description: input.replace(/used\s*/i, ''),
      cost: Math.floor(Math.random() * 200) + 50 // Mock cost
    };

    const updatedJob = {
      ...activeJob,
      materials: [...activeJob.materials, materialEntry]
    };

    setActiveJob(updatedJob);
    setJobs(prev => prev.map(job => job.id === activeJob.id ? updatedJob : job));
    showAlertMessage('Materials Logged', materialEntry.description);
  };

  const generateQuote = (input) => {
    const jobDescription = input.replace(/quote for\s*/i, '');
    const rate = NZ_TRADE_KNOWLEDGE.rates[currentUser.trade];
    
    // Extract days if mentioned
    const daysMatch = input.match(/(\d+)\s*days?/i);
    const days = daysMatch ? parseInt(daysMatch[1]) : 2;
    
    const quote = {
      id: Date.now(),
      description: jobDescription,
      labour: {
        days: days,
        rate: rate.daily,
        total: days * rate.daily
      },
      materials: generateMaterialsEstimate(currentUser.trade),
      markup: 0.15,
      timestamp: new Date()
    };
    
    const subtotal = quote.labour.total + quote.materials.total;
    quote.total = subtotal * (1 + quote.markup);
    
    setCurrentQuote(quote);
    setShowQuoteModal(true);
  };

  const generateMaterialsEstimate = (trade) => {
    const materials = NZ_TRADE_KNOWLEDGE.materials[trade];
    const estimate = materials.slice(0, 3).map(material => ({
      item: material,
      cost: Math.floor(Math.random() * 150) + 25
    }));
    
    return {
      items: estimate,
      total: estimate.reduce((sum, item) => sum + item.cost, 0)
    };
  };

  const addProgress = (input) => {
    if (!activeJob) {
      showAlertMessage('No Active Job', 'Start a job first');
      return;
    }

    const progressEntry = {
      id: Date.now(),
      timestamp: new Date(),
      description: input,
      percentage: Math.floor(Math.random() * 30) + 60 // Mock progress
    };

    const updatedJob = {
      ...activeJob,
      progress: [...activeJob.progress, progressEntry]
    };

    setActiveJob(updatedJob);
    setJobs(prev => prev.map(job => job.id === activeJob.id ? updatedJob : job));
    showAlertMessage('Progress Updated', `${progressEntry.percentage}% complete`);
  };

  const generateComplianceReport = () => {
    if (!activeJob) {
      showAlertMessage('No Active Job', 'Start a job first');
      return;
    }

    const complianceReport = {
      id: Date.now(),
      timestamp: new Date(),
      type: 'Daily Safety Check',
      items: NZ_TRADE_KNOWLEDGE.compliance.daily,
      jobReference: activeJob.name,
      inspector: currentUser.name,
      status: 'Compliant'
    };

    const updatedJob = {
      ...activeJob,
      compliance: [...activeJob.compliance, complianceReport]
    };

    setActiveJob(updatedJob);
    setJobs(prev => prev.map(job => job.id === activeJob.id ? updatedJob : job));
    showAlertMessage('Compliance Report', 'H&S report generated');
  };

  const completeJob = () => {
    if (!activeJob) {
      showAlertMessage('No Active Job', 'No job to complete');
      return;
    }

    const updatedJob = {
      ...activeJob,
      status: 'Complete',
      endTime: new Date(),
      timerRunning: false
    };

    setActiveJob(null);
    setJobs(prev => prev.map(job => job.id === activeJob.id ? updatedJob : job));
    showAlertMessage('Job Complete', `${updatedJob.name} finished`);
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (activeJob && activeJob.timerRunning) {
      interval = setInterval(() => {
        setActiveJob(prev => prev ? {...prev, elapsedTime: prev.elapsedTime + 1} : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeJob]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="mobile-container">
      {/* Alert Toast */}
      {showAlert && (
        <div className="alert-toast">
          <div className="alert-title">{showAlert.title}</div>
          <div className="alert-message">{showAlert.message}</div>
        </div>
      )}

      {/* Header */}
      <div className="header">
        <h1 className="header-title">Traide AI Agent</h1>
        <p className="user-info">{currentUser.name} - {currentUser.trade.charAt(0).toUpperCase() + currentUser.trade.slice(1)}</p>
      </div>

      {/* Voice Input */}
      <div className="voice-section">
        <textarea
          className="voice-input"
          placeholder="Say: 'Job start, Wilson deck build' or 'Used 20 2x4s'"
          value={voiceInput}
          onChange={(e) => setVoiceInput(e.target.value)}
          rows={3}
        />
        <button 
          className="process-button"
          onClick={() => processVoiceCommand(voiceInput)}
        >
          🎤 Process Command
        </button>
      </div>

      {/* Active Job Status */}
      {activeJob && (
        <div className="active-job-card">
          <h3 className="job-title">{activeJob.name}</h3>
          <div className="job-meta">
            <span className="job-status">Status: {activeJob.status}</span>
            <span className="timer">⏱️ {formatTime(activeJob.elapsedTime)}</span>
          </div>
          <p className="location">📍 {activeJob.location}</p>
        </div>
      )}

      {/* Quick Demo Commands */}
      <div className="demo-section">
        <h3 className="demo-title">Quick Demo Commands:</h3>
        <div className="demo-commands">
          {[
            'Job start, Wilson deck build',
            'Used 20 2x4s, found rotten beam',
            'Day complete, framing 80% done',
            'Safety check complete',
            'Quote for bathroom waterproofing, 3 days work'
          ].map((command, index) => (
            <button 
              key={index}
              className="demo-command"
              onClick={() => setVoiceInput(command)}
            >
              {command}
            </button>
          ))}
        </div>
      </div>

      {/* Job Details */}
      {activeJob && (
        <div className="job-details">
          {/* Materials */}
          {activeJob.materials.length > 0 && (
            <div className="section">
              <h4 className="section-title">🔧 Materials Used</h4>
              {activeJob.materials.map(material => (
                <div key={material.id} className="list-item">
                  <span>{material.description}</span>
                  <span className="cost">${material.cost}</span>
                </div>
              ))}
            </div>
          )}

          {/* Progress */}
          {activeJob.progress.length > 0 && (
            <div className="section">
              <h4 className="section-title">📈 Progress Updates</h4>
              {activeJob.progress.map(update => (
                <div key={update.id} className="list-item">
                  <span>{update.description}</span>
                  <span className="percentage">{update.percentage}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Compliance */}
          {activeJob.compliance.length > 0 && (
            <div className="section">
              <h4 className="section-title">✅ Compliance Reports</h4>
              {activeJob.compliance.map(report => (
                <div key={report.id} className="list-item">
                  <span>{report.type}</span>
                  <span className="status">{report.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="modal-overlay" onClick={() => setShowQuoteModal(false)}>
          <div className="quote-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">💼 Quote Generated</h3>
            {currentQuote && (
              <>
                <p className="quote-description">{currentQuote.description}</p>
                <div className="quote-breakdown">
                  <div className="quote-line">Labour ({currentQuote.labour.days} days): ${currentQuote.labour.total}</div>
                  <div className="quote-line">Materials: ${currentQuote.materials.total}</div>
                  <div className="quote-line">Markup (15%): ${Math.round(currentQuote.total - currentQuote.labour.total - currentQuote.materials.total)}</div>
                  <div className="quote-total">Total: ${Math.round(currentQuote.total)}</div>
                </div>
                <button 
                  className="send-quote-button"
                  onClick={() => {
                    showAlertMessage('Quote Sent', 'Professional quote sent to client');
                    setShowQuoteModal(false);
                  }}
                >
                  📧 Send Quote to Client
                </button>
              </>
            )}
            <button 
              className="close-button"
              onClick={() => setShowQuoteModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* User Profile Switcher */}
      <div className="profile-switcher">
        <button 
          className={`profile-button ${currentUser.trade === 'builder' ? 'active' : ''}`}
          onClick={() => setCurrentUser(DEMO_PROFILES.builder)}
        >
          🔨 Dave (Builder)
        </button>
        <button 
          className={`profile-button ${currentUser.trade === 'electrician' ? 'active' : ''}`}
          onClick={() => setCurrentUser(DEMO_PROFILES.electrician)}
        >
          ⚡ Mike (Sparky)
        </button>
      </div>

      <style jsx>{`
        .mobile-container {
          max-width: 375px;
          margin: 0 auto;
          min-height: 100vh;
          background: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: relative;
        }

        .alert-toast {
          position: fixed;
          top: 20px;
          left: 20px;
          right: 20px;
          background: #333;
          color: white;
          padding: 15px;
          border-radius: 10px;
          z-index: 1000;
          animation: slideDown 0.3s ease;
        }

        .alert-title {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .alert-message {
          font-size: 14px;
          opacity: 0.9;
        }

        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .header {
          background: linear-gradient(135deg, #2c5aa0, #1e3a6f);
          color: white;
          padding: 20px;
          text-align: center;
        }

        .header-title {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
        }

        .user-info {
          margin: 5px 0 0 0;
          opacity: 0.8;
          font-size: 14px;
        }

        .voice-section {
          background: white;
          margin: 15px;
          padding: 15px;
          border-radius: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .voice-input {
          width: 100%;
          border: 2px solid #e0e0e0;
          padding: 12px;
          border-radius: 10px;
          font-size: 16px;
          resize: none;
          font-family: inherit;
        }

        .voice-input:focus {
          outline: none;
          border-color: #2c5aa0;
        }

        .process-button {
          width: 100%;
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
          border: none;
          padding: 15px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          margin-top: 10px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .process-button:hover {
          transform: scale(1.02);
        }

        .active-job-card {
          background: linear-gradient(135deg, #e8f5e8, #d4edda);
          margin: 15px;
          padding: 15px;
          border-radius: 15px;
          border-left: 4px solid #4caf50;
        }

        .job-title {
          margin: 0 0 10px 0;
          font-size: 18px;
          font-weight: bold;
          color: #2d5016;
        }

        .job-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .job-status {
          color: #666;
          font-size: 14px;
        }

        .timer {
          font-weight: bold;
          color: #ff6b35;
          font-size: 16px;
        }

        .location {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .demo-section {
          padding: 0 15px;
          margin-bottom: 15px;
        }

        .demo-title {
          margin: 0 0 10px 0;
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }

        .demo-commands {
          display: flex;
          overflow-x: auto;
          gap: 10px;
          padding-bottom: 10px;
        }

        .demo-command {
          background: #e3f2fd;
          border: none;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          color: #1976d2;
          white-space: nowrap;
          cursor: pointer;
          transition: background 0.2s;
        }

        .demo-command:hover {
          background: #bbdefb;
        }

        .job-details {
          padding: 0 15px;
          flex: 1;
        }

        .section {
          background: white;
          padding: 15px;
          border-radius: 15px;
          margin-bottom: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .section-title {
          margin: 0 0 15px 0;
          font-size: 16px;
          font-weight: bold;
          color: #333;
        }

        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .list-item:last-child {
          border-bottom: none;
        }

        .cost {
          color: #ff6b35;
          font-weight: bold;
        }

        .percentage {
          color: #4caf50;
          font-weight: bold;
        }

        .status {
          color: #4caf50;
          font-size: 12px;
          background: #e8f5e8;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .quote-modal {
          background: white;
          margin: 20px;
          padding: 20px;
          border-radius: 15px;
          width: calc(100% - 40px);
          max-width: 350px;
        }

        .modal-title {
          margin: 0 0 15px 0;
          font-size: 20px;
          font-weight: bold;
          color: #333;
        }

        .quote-description {
          font-size: 16px;
          margin-bottom: 15px;
          color: #666;
        }

        .quote-breakdown {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 10px;
          margin-bottom: 15px;
        }

        .quote-line {
          margin-bottom: 8px;
          color: #666;
        }

        .quote-total {
          font-size: 18px;
          font-weight: bold;
          color: #2c5aa0;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #e0e0e0;
        }

        .send-quote-button {
          width: 100%;
          background: linear-gradient(135deg, #4caf50, #45a049);
          color: white;
          border: none;
          padding: 15px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          cursor: pointer;
        }

        .close-button {
          width: 100%;
          background: #f0f0f0;
          border: none;
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
        }

        .profile-switcher {
          display: flex;
          background: white;
          padding: 10px;
          gap: 10px;
        }

        .profile-button {
          flex: 1;
          padding: 12px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .profile-button.active {
          background: #2c5aa0;
          color: white;
          border-color: #2c5aa0;
        }

        .profile-button:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default TradieAIAgent;
