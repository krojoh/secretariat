import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Users, FileText, Award, Settings, Download, Save, Eye, Edit3, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Trash2, Check, X } from 'lucide-react';

// Sample data - replace with your actual data
const sampleData = {
  registrations: [
    { regNumber: "07-0001-01", callName: "BJ", handlerName: "Shirley Ottmer" },
    { regNumber: "07-0001-02", callName: "Jaidon", handlerName: "Shirley Ottmer" },
    { regNumber: "07-0001-03", callName: "Jake", handlerName: "Shirley Ottmer" },
    { regNumber: "07-0001-04", callName: "Ozone", handlerName: "Shirley Ottmer" },
    { regNumber: "07-0002-01", callName: "Liz", handlerName: "Russ Hornfisher" },
    { regNumber: "07-0002-02", callName: "Morgan", handlerName: "Russ Hornfisher" },
    { regNumber: "07-0003-01", callName: "Julie", handlerName: "Bonnie Hornfisher" },
    { regNumber: "07-0003-02", callName: "Becky", handlerName: "Bonnie Hornfisher" },
    { regNumber: "07-0003-03", callName: "Ben", handlerName: "Bonnie Hornfisher" },
  ],
  classes: [
    "Patrol 1", "Detective 2", "Investigator 3", "Super Sleuth 4", "Private Inv", 
    "Det Diversions", "Ranger 1", "Ranger 2", "Ranger 3", "Ranger 4", "Ranger 5",
    "Dasher 3", "Dasher 4", "Dasher 5", "Dasher 6", "Obedience 1", "Obedience 2",
    "Obedience 3", "Obedience 4", "Obedience 5", "Starter", "Advanced", "Pro", "ARF",
    "Zoom 1", "Zoom 1.5", "Zoom 2", "Games 1", "Games 2", "Games 3", "Games 4"
  ],
  judges: [
    "Linda Alberda", "Ginger Alpine", "Paige Alpine-Malone", "Anita Ambani", "Denise Ames",
    "Youlia Anderson", "Cindy Angiulo", "Kalma Arnett", "Amy Atkinson", "Natasha Audy",
    "Danica Auld", "Melanie Baker", "Cheramie Barbazuk", "Stephanie Barber", "Jeannine Barbour",
    "Doreen Barren", "Tricia Barstow", "Lisa Bataska", "Ryan Baugher", "Hope Bean"
  ]
};

