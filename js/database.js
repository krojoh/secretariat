// CLEAN OPTIMIZED TRIAL MANAGEMENT SYSTEM
// This is a cleaned version that removes redundancies and conflicts

// ===== GLOBAL VARIABLES =====
var currentUser = null;
var trialConfig = [];
var entryResults = [];
var currentTrialId = null;
var currentTrial = null;
var csvJudges = [];
var csvClasses = [];
var csvData = [];

// ===== DEMO ACCOUNTS SETUP =====
function createDemoAccounts() {
    var users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    
    if (!users.admin) {
        users.admin = {
            username: 'admin',
            password: 'admin',
            fullName: 'Admin User',
            email: 'admin@demo.com',
            created: new Date().toISOString()
        };
    }
    
    if (!users.user) {
        users.user = {
            username: 'user',
            password: 'user',
            fullName: 'Demo User',
            email: 'user@demo.com',
            created: new Date().toISOString()
        };
    }
    
    localStorage.setItem('trialUsers', JSON.stringify(users));
}

// ===== AUTHENTICATION =====
function showAuthTab(tab, element) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    if (element) element.classList.add('active');
    var form = document.getElementById(tab + 'Form');
    if (form) form.classList.add('active');
}

function handleLogin(event) {
    event.preventDefault();
    
    var username = document.getElementById('loginUsername').value.trim();
    var password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('❌ Please enter both username and password.');
        return;
    }
    
    createDemoAccounts();
    var users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    
    if (users[username] && users[username].password === password) {
        currentUser = users[username];
        showMainApp();
        alert('✅ Login successful! Welcome ' + currentUser.fullName);
    } else {
        alert('❌ Invalid credentials.\nDemo: admin/admin or user/user');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    var username = document.getElementById('regUsername').value.trim();
    var password = document.getElementById('regPassword').value;
    var confirmPassword = document.getElementById('regConfirmPassword').value;
    var fullName = document.getElementById('regFullName').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    
    if (!username || !password || !fullName || !email) {
        alert('❌ Please fill in all fields.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('❌ Passwords do not match.');
        return;
    }
    
    var users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    
    if (users[username]) {
        alert('❌ Username already exists.');
        return;
    }
    
    users[username] = {
        username: username,
        password: password,
        fullName: fullName,
        email: email,
        created: new Date().toISOString()
    };
    
    localStorage.setItem('trialUsers', JSON.stringify(users));
    alert('✅ Registration successful! You can now login.');
    
    document.getElementById('registerForm').reset();
    showAuthTab('login', document.querySelector('.auth-tab'));
}

function showMainApp() {
    document.getElementById('authOverlay').style.display = 'none';
    document.getElementById('mainApp').classList.remove('hidden');
    
    if (currentUser) {
        document.getElementById('userInfo').textContent = 
            'Welcome, ' + currentUser.fullName + ' (' + currentUser.username + ')';
    }
    
    enableAllTabs();
    loadCSVData();
    loadUserTrials();
}

function logout() {
    currentUser = null;
    currentTrialId = null;
    trialConfig = [];
    entryResults = [];
    
    document.getElementById('authOverlay').style.display = 'flex';
    document.getElementById('mainApp').classList.add('hidden');
    
    document.querySelectorAll('input').forEach(input => input.value = '');
}

// ===== TAB MANAGEMENT =====
function enableAllTabs() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.style.opacity = '1';
        tab.style.pointerEvents = 'auto';
        tab.disabled = false;
    });
}

function showTab(tabName, element) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    var targetContent = document.getElementById(tabName);
    if (targetContent) targetContent.classList.add('active');
    
    if (element) element.classList.add('active');
    
    // Tab-specific initialization
    if (tabName === 'trials') loadUserTrials();
}

// ===== CSV DATA MANAGEMENT =====
async function loadCSVData() {
    try {
        const response = await fetch('data/dogs.csv');
        if (!response.ok) throw new Error('CSV not found');
        
        const csvText = await response.text();
        parseCSVData(csvText);
        
    } catch (error) {
        console.warn('CSV loading failed, using defaults:', error.message);
        useDefaultData();
    }
}

