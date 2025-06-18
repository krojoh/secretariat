// Navigation and Dashboard Functions

// Main navigation function - NEVER disable tabs
function showTab(tabName, element) {
    // Hide all tab contents
    var tabContents = document.querySelectorAll('.tab-content');
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Remove active class from all nav tabs
    var navTabs = document.querySelectorAll('.nav-tab');
    for (var i = 0; i < navTabs.length; i++) {
        navTabs[i].classList.remove('active');
    }
    
    // Show selected tab content
    if (document.getElementById(tabName)) {
        document.getElementById(tabName).classList.add('active');
    }
    
    // Add active class to clicked tab
    if (element) {
        element.classList.add('active');
    }
    
    // Tab-specific loading - with trial selection
    if (tabName === 'trials') {
        loadUserTrials();
    } else if (tabName === 'entry') {
        loadEntryFormTabWithTrialSelection();
    } else if (tabName === 'results') {
        loadResultsTabWithTrialSelection();
    } else if (tabName === 'cross-reference') {
        loadCrossReferenceTabWithTrialSelection();
    } else if (tabName === 'running-order') {
        loadRunningOrderTabWithTrialSelection();
    } else if (tabName === 'score-sheets') {
        loadScoreSheetsTabWithTrialSelection();
    } else if (tabName === 'reports') {
        loadReportsTabWithTrialSelection();
    } else if (tabName === 'score-entry') {
        loadScoreEntryTabWithTrialSelection();
    }
}