const DogSportsLeague = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('login');
  const [trials, setTrials] = useState([]);
  const [currentTrial, setCurrentTrial] = useState(null);
  const [trialForm, setTrialForm] = useState({ name: '', days: 1, daysData: [] });
  const [entries, setEntries] = useState([]);
  const [runningOrder, setRunningOrder] = useState({});
  const [scoreSheets, setScoreSheets] = useState({});

  // Load data from localStorage
  useEffect(() => {
    const savedTrials = localStorage.getItem('dogSportsTrials');
    if (savedTrials) {
      setTrials(JSON.parse(savedTrials));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (trials.length > 0) {
      localStorage.setItem('dogSportsTrials', JSON.stringify(trials));
    }
  }, [trials]);

  // Authentication
  const handleLogin = (username, password, isAdmin = false) => {
    setCurrentUser({ username, isAdmin });
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    setCurrentTrial(null);
  };

  // Trial Creation Functions
  const initializeTrialForm = (days) => {
    const daysData = Array.from({ length: days }, (_, index) => ({
      date: '',
      classes: [{
        className: '',
        rounds: 1,
        judges: [''],
        feoOffered: false
      }]
    }));
    setTrialForm({ ...trialForm, days, daysData });
  };

  const updateDayData = (dayIndex, field, value) => {
    const updatedDays = [...trialForm.daysData];
    updatedDays[dayIndex] = { ...updatedDays[dayIndex], [field]: value };
    setTrialForm({ ...trialForm, daysData: updatedDays });
  };

  const addClassToDay = (dayIndex) => {
    const updatedDays = [...trialForm.daysData];
    updatedDays[dayIndex].classes.push({
      className: '',
      rounds: 1,
      judges: [''],
      feoOffered: false
    });
    setTrialForm({ ...trialForm, daysData: updatedDays });
  };

  const updateClassData = (dayIndex, classIndex, field, value) => {
    const updatedDays = [...trialForm.daysData];
    updatedDays[dayIndex].classes[classIndex] = {
      ...updatedDays[dayIndex].classes[classIndex],
      [field]: value
    };
    setTrialForm({ ...trialForm, daysData: updatedDays });
  };

  const createTrial = () => {
    const newTrial = {
      id: Date.now(),
      name: trialForm.name,
      creator: currentUser.username,
      daysData: trialForm.daysData,
      entries: [],
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    setTrials([...trials, newTrial]);
    setCurrentTrial(newTrial);
    setTrialForm({ name: '', days: 1, daysData: [] });
    setCurrentView('trial-application');
  };

  const selectTrial = (trial) => {
    setCurrentTrial(trial);
    setEntries(trial.entries || []);
    setCurrentView('trial-management');
  };

  // Entry Management
  const submitEntry = (entryData) => {
    if (currentTrial) {
      const newEntry = { ...entryData, id: Date.now(), submittedAt: new Date().toISOString() };
      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      
      // Update current trial
      const updatedTrials = trials.map(trial => 
        trial.id === currentTrial.id 
          ? { ...trial, entries: updatedEntries }
          : trial
      );
      setTrials(updatedTrials);
      setCurrentTrial({ ...currentTrial, entries: updatedEntries });
    }
  };

  // Running Order Management
  const generateRunningOrder = () => {
    if (!currentTrial) return;

    const orderByDay = {};
    currentTrial.daysData.forEach((day, dayIndex) => {
      day.classes.forEach((classInfo, classIndex) => {
        for (let round = 1; round <= classInfo.rounds; round++) {
          const key = `${dayIndex}-${classIndex}-${round}`;
          const classEntries = entries.filter(entry => 
            entry.selectedClasses && entry.selectedClasses.includes(classInfo.className)
          );
          orderByDay[key] = {
            date: day.date,
            className: classInfo.className,
            round,
            judge: classInfo.judges[0] || '',
            entries: classEntries.map((entry, index) => ({ ...entry, position: index + 1 }))
          };
        }
      });
    });
    setRunningOrder(orderByDay);
    setCurrentView('running-order');
  };

  // Score Sheet Generation
  const generateScoreSheets = () => {
    const sheets = {};
    Object.keys(runningOrder).forEach(key => {
      const orderData = runningOrder[key];
      sheets[key] = {
        ...orderData,
        scores: orderData.entries.map(entry => ({
          regNumber: entry.regNumber,
          callName: entry.callName,
          handlerName: entry.handlerName,
          scent1: '',
          scent2: '',
          scent3: '',
          scent4: '',
          fault1: '',
          fault2: '',
          time: '',
          passOrFail: ''
        }))
      };
    });
    setScoreSheets(sheets);
    setCurrentView('score-sheets');
  };

  // Component Renders
  const renderLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Award className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Dog Sports League</h1>
          <p className="text-gray-600">Trial Management System</p>
        </div>
        
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Dog Sports League</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {currentUser.username}</span>
              <button
                onClick={() => setCurrentView('create-trial')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Trial
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {trials.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trials yet</h3>
            <p className="text-gray-600 mb-6">Create your first trial to get started</p>
            <button
              onClick={() => setCurrentView('create-trial')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center mx-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create First Trial
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trials
              .filter(trial => currentUser.isAdmin || trial.creator === currentUser.username)
              .map(trial => (
                <TrialCard key={trial.id} trial={trial} onSelect={selectTrial} />
              ))}
          </div>
        )}
      </main>
    </div>
  );

  const renderCreateTrial = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="text-indigo-600 hover:text-indigo-800 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Trial</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <CreateTrialForm
          trialForm={trialForm}
          setTrialForm={setTrialForm}
          onInitializeDays={initializeTrialForm}
          onUpdateDay={updateDayData}
          onAddClass={addClassToDay}
          onUpdateClass={updateClassData}
          onCreateTrial={createTrial}
          sampleData={sampleData}
        />
      </main>
    </div>
  );

  // Main render
  switch (currentView) {
    case 'login':
      return renderLogin();
    case 'dashboard':
      return renderDashboard();
    case 'create-trial':
      return renderCreateTrial();
    case 'trial-application':
      return <TrialApplication trial={currentTrial} onBack={() => setCurrentView('dashboard')} />;
    case 'trial-management':
      return (
        <TrialManagement
          trial={currentTrial}
          entries={entries}
          onBack={() => setCurrentView('dashboard')}
          onOpenEntryForm={() => setCurrentView('entry-form')}
          onGenerateRunningOrder={generateRunningOrder}
        />
      );
    case 'entry-form':
      return (
        <EntryForm
          trial={currentTrial}
          sampleData={sampleData}
          onSubmit={submitEntry}
          onBack={() => setCurrentView('trial-management')}
        />
      );
    case 'running-order':
      return (
        <RunningOrderView
          runningOrder={runningOrder}
          setRunningOrder={setRunningOrder}
          onConfirm={generateScoreSheets}
          onBack={() => setCurrentView('trial-management')}
        />
      );
    case 'score-sheets':
      return (
        <ScoreSheetView
          scoreSheets={scoreSheets}
          setScoreSheets={setScoreSheets}
          onBack={() => setCurrentView('trial-management')}
        />
      );
    default:
      return renderDashboard();
  }
};