// REPLACE the parseCSVData function starting at line 158 in js/database.js
function parseCSVData(csvText) {
    csvJudges = [];
    csvClasses = [];
    csvData = [];
    
    const lines = csvText.split('\n');
    console.log('📄 Processing CSV with ' + lines.length + ' total lines');
    
    let successfulParses = 0;
    let skippedLines = 0;
    let judgeSet = new Set();
    let classSet = new Set();
    
    lines.forEach((line, index) => {
        line = line.trim();
        if (!line) return;
        
        try {
            // Skip header line
            if (line.toLowerCase().includes('registration') && line.toLowerCase().includes('call name')) {
                console.log('📋 Skipping header line');
                skippedLines++;
                return;
            }
            
            // Parse CSV format: Registration,Call Name,Handler,Class,Judges
            const parts = line.split(',').map(part => part.trim());
            
            if (parts.length >= 5) {
                const registration = parts[0];
                const callName = parts[1];
                const handler = parts[2];
                const className = parts[3];
                const judgeName = parts[4];
                
                // More flexible registration validation
                if (registration && (registration.match(/^\d{2}-\d{4}-\d{2}/) || registration.length >= 8)) {
                    
                    // Process class name - preserve ALL unique classes
                    if (className && className.length > 0) {
                        const cleanClassName = className.replace(/\s+/g, ' ').trim();
                        if (cleanClassName && !classSet.has(cleanClassName)) {
                            classSet.add(cleanClassName);
                            csvClasses.push(cleanClassName);
                            console.log('📚 Added class:', cleanClassName);
                        }
                    }
                    
                    // Process judge name - preserve ALL unique judges
                    if (judgeName && judgeName.length > 1) {
                        let cleanJudgeName = judgeName
                            .replace(/\s+/g, ' ')
                            .trim()
                            .replace(/[""'']/g, '')
                            .replace(/\.$/, '');
                        
                        // More lenient judge validation
                        if (cleanJudgeName.length > 2 && cleanJudgeName.match(/[A-Za-z]/)) {
                            if (!judgeSet.has(cleanJudgeName)) {
                                judgeSet.add(cleanJudgeName);
                                csvJudges.push(cleanJudgeName);
                                console.log('👨‍⚖️ Added judge:', cleanJudgeName);
                            }
                        }
                    }
                    
                    // Store complete record for auto-fill
                    csvData.push({
                        registration: registration,
                        callName: callName,
                        handler: handler,
                        className: className,
                        judgeName: judgeName,
                        lineNumber: index + 1
                    });
                    
                    successfulParses++;
                }
            } else {
                console.log('⚠️ Skipping line ' + (index + 1) + ' - insufficient parts:', parts.length);
                skippedLines++;
            }
            
        } catch (error) {
            console.log('❌ Error parsing line ' + (index + 1) + ':', error.message);
            skippedLines++;
        }
    });
    
    // Sort classes and judges alphabetically for better UX
   
    
    console.log('✅ CSV Parsing Complete:');
    console.log('📊 Total lines processed:', lines.length);
    console.log('✅ Successfully parsed:', successfulParses);
    console.log('⏭️ Skipped lines:', skippedLines);
    console.log('📚 Total unique classes found:', csvClasses.length);
    console.log('👨‍⚖️ Total unique judges found:', csvJudges.length);
    
    // Show first few classes and judges for verification
    console.log('📚 All classes found:', csvClasses);
    console.log('👨‍⚖️ First 10 judges:', csvJudges.slice(0, 10));
    
    // Store registration data for auto-fill
    window.registrationDatabase = {};
    csvData.forEach(function(record) {
        if (record.registration) {
            window.registrationDatabase[record.registration] = {
                dogName: record.callName,
                handlerName: record.handler,
                className: record.className,
                judgeName: record.judgeName
            };
        }
    });
    
    console.log('📝 Registration database created with', Object.keys(window.registrationDatabase).length, 'records');
}

function useDefaultData() {
    csvJudges = ["Linda Alberda", "Ginger Alpine", "Paige Alpine-Malone", "Anita Ambani", "Denise Ames"];
    csvClasses = ["Patrol 1", "Detective 2", "Investigator 3", "Super Sleuth 4", "Private Inv"];
}

// ===== ENHANCED AUTO-COMPLETE DROPDOWN SYSTEM =====