// Enhanced entry form tab with trial selection
function loadEntryFormTabWithTrialSelection() {
    var container = document.getElementById('entryContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3>Entry Management</h3>
            ${generateTrialSelector('entry')}
            <div id="selectedTrialEntry" style="margin-top: 20px;">
                <p style="color: #666;">Select a trial above to manage entries.</p>
            </div>
        </div>
    `;
}

// Enhanced results tab with trial selection
function loadResultsTabWithTrialSelection() {
    var container = document.getElementById('resultsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3>Trial Results</h3>
            ${generateTrialSelector('results')}
            <div id="selectedTrialResults" style="margin-top: 20px;">
                <p style="color: #666;">Select a trial above to view results.</p>
            </div>
        </div>
    `;
}

// Generate trial selector dropdown
function generateTrialSelector(context) {
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var userTrials = JSON.parse(localStorage.getItem('trials_' + (currentUser ? currentUser.username : 'guest')) || '{}');
    
    // Combine all trials (user trials and public trials)
    var allTrials = {};
    Object.assign(allTrials, publicTrials);
    Object.assign(allTrials, userTrials);
    
    var trialOptions = '<option value="">-- Select a Trial --</option>';
    
    Object.keys(allTrials).forEach(function(trialId) {
        var trial = allTrials[trialId];
        var entryCount = trial.results ? trial.results.length : 0;
        var owner = trial.owner || 'Unknown';
        var isMyTrial = currentUser && trial.owner === currentUser.username;
        
        trialOptions += `<option value="${trialId}" data-context="${context}">
            ${trial.name || 'Unnamed Trial'} 
            (${entryCount} entries) 
            ${isMyTrial ? '[MY TRIAL]' : '[' + owner + ']'}
        </option>`;
    });
    
    return `
        <div style="background: #e8f4f8; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <label style="display: block; font-weight: bold; margin-bottom: 10px; color: #2c5aa0;">
                🎯 Select Trial to Work With:
            </label>
            <select onchange="selectTrialForContext(this.value, '${context}')" style="width: 100%; padding: 10px; border: 2px solid #2c5aa0; border-radius: 8px; font-size: 16px; background: white;">
                ${trialOptions}
            </select>
        </div>
    `;
}

// Handle trial selection for different contexts
function selectTrialForContext(trialId, context) {
    if (!trialId) return;
    
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var userTrials = JSON.parse(localStorage.getItem('trials_' + (currentUser ? currentUser.username : 'guest')) || '{}');
    
    var trial = publicTrials[trialId] || userTrials[trialId];
    if (!trial) {
        alert('Trial not found');
        return;
    }
    
    // Set global trial data
    currentTrialId = trialId;
    trialConfig = trial.config || [];
    entryResults = trial.results || [];
    
    // Update context-specific display
    if (context === 'entry') {
        updateEntryContext(trial);
    } else if (context === 'results') {
        updateResultsContext(trial);
    } else if (context === 'cross-reference') {
        updateCrossReferenceContext(trial);
    } else if (context === 'running-order') {
        updateRunningOrderContext(trial);
    } else if (context === 'score-sheets') {
        updateScoreSheetsContext(trial);
    } else if (context === 'reports') {
        updateReportsContext(trial);
    } else if (context === 'score-entry') {
        updateScoreEntryContext(trial);
    }
}

// Update entry management for selected trial
function updateEntryContext(trial) {
    var container = document.getElementById('selectedTrialEntry');
    if (!container) return;
    
    var entries = trial.results || [];
    
    container.innerHTML = `
        <div style="border: 2px solid #28a745; border-radius: 10px; padding: 20px; background: #f8fff8;">
            <h4 style="margin: 0 0 15px 0; color: #28a745;">
                📝 ${trial.name || 'Unnamed Trial'} - Entry Management
            </h4>
            <p style="color: #666; margin-bottom: 20px;">
                <strong>Club:</strong> ${trial.clubName || 'N/A'} | 
                <strong>Location:</strong> ${trial.location || 'N/A'} | 
                <strong>Classes:</strong> ${trial.config ? trial.config.length : 0} | 
                <strong>Current Entries:</strong> ${entries.length}
            </p>
            
            <div style="display: flex; gap: 15px; margin-bottom: 25px;">
                <button onclick="showJuneLeagueEntryForm()" style="background: #28a745; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold;">➕ Add New Entry</button>
                <button onclick="showAllEntriesForTrial()" style="background: #17a2b8; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold;">📋 View All Entries</button>
                <button onclick="exportEntries()" style="background: #ffc107; color: black; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold;">📤 Export Entries</button>
            </div>
            
            ${entries.length > 0 ? generateEntriesPreview() : '<p style="color: #666; text-align: center; padding: 20px;">No entries yet. Click "Add New Entry" to get started.</p>'}
        </div>
    `;
}

// Update results display for selected trial
function updateResultsContext(trial) {
    var container = document.getElementById('selectedTrialResults');
    if (!container) return;
    
    var entries = trial.results || [];
    
    container.innerHTML = `
        <div style="border: 2px solid #667eea; border-radius: 10px; padding: 20px; background: #f8f9ff;">
            <h4 style="margin: 0 0 15px 0; color: #667eea;">
                📊 ${trial.name || 'Unnamed Trial'} - Results
            </h4>
            <p style="color: #666; margin-bottom: 20px;">
                <strong>Total Entries:</strong> ${entries.length} | 
                <strong>Classes:</strong> ${trial.config ? trial.config.length : 0}
            </p>
            
            ${entries.length > 0 ? generateDetailedEntriesTable(entries) : '<p style="color: #666; text-align: center; padding: 40px;">No entries to display results for.</p>'}
        </div>
    `;
}

// Generate detailed entries table
function generateDetailedEntriesTable(entries) {
    var html = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">#</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Dog Name</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Registration</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Handler</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Email</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Classes Entered</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Entry Date</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    entries.forEach(function(entry, index) {
        var classes = Array.isArray(entry.trials) ? 
            entry.trials.map(function(t) { return t.class + ' R' + t.round + (t.type === 'feo' ? ' (FEO)' : ''); }).join(', ') : 
            (entry.trialClass || 'N/A');
        
        var entryDate = entry.entryDate ? new Date(entry.entryDate).toLocaleDateString() : 'N/A';
        
        html += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px;">${index + 1}</td>
                <td style="padding: 12px; font-weight: bold; color: #2c5aa0;">${entry.callName}</td>
                <td style="padding: 12px;">${entry.regNumber}</td>
                <td style="padding: 12px;">${entry.handler}</td>
                <td style="padding: 12px;">${entry.email || 'N/A'}</td>
                <td style="padding: 12px; font-size: 12px;">${classes}</td>
                <td style="padding: 12px;">${entryDate}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    return html;
}

// Add placeholder functions for other tabs
function loadCrossReferenceTabWithTrialSelection() {
    var container = document.getElementById('crossReferenceContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px;">
            <h3>Cross Reference</h3>
            ${generateTrialSelector('cross-reference')}
            <div id="selectedTrialCrossReference" style="margin-top: 20px;">
                <p style="color: #666;">Select a trial above to view cross reference data.</p>
            </div>
        </div>
    `;
}

function loadRunningOrderTabWithTrialSelection() {
    var container = document.getElementById('runningOrderContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px;">
            <h3>Running Order Management</h3>
            ${generateTrialSelector('running-order')}
            <div id="selectedTrialRunningOrder" style="margin-top: 20px;">
                <p style="color: #666;">Select a trial above to manage running orders.</p>
            </div>
        </div>
    `;
}

function loadScoreSheetsTabWithTrialSelection() {
    var container = document.getElementById('scoreSheetsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px;">
            <h3>Score Sheets</h3>
            ${generateTrialSelector('score-sheets')}
            <div id="selectedTrialScoreSheets" style="margin-top: 20px;">
                <p style="color: #666;">Select a trial above to generate score sheets.</p>
            </div>
        </div>
    `;
}

function loadReportsTabWithTrialSelection() {
    var container = document.getElementById('reportsContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px;">
            <h3>Reports & Analytics</h3>
            ${generateTrialSelector('reports')}
            <div id="selectedTrialReports" style="margin-top: 20px;">
                <p style="color: #666;">Select a trial above to generate reports.</p>
            </div>
        </div>
    `;
}

function loadScoreEntryTabWithTrialSelection() {
    var container = document.getElementById('scoreEntryContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px;">
            <h3>Digital Score Entry</h3>
            ${generateTrialSelector('score-entry')}
            <div id="selectedTrialScoreEntry" style="margin-top: 20px;">
                <p style="color: #666;">Select a trial above for score entry.</p>
            </div>
        </div>
    `;
}

// Enhanced My Trials with better trial management
function loadUserTrials() {
    var container = document.getElementById('trialsContainer');
    if (!container) return;
    
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    
    // Combine user trials and public trials they have access to
    var allAccessibleTrials = {};
    Object.assign(allAccessibleTrials, userTrials);
    
    // Add public trials from other users
    Object.keys(publicTrials).forEach(function(trialId) {
        if (!allAccessibleTrials[trialId]) {
            allAccessibleTrials[trialId] = publicTrials[trialId];
        }
    });
    
    var trialIds = Object.keys(allAccessibleTrials);
    
    if (trialIds.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 10px;">
                <h3>No Trials Found</h3>
                <p>You don't have access to any trials yet.</p>
                <button onclick="createNewTrial()">Create New Trial</button>
            </div>
        `;
    } else {
        var html = '<h3>Available Trials</h3>';
        
        trialIds.forEach(function(trialId) {
            var trial = allAccessibleTrials[trialId];
            var isMyTrial = currentUser && trial.owner === currentUser.username;
            var entryCount = trial.results ? trial.results.length : 0;
            
            html += `
                <div style="background: white; padding: 20px; margin: 15px 0; border-radius: 10px; border-left: 4px solid ${isMyTrial ? '#28a745' : '#667eea'}; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: #2c5aa0; font-size: 18px; margin-bottom: 5px;">
                                ${trial.name || 'Unnamed Trial'}
                                ${isMyTrial ? '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px;">MY TRIAL</span>' : '<span style="background: #6c757d; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-left: 10px;">' + trial.owner + '</span>'}
                            </div>
                            <div style="color: #666; margin-bottom: 8px;">
                                <strong>Club:</strong> ${trial.clubName || 'N/A'} | 
                                <strong>Location:</strong> ${trial.location || 'N/A'}
                            </div>
                            <div style="color: #666; font-size: 14px;">
                                <strong>Created:</strong> ${new Date(trial.created).toLocaleDateString()} | 
                                <strong>Classes:</strong> ${trial.config ? trial.config.length : 0} | 
                                <strong>Entries:</strong> ${entryCount}
                            </div>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px; min-width: 200px;">
                            <button onclick="selectTrialAndManage('${trialId}')" style="background: #17a2b8; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%;">📝 Manage Entries</button>
                            <button onclick="selectTrialAndViewResults('${trialId}')" style="background: #6f42c1; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%;">📊 View Results</button>
                            ${isMyTrial ? `<button onclick="editTrial('${trialId}')" style="background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%;">⚙️ Edit Trial</button>` : ''}
                            ${isMyTrial ? `<button onclick="deleteTrial('${trialId}')" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%;">🗑️ Delete</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '<div style="text-align: center; margin-top: 30px;"><button onclick="createNewTrial()" style="background: linear-gradient(45deg, #28a745, #20c997); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">➕ Create New Trial</button></div>';
        container.innerHTML = html;
    }
}

// Functions to select trial and switch to appropriate tab
function selectTrialAndManage(trialId) {
    selectTrialForContext(trialId, 'entry');
    showTab('entry', document.querySelector('.nav-tab[onclick*="entry"]'));
}

function selectTrialAndViewResults(trialId) {
    selectTrialForContext(trialId, 'results');
    showTab('results', document.querySelector('.nav-tab[onclick*="results"]'));
}

function showAllEntriesForTrial() {
    if (entryResults.length === 0) {
        alert('No entries to display');
        return;
    }
    
    showAllEntries();
}

function generateEntriesPreview() {
    if (entryResults.length === 0) {
        return '<p style="color: #666; text-align: center;">No entries yet. Click "Add New Entry" to get started.</p>';
    }
    
    var html = '<h4>Recent Entries:</h4><table style="width: 100%; border-collapse: collapse;">';
    html += '<tr style="background: #e9ecef;"><th style="padding: 8px; text-align: left;">Dog Name</th><th style="padding: 8px; text-align: left;">Handler</th><th style="padding: 8px; text-align: left;">Registration</th><th style="padding: 8px; text-align: left;">Classes</th></tr>';
    
    entryResults.slice(-5).forEach(function(entry) {
        var classes = Array.isArray(entry.trials) ? entry.trials.map(t => t.class).join(', ') : (entry.trialClass || 'N/A');
        html += `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px;">${entry.callName}</td>
                <td style="padding: 8px;">${entry.handler}</td>
                <td style="padding: 8px;">${entry.regNumber}</td>
                <td style="padding: 8px;">${classes}</td>
            </tr>
        `;
    });
    
    html += '</table>';
    if (entryResults.length > 5) {
        html += `<p style="text-align: center; margin-top: 10px; color: #666;">Showing last 5 of ${entryResults.length} entries</p>`;
    }
    
    return html;
}

// Dashboard functions
function addDashboardButton() {
    var userBar = document.querySelector('.user-bar');
    if (userBar && !document.getElementById('dashboardBtn')) {
        var dashboardBtn = document.createElement('button');
        dashboardBtn.id = 'dashboardBtn';
        dashboardBtn.textContent = '📊 View All Trials';
        dashboardBtn.style.cssText = `
            background: #17a2b8; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 5px; 
            cursor: pointer; 
            font-weight: bold;
            margin-left: 10px;
        `;
        dashboardBtn.onclick = showAllTrialsDashboard;
        
        var logoutBtn = userBar.querySelector('.logout-btn');
        if (logoutBtn) {
            userBar.insertBefore(dashboardBtn, logoutBtn);
        } else {
            userBar.appendChild(dashboardBtn);
        }
    }
}

function showAllTrialsDashboard() {
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var allUsers = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    var trialIds = Object.keys(publicTrials);
    
    var modal = document.createElement('div');
    modal.id = 'trialsModal';
    modal.style.cssText = `
        position: fixed; 
        top: 0; left: 0; 
        width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); 
        z-index: 10000; 
        display: flex; 
        justify-content: center; 
        align-items: center;
        padding: 20px;
    `;
    
    var html = `
        <div style="background: white; border-radius: 15px; max-width: 1000px; width: 100%; max-height: 80vh; overflow-y: auto;">
            <div style="padding: 20px; border-bottom: 2px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #f8f9fa;">
                <h2 style="margin: 0; color: #333;">🏆 All Trials Dashboard</h2>
                <button onclick="closeDashboard()" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">✕ Close</button>
            </div>
            <div style="padding: 20px;">
    `;
    
    if (trialIds.length === 0) {
        html += '<p style="text-align: center; color: #666; padding: 40px; font-size: 18px;">No trials found in the system.</p>';
    } else {
        var totalEntries = trialIds.reduce(function(sum, id) {
            var trial = publicTrials[id];
            return sum + (trial.results ? trial.results.length : 0);
        }, 0);
        
        html += `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold;">${trialIds.length}</div>
                    <div>Total Trials</div>
                </div>
                <div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold;">${totalEntries}</div>
                    <div>Total Entries</div>
                </div>
                <div style="background: linear-gradient(135deg, #ffc107, #fd7e14); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 32px; font-weight: bold;">${Object.keys(allUsers).length}</div>
                    <div>Users</div>
                </div>
            </div>
        `;
        
        html += '<h3 style="color: #333; margin-bottom: 20px;">All Trials:</h3>';
        
        trialIds.forEach(function(trialId) {
            var trial = publicTrials[trialId];
            var ownerName = allUsers[trial.owner] ? allUsers[trial.owner].fullName : trial.owner;
            var entryCount = trial.results ? trial.results.length : 0;
            var createdDate = new Date(trial.created).toLocaleDateString();
            
            html += `
                <div style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0 0 5px 0; color: #2c5aa0;">${trial.name || 'Unnamed Trial'}</h4>
                            <p style="margin: 0; color: #666;">
                                <strong>Owner:</strong> ${ownerName} | 
                                <strong>Club:</strong> ${trial.clubName || 'N/A'} | 
                                <strong>Location:</strong> ${trial.location || 'N/A'}
                            </p>
                            <p style="margin: 5px 0 0 0; color: #666;">
                                <strong>Created:</strong> ${createdDate} | 
                                <strong>Classes:</strong> ${trial.config ? trial.config.length : 0}
                            </p>
                        </div>
                        <div style="text-align: center;">
                            <div style="background: #667eea; color: white; padding: 10px 15px; border-radius: 8px; font-weight: bold; margin-bottom: 10px;">
                                ${entryCount} Entries
                            </div>
                            <button onclick="viewTrialDetails('${trialId}')" style="background: #28a745; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer; margin-right: 5px;">👁️ View</button>
                            <button onclick="openTrialForEntries('${trialId}')" style="background: #17a2b8; color: white; border: none; padding: 6px 12px; border-radius: 5px; cursor: pointer;">📋 Entries</button>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    html += '</div></div>';
    modal.innerHTML = html;
    document.body.appendChild(modal);
}

function closeDashboard() {
    var modal = document.getElementById('trialsModal');
    if (modal) modal.remove();
}

function viewTrialDetails(trialId) {
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var trial = publicTrials[trialId];
    
    if (trial) {
        alert('Trial Details:\\n\\nName: ' + trial.name + '\\nClub: ' + (trial.clubName || 'N/A') + '\\nLocation: ' + (trial.location || 'N/A') + '\\nOwner: ' + trial.owner + '\\nClasses: ' + (trial.config ? trial.config.length : 0) + '\\nEntries: ' + (trial.results ? trial.results.length : 0) + '\\nCreated: ' + new Date(trial.created).toLocaleDateString());
    }
}

function viewEntries(trialId) {
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var trial = publicTrials[trialId];
    
    if (!trial) {
        alert('Trial not found');
        return;
    }
    
    // Set current trial
    currentTrialId = trialId;
    trialConfig = trial.config || [];
    entryResults = trial.results || [];
    
    // Close dashboard
    closeDashboard();
    
    // Show detailed entries modal
    showDetailedEntriesModal(trial);
}

function showDetailedEntriesModal(trial) {
    var modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 10000; 
        display: flex; justify-content: center; align-items: center; padding: 20px;
    `;
    
    var entries = trial.results || [];
    var entriesHTML = '';
    
    if (entries.length === 0) {
        entriesHTML = '<p style="text-align: center; color: #666; padding: 40px;">No entries yet for this trial.</p>';
    } else {
        entriesHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">#</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Dog Name</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Registration</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Handler</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Email</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Classes</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        entries.forEach(function(entry, index) {
            var classes = Array.isArray(entry.trials) ? 
                entry.trials.map(function(t) { return t.class + ' R' + t.round; }).join(', ') : 
                (entry.trialClass || 'N/A');
            
            entriesHTML += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px;">${index + 1}</td>
                    <td style="padding: 12px; font-weight: bold; color: #2c5aa0;">${entry.callName}</td>
                    <td style="padding: 12px;">${entry.regNumber}</td>
                    <td style="padding: 12px;">${entry.handler}</td>
                    <td style="padding: 12px;">${entry.email || 'N/A'}</td>
                    <td style="padding: 12px; font-size: 12px;">${classes}</td>
                </tr>
            `;
        });
        
        entriesHTML += '</tbody></table>';
    }
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; max-width: 1200px; width: 100%; max-height: 80vh; overflow-y: auto;">
            <div style="padding: 20px; border-bottom: 2px solid #eee; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 15px 15px 0 0;">
                <h2 style="margin: 0;">📋 ${trial.name} - Entries Management</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">
                    Total Entries: ${entries.length} | Club: ${trial.clubName || 'N/A'} | Owner: ${trial.owner}
                </p>
            </div>
            <div style="padding: 30px;">
                <div style="display: flex; gap: 15px; margin-bottom: 30px; justify-content: center;">
                    <button onclick="addNewEntryToTrial('${currentTrialId}')" style="background: linear-gradient(45deg, #28a745, #20c997); color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-weight: bold;">➕ Add New Entry</button>
                    <button onclick="exportTrialEntries('${currentTrialId}')" style="background: linear-gradient(45deg, #ffc107, #fd7e14); color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-weight: bold;">📤 Export Entries</button>
                    <button onclick="goToMainDashboard()" style="background: linear-gradient(45deg, #6f42c1, #5a3bb0); color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-weight: bold;">🏠 Main Dashboard</button>
                    <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="background: linear-gradient(45deg, #dc3545, #c82333); color: white; border: none; padding: 12px 25px; border-radius: 25px; cursor: pointer; font-weight: bold;">❌ Close</button>
                </div>
                
                ${entriesHTML}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function addNewEntryToTrial(trialId) {
    // Close current modal
    var modal = document.querySelector('div[style*="position: fixed"]');
    if (modal) modal.remove();
    
    // Set trial and show entry form
    currentTrialId = trialId;
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var trial = publicTrials[trialId];
    trialConfig = trial.config || [];
    entryResults = trial.results || [];
    
    // Show the entry form
    showJuneLeagueEntryForm();
}

function exportTrialEntries(trialId) {
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var trial = publicTrials[trialId];
    var entries = trial.results || [];
    
    if (entries.length === 0) {
        alert('No entries to export for this trial.');
        return;
    }
    
    var csv = 'Trial Name,Dog Name,Registration,Handler,Email,Classes,Entry Date,Confirmation Number\\n';
    
    entries.forEach(function(entry) {
        var classes = Array.isArray(entry.trials) ? 
            entry.trials.map(function(t) { return t.class + ' Round ' + t.round + ' (' + (t.type || 'regular') + ')'; }).join('; ') : 
            (entry.trialClass || 'N/A');
        
        csv += '"' + trial.name + '","' + entry.callName + '","' + entry.regNumber + '","' + entry.handler + '","' + (entry.email || 'N/A') + '","' + classes + '","' + (entry.entryDate || 'N/A') + '","' + (entry.confirmationNumber || 'N/A') + '"\\n';
    });
    
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (trial.name || 'trial').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_entries.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ Exported ' + entries.length + ' entries for ' + trial.name + '!');
}

function goToMainDashboard() {
    // Close any open modals
    var modals = document.querySelectorAll('div[style*="position: fixed"]');
    modals.forEach(function(modal) {
        modal.remove();
    });
    
    // Switch to trials tab to see full interface
    showTab('trials', document.querySelector('.nav-tab[onclick*="trials"]'));
}

// Make viewEntries use the new function
function viewEntries(trialId) {
    openTrialForEntries(trialId);
}

// Results display
function updateResultsDisplay() {
    var container = document.getElementById('resultsContainer');
    if (!container) return;
    
    if (entryResults.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 40px;">No entries recorded yet.</p>';
    } else {
        container.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px;">
                <h3>Trial Results</h3>
                <p>Total entries: <strong>${entryResults.length}</strong></p>
                <div style="margin-top: 20px;">
                    ${generateEntriesPreview()}
                </div>
            </div>
        `;
    }
}

// Export functions
function exportEntries() {
    if (entryResults.length === 0) {
        alert('No entries to export');
        return;
    }
    
    var csv = 'Dog Name,Registration,Handler,Email,Classes,Entry Date,Confirmation\\n';
    
    entryResults.forEach(function(entry) {
        var classes = Array.isArray(entry.trials) ? entry.trials.map(t => t.class).join('; ') : (entry.trialClass || 'N/A');
        csv += '"' + entry.callName + '","' + entry.regNumber + '","' + entry.handler + '","' + (entry.email || 'N/A') + '","' + classes + '","' + (entry.entryDate || 'N/A') + '","' + (entry.confirmationNumber || 'N/A') + '"\\n';
    });
    
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'trial_entries.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Entries exported successfully!');
}

function showAllEntries() {
    if (entryResults.length === 0) {
        alert('No entries to display');
        return;
    }
    
    var modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 10000; 
        display: flex; justify-content: center; align-items: center; padding: 20px;
    `;
    
    var html = `
        <div style="background: white; border-radius: 15px; max-width: 1000px; width: 100%; max-height: 80vh; overflow-y: auto;">
            <div style="padding: 20px; border-bottom: 2px solid #eee; background: #f8f9fa;">
                <h2 style="margin: 0; color: #333;">📋 All Entries (${entryResults.length})</h2>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="float: right; background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">✕ Close</button>
            </div>
            <div style="padding: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">#</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Dog Name</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Registration</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Handler</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Email</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">Classes</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    entryResults.forEach(function(entry, index) {
        var classes = Array.isArray(entry.trials) ? entry.trials.map(t => t.class + ' R' + t.round).join(', ') : (entry.trialClass || 'N/A');
        html += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px;">${index + 1}</td>
                <td style="padding: 12px; font-weight: bold; color: #2c5aa0;">${entry.callName}</td>
                <td style="padding: 12px;">${entry.regNumber}</td>
                <td style="padding: 12px;">${entry.handler}</td>
                <td style="padding: 12px;">${entry.email || 'N/A'}</td>
                <td style="padding: 12px;">${classes}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div></div>';
    modal.innerHTML = html;
    document.body.appendChild(modal);
}