// Login Form Component
const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const isAdmin = username === 'admin';
    onLogin(username, password, isAdmin);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Sign In
      </button>
      <div className="text-sm text-gray-600 text-center">
        <p>Demo accounts:</p>
        <p><strong>Username:</strong> admin (sees all trials)</p>
        <p><strong>Username:</strong> user (sees own trials only)</p>
        <p><strong>Password:</strong> any password</p>
      </div>
    </form>
  );
};

// Trial Card Component
const TrialCard = ({ trial, onSelect }) => (
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{trial.name}</h3>
    <p className="text-gray-600 mb-2">Created by: {trial.creator}</p>
    <p className="text-gray-600 mb-4">
      Entries: {trial.entries ? trial.entries.length : 0}
    </p>
    <div className="flex items-center justify-between">
      <span className={`px-2 py-1 rounded-full text-sm ${
        trial.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
      }`}>
        {trial.status}
      </span>
      <button
        onClick={() => onSelect(trial)}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        Manage
      </button>
    </div>
  </div>
);

// Create Trial Form Component
const CreateTrialForm = ({ trialForm, setTrialForm, onInitializeDays, onUpdateDay, onAddClass, onUpdateClass, onCreateTrial, sampleData }) => {
  const [classFilter, setClassFilter] = useState({});

  const handleDaysChange = (days) => {
    setTrialForm({ ...trialForm, days });
    onInitializeDays(days);
  };

  const filteredClasses = (filter) => {
    return sampleData.classes.filter(className =>
      className.toLowerCase().includes((filter || '').toLowerCase())
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Trial</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trial Name</label>
          <input
            type="text"
            value={trialForm.name}
            onChange={(e) => setTrialForm({ ...trialForm, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter trial name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Days</label>
          <select
            value={trialForm.days}
            onChange={(e) => handleDaysChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {[1,2,3,4,5,6,7,8,9,10].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        {trialForm.daysData.map((day, dayIndex) => (
          <div key={dayIndex} className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Day {dayIndex + 1}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={day.date}
                onChange={(e) => onUpdateDay(dayIndex, 'date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Classes</h4>
              {day.classes.map((classInfo, classIndex) => (
                <div key={classIndex} className="border border-gray-100 rounded p-3 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                      <input
                        type="text"
                        value={classInfo.className}
                        onChange={(e) => {
                          onUpdateClass(dayIndex, classIndex, 'className', e.target.value);
                          setClassFilter({ ...classFilter, [`${dayIndex}-${classIndex}`]: e.target.value });
                        }}
                        list={`classes-${dayIndex}-${classIndex}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Start typing class name..."
                      />
                      <datalist id={`classes-${dayIndex}-${classIndex}`}>
                        {filteredClasses(classFilter[`${dayIndex}-${classIndex}`] || '').map(className => (
                          <option key={className} value={className} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rounds</label>
                      <select
                        value={classInfo.rounds}
                        onChange={(e) => onUpdateClass(dayIndex, classIndex, 'rounds', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judge</label>
                    <input
                      type="text"
                      value={classInfo.judges[0] || ''}
                      onChange={(e) => {
                        const newJudges = [...classInfo.judges];
                        newJudges[0] = e.target.value;
                        onUpdateClass(dayIndex, classIndex, 'judges', newJudges);
                      }}
                      list="judges-list"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Start typing judge name..."
                    />
                    <datalist id="judges-list">
                      {sampleData.judges.map(judge => (
                        <option key={judge} value={judge} />
                      ))}
                    </datalist>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={classInfo.feoOffered}
                      onChange={(e) => onUpdateClass(dayIndex, classIndex, 'feoOffered', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">FEO Offered</label>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => onAddClass(dayIndex)}
                className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Another Class
              </button>
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <button
            onClick={onCreateTrial}
            disabled={!trialForm.name}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Create Trial
          </button>
        </div>
      </div>
    </div>
  );
};

// Trial Application Component
const TrialApplication = ({ trial, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 mb-4">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Trial Application</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">{trial.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Trial Information</h3>
              <div className="space-y-2">
                <p><strong>Trial Dates:</strong></p>
                {trial.daysData.map((day, index) => (
                  <p key={index} className="ml-4">Day {index + 1}: {day.date || 'Not set'}</p>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Classes & Judges</h3>
              <div className="space-y-2">
                {trial.daysData.map((day, dayIndex) => 
                  day.classes.map((classInfo, classIndex) => (
                    <div key={`${dayIndex}-${classIndex}`} className="ml-4 text-sm">
                      <p><strong>{classInfo.className}</strong> - {classInfo.judges[0] || 'TBD'}</p>
                      <p className="text-gray-600">Rounds: {classInfo.rounds} {classInfo.feoOffered && '(FEO Available)'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold mb-4">C-WAGS Advocates</h3>
            <div className="space-y-2">
              {trial.daysData.map((day, dayIndex) => 
                day.classes.map((classInfo, classIndex) => (
                  <div key={`${dayIndex}-${classIndex}`} className="flex items-center space-x-4">
                    <span className="w-40">{classInfo.className}:</span>
                    <input
                      type="text"
                      placeholder="Advocate name"
                      className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold mb-4">Waiver Text</h3>
            <textarea
              placeholder="Enter club waiver text here..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700">
              Save Draft
            </button>
            <button 
              onClick={onBack}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Continue to Trial Management
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Trial Management Component
const TrialManagement = ({ trial, entries, onBack, onOpenEntryForm, onGenerateRunningOrder }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 mb-4">
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Trial Management - {trial.name}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Trial Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={onOpenEntryForm}
                  className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Entry
                </button>
                <button
                  onClick={onGenerateRunningOrder}
                  disabled={entries.length === 0}
                  className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Generate Running Order
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Entries ({entries.length})</h3>
              {entries.length === 0 ? (
                <p className="text-gray-600">No entries yet. Add the first entry to get started.</p>
              ) : (
                <div className="space-y-2">
                  {entries.map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                      <div>
                        <p className="font-medium">{entry.callName} - {entry.handlerName}</p>
                        <p className="text-sm text-gray-600">{entry.regNumber}</p>
                        <p className="text-sm text-gray-600">Classes: {entry.selectedClasses.join(', ')}</p>
                      </div>
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Trial Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {trial.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Creator</p>
                  <p className="text-sm text-gray-600">{trial.creator}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Classes Offered</p>
                  <div className="text-sm text-gray-600">
                    {trial.daysData.map((day, dayIndex) => 
                      day.classes.map((classInfo, classIndex) => (
                        <p key={`${dayIndex}-${classIndex}`}>• {classInfo.className}</p>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Entry Form Component
const EntryForm = ({ trial, sampleData, onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    regNumber: '',
    callName: '',
    handlerName: '',
    selectedClasses: [],
    waiverAccepted: false
  });

  const handleRegNumberChange = (regNumber) => {
    const registration = sampleData.registrations.find(reg => reg.regNumber === regNumber);
    if (registration) {
      setFormData({
        ...formData,
        regNumber,
        callName: registration.callName,
        handlerName: registration.handlerName
      });
    } else {
      setFormData({ ...formData, regNumber, callName: '', handlerName: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.waiverAccepted && formData.selectedClasses.length > 0) {
      onSubmit(formData);
      setFormData({
        regNumber: '',
        callName: '',
        handlerName: '',
        selectedClasses: [],
        waiverAccepted: false
      });
      alert('Entry submitted successfully!');
    }
  };

  const availableClasses = trial.daysData.flatMap(day => 
    day.classes.map(classInfo => classInfo.className)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 mb-4">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Entry Form - {trial.name}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={formData.waiverAccepted}
                onChange={(e) => setFormData({ ...formData, waiverAccepted: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                I have read and accept the waiver
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
              <input
                type="text"
                value={formData.regNumber}
                onChange={(e) => handleRegNumberChange(e.target.value)}
                list="reg-numbers"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter registration number"
                required
              />
              <datalist id="reg-numbers">
                {sampleData.registrations.map(reg => (
                  <option key={reg.regNumber} value={reg.regNumber} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Call Name</label>
              <input
                type="text"
                value={formData.callName}
                onChange={(e) => setFormData({ ...formData, callName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Dog's call name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Handler Name</label>
              <input
                type="text"
                value={formData.handlerName}
                onChange={(e) => setFormData({ ...formData, handlerName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Handler's name"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">Select Classes</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableClasses.map((className, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.selectedClasses.includes(className)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          selectedClasses: [...formData.selectedClasses, className]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          selectedClasses: formData.selectedClasses.filter(c => c !== className)
                        });
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">{className}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.waiverAccepted || formData.selectedClasses.length === 0}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Submit Entry
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

// Running Order View Component
const RunningOrderView = ({ runningOrder, setRunningOrder, onConfirm, onBack }) => {
  const [orderData, setOrderData] = useState(runningOrder);
  const [confirmed, setConfirmed] = useState(false);

  const moveEntry = (key, fromIndex, toIndex) => {
    const updated = { ...orderData };
    const entries = [...updated[key].entries];
    const [moved] = entries.splice(fromIndex, 1);
    entries.splice(toIndex, 0, moved);
    updated[key] = { ...updated[key], entries };
    setOrderData(updated);
    setRunningOrder(updated);
  };

  const confirmOrder = () => {
    setConfirmed(true);
    onConfirm();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 mb-4">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Running Order</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(orderData).map(([key, data]) => (
            <RunningOrderColumn
              key={key}
              data={data}
              onMoveEntry={(fromIndex, toIndex) => moveEntry(key, fromIndex, toIndex)}
              confirmed={confirmed}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={confirmOrder}
            disabled={confirmed}
            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {confirmed ? 'Order Confirmed ✓' : 'Confirm Running Orders'}
          </button>
        </div>
      </main>
    </div>
  );
};

// Running Order Column Component
const RunningOrderColumn = ({ data, onMoveEntry, confirmed }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="mb-4">
        <h3 className="font-bold text-lg">{data.className}</h3>
        <p className="text-gray-600">Round {data.round}</p>
        <p className="text-gray-600">{data.date}</p>
        <p className="text-gray-600">Judge: {data.judge}</p>
      </div>

      <div className="space-y-2">
        {data.entries.map((entry, index) => (
          <div key={entry.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
            <div className="flex-1">
              <p className="font-medium">{entry.callName}</p>
              <p className="text-sm text-gray-600">{entry.handlerName}</p>
              <p className="text-xs text-gray-500">{entry.regNumber}</p>
            </div>
            
            {!confirmed && (
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => index > 0 && onMoveEntry(index, index - 1)}
                  disabled={index === 0}
                  className="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-300"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => index < data.entries.length - 1 && onMoveEntry(index, index + 1)}
                  disabled={index === data.entries.length - 1}
                  className="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-300"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Score Sheet View Component
const ScoreSheetView = ({ scoreSheets, setScoreSheets, onBack }) => {
  const [selectedSheet, setSelectedSheet] = useState(Object.keys(scoreSheets)[0] || null);
  const [scores, setScores] = useState(scoreSheets);

  const updateScore = (sheetKey, entryIndex, field, value) => {
    const updated = { ...scores };
    updated[sheetKey].scores[entryIndex] = {
      ...updated[sheetKey].scores[entryIndex],
      [field]: value
    };
    setScores(updated);
    setScoreSheets(updated);
  };

  const saveScores = () => {
    localStorage.setItem('dogSportsScores', JSON.stringify(scores));
    alert('Scores saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 mb-4">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Score Sheets</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <h3 className="font-semibold mb-4">Score Sheets</h3>
            <div className="space-y-2">
              {Object.entries(scores).map(([key, sheet]) => (
                <button
                  key={key}
                  onClick={() => setSelectedSheet(key)}
                  className={`w-full text-left p-3 rounded border ${
                    selectedSheet === key 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium">{sheet.className}</p>
                  <p className="text-sm text-gray-600">Round {sheet.round}</p>
                  <p className="text-sm text-gray-600">{sheet.date}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedSheet && (
              <ScoreSheetForm
                sheet={scores[selectedSheet]}
                onUpdateScore={(entryIndex, field, value) => 
                  updateScore(selectedSheet, entryIndex, field, value)
                }
                onSave={saveScores}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Score Sheet Form Component
const ScoreSheetForm = ({ sheet, onUpdateScore, onSave }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold">{sheet.className} - Round {sheet.round}</h3>
        <p className="text-gray-600">Date: {sheet.date} | Judge: {sheet.judge}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-2 text-left">Team</th>
              <th className="border border-gray-300 p-2">Scent 1</th>
              <th className="border border-gray-300 p-2">Scent 2</th>
              <th className="border border-gray-300 p-2">Scent 3</th>
              <th className="border border-gray-300 p-2">Scent 4</th>
              <th className="border border-gray-300 p-2">Fault</th>
              <th className="border border-gray-300 p-2">Time</th>
              <th className="border border-gray-300 p-2">Pass/Fail</th>
            </tr>
          </thead>
          <tbody>
            {sheet.scores.map((score, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">
                  <div>
                    <p className="font-medium">{score.callName}</p>
                    <p className="text-sm text-gray-600">{score.handlerName}</p>
                  </div>
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={score.scent1}
                    onChange={(e) => onUpdateScore(index, 'scent1', e.target.value)}
                    className="w-full p-1 border border-gray-200 rounded text-center"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={score.scent2}
                    onChange={(e) => onUpdateScore(index, 'scent2', e.target.value)}
                    className="w-full p-1 border border-gray-200 rounded text-center"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={score.scent3}
                    onChange={(e) => onUpdateScore(index, 'scent3', e.target.value)}
                    className="w-full p-1 border border-gray-200 rounded text-center"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={score.scent4}
                    onChange={(e) => onUpdateScore(index, 'scent4', e.target.value)}
                    className="w-full p-1 border border-gray-200 rounded text-center"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={score.fault1}
                    onChange={(e) => onUpdateScore(index, 'fault1', e.target.value)}
                    className="w-full p-1 border border-gray-200 rounded text-center"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={score.time}
                    onChange={(e) => onUpdateScore(index, 'time', e.target.value)}
                    className="w-full p-1 border border-gray-200 rounded text-center"
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <select
                    value={score.passOrFail}
                    onChange={(e) => onUpdateScore(index, 'passOrFail', e.target.value)}
                    className="w-full p-1 border border-gray-200 rounded text-center"
                  >
                    <option value="">-</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end space-x-4">
        <button 
          onClick={onSave}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Scores
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Print/Export PDF
        </button>
      </div>
    </div>
  );
};

export default DogSportsLeague;