// Create autocomplete with type-specific handling (SINGLE UNIFIED FUNCTION)
function createAutoCompleteDropdown(selectElement, dropdownType) {
    if (!selectElement || selectElement.options.length < 2 || selectElement.dataset.autocomplete) {
        return;
    }
    
    console.log('🛠️ Creating ' + dropdownType.toUpperCase() + ' autocomplete for:', selectElement.id);
    
    // Mark as processed
    selectElement.dataset.autocomplete = 'true';
    
    // Hide original
    selectElement.style.display = 'none';
    
    // Create container
    var container = document.createElement('div');
    container.className = 'autocomplete-container';
    container.setAttribute('data-dropdown-type', dropdownType);
    container.style.cssText = 'position: relative; width: 100%;';
    
    selectElement.parentNode.insertBefore(container, selectElement);
    container.appendChild(selectElement);
    
    // Create input with aggressive autocomplete blocking
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'autocomplete-input';
    input.setAttribute('data-type', dropdownType);
    input.setAttribute('autocomplete', 'new-password');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');
    
    input.placeholder = dropdownType === 'class' ? 'Type class name...' : 'Type judge name...';
    input.style.cssText = `
        width: 100%; padding: 12px 16px; border: 2px solid #ddd; border-radius: 8px; 
        background: white; font-size: 14px; box-sizing: border-box; font-family: inherit;
    `;
    
    // Create dropdown
    var dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown';
    dropdown.setAttribute('data-type', dropdownType);
    dropdown.style.cssText = `
        position: absolute; top: 100%; left: 0; right: 0; background: white;
        border: 2px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;
        max-height: 200px; overflow-y: auto; z-index: 1000; display: none;
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    `;
    
    container.appendChild(input);
    container.appendChild(dropdown);
    
    // Get options
    var allOptions = Array.from(selectElement.options).slice(1);
    
    // Populate dropdown function
    function populateDropdown(filteredOptions, searchTerm) {
        dropdown.innerHTML = '';
        
        if (filteredOptions.length === 0) {
            dropdown.innerHTML = '<div style="padding: 16px; color: #666; text-align: center;">No ' + dropdownType + 's found</div>';
        } else {
            filteredOptions.forEach(function(option) {
                var item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.style.cssText = `
                    padding: 12px 16px; cursor: pointer; border-bottom: 1px solid #eee;
                    transition: background-color 0.2s;
                `;
                
                // Highlight search term
                var displayText = option.text;
                if (searchTerm) {
                    var regex = new RegExp('(' + searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
                    displayText = option.text.replace(regex, '<strong style="background: #ffeb3b; padding: 0 2px;">$1</strong>');
                }
                item.innerHTML = displayText;
                
                // Events
                item.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#e3f2fd';
                });
                
                item.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = '';
                });
                
                item.addEventListener('click', function() {
                    selectElement.value = option.value;
                    input.value = option.text;
                    dropdown.style.display = 'none';
                    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                });
                
                dropdown.appendChild(item);
            });
        }
    }
    
    // Input event
    input.addEventListener('input', function(e) {
        var searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            dropdown.style.display = 'none';
            return;
        }
        
        var filtered = allOptions.filter(function(option) {
            return option.text.toLowerCase().includes(searchTerm);
        });
        
        populateDropdown(filtered, searchTerm);
        dropdown.style.display = 'block';
    });
    
    // Focus event
    input.addEventListener('focus', function() {
        if (this.value === '') {
            populateDropdown(allOptions, '');
            dropdown.style.display = 'block';
        }
    });
    
    // Blur event
    input.addEventListener('blur', function() {
        setTimeout(function() {
            dropdown.style.display = 'none';
        }, 200);
    });
}

// UNIFIED DROPDOWN POPULATION FUNCTIONS
// REPLACE populateClassDropdown and populateJudgeDropdown functions in js/database.js (around line 320)

function populateClassDropdown(selectElement) {
    if (!selectElement) return;
    
    console.log('📚 Populating class dropdown with', csvClasses.length, 'classes');
    
    // Use ALL CSV classes or fallback
    var classes = csvClasses.length > 0 ? csvClasses : 
        ["Patrol 1", "Detective 2", "Investigator 3", "Super Sleuth 4", "Private Inv"];
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Class --</option>';
    
    // Add ALL classes
    classes.forEach(function(className) {
        var option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        if (className === currentValue) option.selected = true;
        selectElement.appendChild(option);
    });
    
    console.log('📚 Added ' + classes.length + ' class options');
    
    // Enhance with combo autocomplete
    setTimeout(function() {
        enhanceDropdownWithAutoComplete(selectElement, 'class');
    }, 100);
}

function populateJudgeDropdown(selectElement) {
    if (!selectElement) return;
    
    console.log('👨‍⚖️ Populating judge dropdown with', csvJudges.length, 'judges');
    
    // Use ALL CSV judges or fallback
    var judges = csvJudges.length > 0 ? csvJudges : 
        ["Linda Alberda", "Ginger Alpine", "Paige Alpine-Malone", "Anita Ambani", "Denise Ames"];
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Judge --</option>';
    
    // Add ALL judges
    judges.forEach(function(judgeName) {
        var option = document.createElement('option');
        option.value = judgeName;
        option.textContent = judgeName;
        if (judgeName === currentValue) option.selected = true;
        selectElement.appendChild(option);
    });
    
    console.log('👨‍⚖️ Added ' + judges.length + ' judge options');
    
    // Enhance with combo autocomplete
    setTimeout(function() {
        enhanceDropdownWithAutoComplete(selectElement, 'judge');
    }, 100);
}

// SINGLE UNIFIED POPULATE ALL FUNCTION
function populateAllDropdowns() {
    document.querySelectorAll('select[data-type="class"]').forEach(function(select) {
        populateClassDropdown(select);
    });
    
    document.querySelectorAll('select[data-type="judge"]').forEach(function(select) {
        populateJudgeDropdown(select);
    });
    
    console.log('✅ All dropdowns populated with auto-complete functionality');
}

// ===== TRIAL MANAGEMENT =====
function loadUserTrials() {
    var container = document.getElementById('trialsContainer');
    if (!container) return;
    
    if (!currentUser) {
        container.innerHTML = '<p>Please log in to view trials.</p>';
        return;
    }
    
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    var trialIds = Object.keys(userTrials);
    
    if (trialIds.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 10px;">
                <h3>No Trials Found</h3>
                <p>You haven't created any trials yet.</p>
                <button onclick="createNewTrial()" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Create New Trial</button>
            </div>
        `;
    } else {
        var html = '<h3>My Trials</h3>';
        
        trialIds.forEach(trialId => {
            var trial = userTrials[trialId];
            var isMyTrial = currentUser && trial.owner === currentUser.username;
            
            html += `
                <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; color: #2c5aa0; font-size: 16px;">${trial.name || 'Unnamed Trial'}</div>
                            <div style="font-size: 14px; color: #666; margin-top: 5px;">
                                Created: ${trial.created ? new Date(trial.created).toLocaleDateString() : 'Unknown'} | 
                                Classes: ${trial.config ? trial.config.length : 0} |
                                Entries: ${trial.results ? trial.results.length : 0}
                            </div>
                        </div>
                        <div style="display: flex; gap: 5px; flex-direction: column;">
                            ${isMyTrial ? `<button onclick="editTrial('${trialId}')" style="background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">⚙️ Edit</button>` : ''}
                            ${isMyTrial ? `<button onclick="deleteTrial('${trialId}')" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">🗑️ Delete</button>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '<div style="text-align: center; margin-top: 30px;"><button onclick="createNewTrial()" style="background: linear-gradient(45deg, #28a745, #20c997); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">➕ Create New Trial</button></div>';
        container.innerHTML = html;
    }
}

function createNewTrial() {
    if (!currentUser) {
        alert('Please log in to create a trial.');
        return;
    }
    
    currentTrialId = 'trial_' + Date.now();
    trialConfig = [];
    entryResults = [];
    
    ['trialName', 'clubName', 'trialLocation'].forEach(id => {
        var field = document.getElementById(id);
        if (field) field.value = '';
    });
    
    showTab('setup', document.querySelector('.nav-tab[onclick*="setup"]'));
    alert('✅ New trial created! Configure the trial details in the Setup tab.');
}

function editTrial(trialId) {
    if (!currentUser) return;
    
    currentTrialId = trialId;
    
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    
    var trial = userTrials[trialId] || publicTrials[trialId];
    
    if (!trial) {
        alert('Trial not found!');
        return;
    }
    
    currentTrial = trial;
    trialConfig = trial.config || [];
    entryResults = trial.results || [];
    
    showTab('setup', document.querySelector('.nav-tab[onclick*="setup"]'));
    populateTrialEditForm(trial);
    
    alert('✅ Trial "' + trial.name + '" loaded for editing!');
}

function populateTrialEditForm(trial) {
    if (!trial) return;
    
    ['name', 'clubName', 'location'].forEach(field => {
        var element = document.getElementById('trial' + field.charAt(0).toUpperCase() + field.slice(1));
        if (element && trial[field]) {
            element.value = trial[field];
        }
    });
}

function deleteTrial(trialId) {
    if (!currentUser) return;
    
    if (confirm('Are you sure you want to delete this trial? This cannot be undone.')) {
        var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
        delete userTrials[trialId];
        localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
        
        var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        delete publicTrials[trialId];
        localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
        
        loadUserTrials();
        alert('✅ Trial deleted successfully!');
    }
}

function saveTrialConfiguration() {
    if (!currentUser) {
        alert('Please log in to save trials.');
        return;
    }
    
    var trialName = document.getElementById('trialName').value.trim();
    if (!trialName) {
        alert('Please enter a trial name.');
        return;
    }
    
    if (!currentTrialId) {
        currentTrialId = 'trial_' + Date.now();
    }
    
    var config = collectTrialConfiguration();
    
    var trialData = {
        name: trialName,
        clubName: document.getElementById('clubName').value,
        location: document.getElementById('trialLocation').value,
        config: config,
        results: entryResults,
        owner: currentUser.username,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };
    
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    userTrials[currentTrialId] = trialData;
    localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
    
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    publicTrials[currentTrialId] = trialData;
    localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    
    alert('✅ Trial "' + trialName + '" saved successfully!');
    loadUserTrials();
}

function collectTrialConfiguration() {
    var config = [];
    var days = parseInt(document.getElementById('trialDays').value) || 1;
    
    for (var day = 1; day <= days; day++) {
        var dayDate = document.getElementById('day' + day + '_date').value;
        var numClasses = parseInt(document.getElementById('day' + day + '_numClasses').value) || 2;
        
        for (var classNum = 1; classNum <= numClasses; classNum++) {
            var className = document.getElementById('day' + day + '_class' + classNum + '_name').value;
            var numRounds = parseInt(document.getElementById('day' + day + '_class' + classNum + '_rounds').value);
            
            if (className && numRounds) {
                for (var round = 1; round <= numRounds; round++) {
                    var judgeField = document.getElementById('day' + day + '_class' + classNum + '_round' + round + '_judge');
                    var feoField = document.getElementById('day' + day + '_class' + classNum + '_round' + round + '_feo');
                    
                    if (judgeField) {
                        config.push({
                            day: day,
                            date: dayDate,
                            classNum: classNum,
                            className: className,
                            round: round,
                            judge: judgeField.value,
                            feoOffered: feoField ? feoField.checked : false
                        });
                    }
                }
            }
        }
    }
    
    return config;
}

// ===== ENTRY MANAGEMENT =====
function saveEntries() {
    if (!currentTrialId || !currentUser) return;
    
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    if (userTrials[currentTrialId]) {
        userTrials[currentTrialId].results = entryResults;
        localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
    }
    
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    if (publicTrials[currentTrialId]) {
        publicTrials[currentTrialId].results = entryResults;
        localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    }
}

// ===== INITIALIZATION =====
createDemoAccounts();

// Enhanced initialization with auto-complete monitoring
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Clean Trial Management System Loaded');
    
    // Auto-apply auto-complete to existing dropdowns
    setTimeout(function() {
        populateAllDropdowns();
    }, 1000);
    
    // Watch for new dropdowns being added dynamically
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                setTimeout(function() {
                    var newSelects = document.querySelectorAll('select[data-type="class"]:not([data-autocomplete]), select[data-type="judge"]:not([data-autocomplete])');
                    if (newSelects.length > 0) {
                        console.log('🔄 Converting ' + newSelects.length + ' new dropdowns to auto-complete');
                        newSelects.forEach(function(select) {
                            var type = select.getAttribute('data-type');
                            if (select.options.length > 1) {
                                createAutoCompleteDropdown(select, type);
                            }
                        });
                    }
                }, 300);
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ Auto-complete monitoring active for new dropdowns');
});

// ===== UTILITY FUNCTIONS =====
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Missing function stubs for compatibility
function initializeTestUsers() { createDemoAccounts(); }
function loadEntryTabWithTrialSelection() { console.log('Entry tab loaded'); }
function loadEntryFormTabWithTrialSelection() { console.log('Entry form tab loaded'); }
function loadResultsTabWithTrialSelection() { console.log('Results tab loaded'); }
function updateAllDisplays() { if (typeof loadUserTrials === 'function') loadUserTrials(); }
function saveTrialUpdates() { return saveTrialConfiguration(); }
// FIXED COMBO DROPDOWN + AUTO-COMPLETE SYSTEM
// This preserves the dropdown while adding auto-complete functionality

// Enhanced CSV parser that preserves ALL classes and judges
function parseCSVData(csvText) {
    csvJudges = [];
    csvClasses = [];
    csvData = [];
    
    const lines = csvText.split('\n');
    console.log('📄 Processing CSV with ' + lines.length + ' total lines');
    
    let successfulParses = 0;
    let skippedLines = 0;
    let judgeSet = new Set();
    let classSet = new Set();
    
    lines.forEach((line, index) => {
        line = line.trim();
        if (!line) return;
        
        try {
            // Skip header line
            if (line.toLowerCase().includes('registration') && line.toLowerCase().includes('call name')) {
                console.log('📋 Skipping header line');
                skippedLines++;
                return;
            }
            
            // Parse CSV format: Registration,Call Name,Handler,Class,Judges
            const parts = line.split(',').map(part => part.trim());
            
            if (parts.length >= 5) {
                const registration = parts[0];
                const callName = parts[1];
                const handler = parts[2];
                const className = parts[3];
                const judgeName = parts[4];
                
                // More flexible registration validation
                if (registration && (registration.match(/^\d{2}-\d{4}-\d{2}/) || registration.length >= 8)) {
                    
                    // Process class name - preserve ALL unique classes
                    if (className && className.length > 0) {
                        const cleanClassName = className.replace(/\s+/g, ' ').trim();
                        if (cleanClassName && !classSet.has(cleanClassName)) {
                            classSet.add(cleanClassName);
                            csvClasses.push(cleanClassName);
                            console.log('📚 Added class:', cleanClassName);
                        }
                    }
                    
                    // Process judge name - preserve ALL unique judges
                    if (judgeName && judgeName.length > 1) {
                        let cleanJudgeName = judgeName
                            .replace(/\s+/g, ' ')
                            .trim()
                            .replace(/[""'']/g, '')
                            .replace(/\.$/, '');
                        
                        // More lenient judge validation
                        if (cleanJudgeName.length > 2 && cleanJudgeName.match(/[A-Za-z]/)) {
                            if (!judgeSet.has(cleanJudgeName)) {
                                judgeSet.add(cleanJudgeName);
                                csvJudges.push(cleanJudgeName);
                                console.log('👨‍⚖️ Added judge:', cleanJudgeName);
                            }
                        }
                    }
                    
                    // Store complete record for auto-fill
                    csvData.push({
                        registration: registration,
                        callName: callName,
                        handler: handler,
                        className: className,
                        judgeName: judgeName,
                        lineNumber: index + 1
                    });
                    
                    successfulParses++;
                }
            } else {
                console.log('⚠️ Skipping line ' + (index + 1) + ' - insufficient parts:', parts.length);
                skippedLines++;
            }
            
        } catch (error) {
            console.log('❌ Error parsing line ' + (index + 1) + ':', error.message);
            skippedLines++;
        }
    });
    
    // Sort classes and judges alphabetically for better UX
    csvClasses.sort();
    csvJudges.sort();
    
    console.log('✅ CSV Parsing Complete:');
    console.log('📊 Total lines processed:', lines.length);
    console.log('✅ Successfully parsed:', successfulParses);
    console.log('⏭️ Skipped lines:', skippedLines);
    console.log('📚 Total unique classes found:', csvClasses.length);
    console.log('👨‍⚖️ Total unique judges found:', csvJudges.length);
    
    // Show first few classes and judges for verification
    console.log('📚 First 10 classes:', csvClasses.slice(0, 10));
    console.log('👨‍⚖️ First 10 judges:', csvJudges.slice(0, 10));
    
    // Store registration data for auto-fill
    window.registrationDatabase = {};
    csvData.forEach(function(record) {
        if (record.registration) {
            window.registrationDatabase[record.registration] = {
                dogName: record.callName,
                handlerName: record.handler,
                className: record.className,
                judgeName: record.judgeName
            };
        }
    });
    
    console.log('📝 Registration database created with', Object.keys(window.registrationDatabase).length, 'records');
}

// Enhanced combo dropdown that keeps the select AND adds autocomplete
function enhanceDropdownWithAutoComplete(selectElement, dropdownType) {
    if (!selectElement || selectElement.dataset.enhanced) {
        return;
    }
    
    console.log('🔧 Enhancing ' + dropdownType + ' dropdown:', selectElement.id);
    
    // Mark as enhanced
    selectElement.dataset.enhanced = 'true';
    
    // Keep the original select visible but add autocomplete overlay
    var container = document.createElement('div');
    container.className = 'combo-autocomplete-container';
    container.style.cssText = 'position: relative; width: 100%;';
    
    // Insert container around the select
    selectElement.parentNode.insertBefore(container, selectElement);
    container.appendChild(selectElement);
    
    // Create autocomplete input overlay
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'autocomplete-overlay';
    input.placeholder = 'Type to search or click dropdown arrow...';
    
    // Disable browser autocomplete
    input.setAttribute('autocomplete', 'new-password');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');
    
    // Style the input to look like it's part of the select
    input.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 30px;
        height: 100%;
        padding: 8px 12px;
        border: none;
        background: transparent;
        font-size: inherit;
        font-family: inherit;
        z-index: 10;
        box-sizing: border-box;
    `;
    
    // Create dropdown list for filtered results
    var dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-results';
    dropdown.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 2px solid #ddd;
        border-top: none;
        border-radius: 0 0 8px 8px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    `;
    
    container.appendChild(input);
    container.appendChild(dropdown);
    
    // Get all options except the first placeholder
    var allOptions = Array.from(selectElement.options).slice(1);
    console.log('📋 Options available for ' + dropdownType + ':', allOptions.length);
    
    // Function to populate the autocomplete dropdown
    function populateAutocompleteResults(filteredOptions, searchTerm) {
        dropdown.innerHTML = '';
        
        if (filteredOptions.length === 0) {
            var noResults = document.createElement('div');
            noResults.textContent = searchTerm ? `No ${dropdownType}s found matching "${searchTerm}"` : `No ${dropdownType}s available`;
            noResults.style.cssText = 'padding: 12px; color: #666; font-style: italic; text-align: center;';
            dropdown.appendChild(noResults);
        } else {
            filteredOptions.forEach(function(option, index) {
                var item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.style.cssText = `
                    padding: 10px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #f0f0f0;
                    transition: background-color 0.2s;
                `;
                
                // Highlight matching text
                var displayText = option.text;
                if (searchTerm && searchTerm.length > 0) {
                    var regex = new RegExp('(' + searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
                    displayText = option.text.replace(regex, '<mark style="background: #ffeb3b; padding: 0 2px; border-radius: 2px;">$1</mark>');
                }
                item.innerHTML = displayText;
                
                // Hover effects
                item.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#e3f2fd';
                });
                
                item.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = '';
                });
                
                // Click to select
                item.addEventListener('click', function() {
                    selectOption(option);
                });
                
                dropdown.appendChild(item);
            });
        }
    }
    
    // Function to select an option
    function selectOption(option) {
        console.log('✅ Selected ' + dropdownType + ':', option.text);
        
        // Update both the select and input
        selectElement.value = option.value;
        input.value = option.text;
        
        // Hide dropdown
        dropdown.style.display = 'none';
        
        // Visual feedback
        input.style.backgroundColor = '#d4edda';
        setTimeout(function() {
            input.style.backgroundColor = '';
        }, 1000);
        
        // Trigger change event on the original select
        var changeEvent = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(changeEvent);
    }
    
    // Input event for filtering
    input.addEventListener('input', function() {
        var searchTerm = this.value.toLowerCase().trim();
        
        console.log('🔍 Searching ' + dropdownType + ' for:', searchTerm);
        
        if (searchTerm === '') {
            dropdown.style.display = 'none';
            selectElement.value = '';
            return;
        }
        
        // Filter options
        var filteredOptions = allOptions.filter(function(option) {
            var optionText = option.text.toLowerCase();
            return optionText.includes(searchTerm) || 
                   optionText.split(' ').some(word => word.startsWith(searchTerm));
        });
        
        // Sort by relevance (exact matches first)
        filteredOptions.sort(function(a, b) {
            var aText = a.text.toLowerCase();
            var bText = b.text.toLowerCase();
            var aExact = aText.startsWith(searchTerm);
            var bExact = bText.startsWith(searchTerm);
            
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return aText.localeCompare(bText);
        });
        
        console.log('📋 Found ' + filteredOptions.length + ' matches for "' + searchTerm + '"');
        
        populateAutocompleteResults(filteredOptions, searchTerm);
        dropdown.style.display = 'block';
    });
    
    // Focus event
    input.addEventListener('focus', function() {
        console.log('📍 ' + dropdownType + ' input focused');
        
        if (this.value === '' && allOptions.length > 0) {
            populateAutocompleteResults(allOptions, '');
            dropdown.style.display = 'block';
        }
    });
    
    // Blur event (delayed to allow for clicks)
    input.addEventListener('blur', function() {
        setTimeout(function() {
            dropdown.style.display = 'none';
        }, 200);
    });
    
    // Keyboard navigation
    input.addEventListener('keydown', function(e) {
        var items = dropdown.querySelectorAll('.autocomplete-item');
        var selectedIndex = -1;
        
        // Find currently highlighted item
        items.forEach(function(item, index) {
            if (item.style.backgroundColor === 'rgb(227, 242, 253)') {
                selectedIndex = index;
            }
        });
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                var nextIndex = selectedIndex < items.length - 1 ? selectedIndex + 1 : 0;
                highlightItem(items, nextIndex);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                var prevIndex = selectedIndex > 0 ? selectedIndex - 1 : items.length - 1;
                highlightItem(items, prevIndex);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    items[selectedIndex].click();
                }
                break;
                
            case 'Escape':
                dropdown.style.display = 'none';
                this.blur();
                break;
        }
    });
    
    // Helper function to highlight items
    function highlightItem(items, index) {
        items.forEach(function(item, i) {
            if (i === index) {
                item.style.backgroundColor = '#e3f2fd';
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.style.backgroundColor = '';
            }
        });
    }
    
    // Allow clicking on the select dropdown arrow to work normally
    selectElement.addEventListener('change', function() {
        if (this.value) {
            var selectedOption = this.options[this.selectedIndex];
            input.value = selectedOption.text;
            console.log('✅ Selected via dropdown:', selectedOption.text);
        }
    });
    
    // Hide autocomplete when select is clicked
    selectElement.addEventListener('focus', function() {
        dropdown.style.display = 'none';
    });
    
    console.log('✅ Enhanced ' + dropdownType + ' dropdown with combo autocomplete');
}

// Enhanced populate functions that preserve ALL options
function populateClassDropdown(selectElement) {
    if (!selectElement) return;
    
    console.log('📚 Populating class dropdown with', csvClasses.length, 'classes');
    
    // Use ALL CSV classes or fallback
    var classes = csvClasses.length > 0 ? csvClasses : 
        ["Patrol 1", "Detective 2", "Investigator 3", "Super Sleuth 4", "Private Inv"];
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Class --</option>';
    
    // Add ALL classes
    classes.forEach(function(className) {
        var option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        if (className === currentValue) option.selected = true;
        selectElement.appendChild(option);
    });
    
    console.log('📚 Added ' + classes.length + ' class options');
    
    // Enhance with autocomplete
    setTimeout(function() {
        enhanceDropdownWithAutoComplete(selectElement, 'class');
    }, 100);
}

function populateJudgeDropdown(selectElement) {
    if (!selectElement) return;
    
    console.log('👨‍⚖️ Populating judge dropdown with', csvJudges.length, 'judges');
    
    // Use ALL CSV judges or fallback
    var judges = csvJudges.length > 0 ? csvJudges : 
        ["Linda Alberda", "Ginger Alpine", "Paige Alpine-Malone", "Anita Ambani", "Denise Ames"];
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Judge --</option>';
    
    // Add ALL judges
    judges.forEach(function(judgeName) {
        var option = document.createElement('option');
        option.value = judgeName;
        option.textContent = judgeName;
        if (judgeName === currentValue) option.selected = true;
        selectElement.appendChild(option);
    });
    
    console.log('👨‍⚖️ Added ' + judges.length + ' judge options');
    
    // Enhance with autocomplete
    setTimeout(function() {
        enhanceDropdownWithAutoComplete(selectElement, 'judge');
    }, 100);
}

// Single unified populate all function
function populateAllDropdowns() {
    console.log('🔄 Populating all dropdowns...');
    
    document.querySelectorAll('select[data-type="class"]').forEach(function(select) {
        populateClassDropdown(select);
    });
    
    document.querySelectorAll('select[data-type="judge"]').forEach(function(select) {
        populateJudgeDropdown(select);
    });
    
    console.log('✅ All dropdowns populated with combo autocomplete');
}

// Enhanced CSV loading with better error handling
async function loadCSVData() {
    try {
        console.log('📡 Loading CSV data from data/dogs.csv...');
        const response = await fetch('data/dogs.csv');
        if (!response.ok) throw new Error('CSV not found: ' + response.status);
        
        const csvText = await response.text();
        console.log('✅ CSV loaded successfully, size:', Math.round(csvText.length / 1024) + ' KB');
        
        parseCSVData(csvText);
        
        // Auto-populate existing dropdowns
        setTimeout(function() {
            populateAllDropdowns();
        }, 500);
        
    } catch (error) {
        console.warn('❌ CSV loading failed:', error.message);
        console.log('🔄 Using default data instead');
        useDefaultData();
    }
}

function useDefaultData() {
    csvJudges = [
        "Linda Alberda", "Ginger Alpine", "Paige Alpine-Malone", "Anita Ambani", "Denise Ames",
        "Sharon Anderson", "Terry Arnold", "Susan Ashworth", "Pat Baker", "Mary Bax"
    ];
    csvClasses = [
        "Patrol 1", "Detective 2", "Investigator 3", "Super Sleuth 4", "Private Inv",
        "Novice A", "Novice B", "Open A", "Open B", "Utility A", "Utility B"
    ];
    
    console.log('✅ Default data loaded:', csvClasses.length, 'classes,', csvJudges.length, 'judges');
}

// Debug function to check what's loaded
function debugDropdownData() {
    console.log('🔍 DROPDOWN DATA DEBUG:');
    console.log('CSV Classes (' + csvClasses.length + '):', csvClasses);
    console.log('CSV Judges (' + csvJudges.length + '):', csvJudges);
    
    var classSelects = document.querySelectorAll('select[data-type="class"]');
    var judgeSelects = document.querySelectorAll('select[data-type="judge"]');
    
    console.log('Class dropdowns found:', classSelects.length);
    console.log('Judge dropdowns found:', judgeSelects.length);
    
    if (classSelects.length > 0) {
        console.log('First class dropdown options:', classSelects[0].options.length);
    }
    
    if (judgeSelects.length > 0) {
        console.log('First judge dropdown options:', judgeSelects[0].options.length);
    }
}

// Make debug function available globally
window.debugDropdownData = debugDropdownData;

console.log('✅ Fixed Combo Dropdown + Auto-Complete System Loaded');
console.log('💡 Run debugDropdownData() to check loaded data');
