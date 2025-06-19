// Enhanced Login and Trial Management System - Complete Database.js Replacement
// This file completely replaces js/database.js

// Global variables for application state
var currentUser = null;
var trialConfig = [];
var entryResults = [];
var currentTrialId = null;
var currentTrial = null;

// Judge database for dropdown population
var judgeDatabase = [
    "Amanda Askell", "Andrew Anderson", "Barbara Brown", "Carol Chen", "David Davis",
    "Emily Evans", "Frank Fisher", "Grace Garcia", "Henry Harris", "Isabel Johnson",
    "Jack Jackson", "Karen King", "Lisa Lopez", "Michael Miller", "Nancy Nelson",
    "Oliver Owen", "Patricia Parker", "Quinn Roberts", "Rachel Rodriguez", "Steven Smith",
    "Teresa Taylor", "Ursula Upton", "Victor Valdez", "Wendy Williams", "Xavier Young",
    "Yvonne Zara", "Zachary Zhang", "Alice Adams", "Brian Baker", "Christina Cooper"
];

// Class database for dropdown population
var classDatabase = [
    "Agility - Novice", "Agility - Open", "Agility - Excellent", "Agility - Masters",
    "Jumpers - Novice", "Jumpers - Open", "Jumpers - Excellent", "Jumpers - Masters",
    "FAST", "Time 2 Beat", "Standard", "Premier Standard", "Premier Jumpers",
    "Wildcard", "Snooker", "Gamblers", "Touch N Go", "Jackpot"
];

// ===== INITIALIZATION =====

// Create demo accounts on first load
function createDemoAccountsIfNeeded() {
    var users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    
    if (!users.admin) {
        users.admin = {
            username: 'admin',
            password: 'admin',
            fullName: 'Admin User',
            email: 'admin@demo.com',
            isAdmin: true,
            created: new Date().toISOString()
        };
    }
    
    if (!users.user) {
        users.user = {
            username: 'user',
            password: 'user',
            fullName: 'Demo User',
            email: 'user@demo.com',
            isAdmin: false,
            created: new Date().toISOString()
        };
    }
    
    localStorage.setItem('trialUsers', JSON.stringify(users));
}

// Initialize test users (called from other files)
function initializeTestUsers() {
    createDemoAccountsIfNeeded();
    console.log('✅ Demo accounts created: admin/admin and user/user');
}

// ===== AUTHENTICATION FUNCTIONS =====

function showAuthTab(tab, element) {
    // Remove active class from all auth tabs
    var tabs = document.querySelectorAll('.auth-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    
    // Add active class to clicked tab
    if (element) {
        element.classList.add('active');
    }
    
    // Hide all auth forms
    var forms = document.querySelectorAll('.auth-form');
    for (var i = 0; i < forms.length; i++) {
        forms[i].classList.remove('active');
    }
    
    // Show selected form
    var targetForm = document.getElementById(tab + 'Form');
    if (targetForm) {
        targetForm.classList.add('active');
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    var username = document.getElementById('loginUsername').value.trim();
    var password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('❌ Please enter both username and password.');
        return;
    }
    
    // Create demo accounts if they don't exist
    createDemoAccountsIfNeeded();
    
    var users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    
    // Check if user exists and password matches
    if (users[username] && users[username].password === password) {
        currentUser = users[username];
        showMainApp();
        loadUserTrials();
        alert('✅ Login successful! Welcome ' + currentUser.fullName + '\n\nAll tabs are now fully accessible.');
        console.log('✅ User logged in:', currentUser.username);
    } else {
        alert('❌ Invalid username or password.\n\nDemo accounts:\n- Username: admin, Password: admin\n- Username: user, Password: user\n\nOr register a new account.');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    var username = document.getElementById('regUsername').value.trim();
    var password = document.getElementById('regPassword').value;
    var confirmPassword = document.getElementById('regConfirmPassword').value;
    var fullName = document.getElementById('regFullName').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    
    // Validation
    if (!username || !password || !fullName || !email) {
        alert('❌ Please fill in all fields.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('❌ Passwords do not match.');
        return;
    }
    
    if (password.length < 3) {
        alert('❌ Password must be at least 3 characters long.');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('❌ Please enter a valid email address.');
        return;
    }
    
    var users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    
    if (users[username]) {
        alert('❌ Username already exists. Please choose a different username.');
        return;
    }
    
    // Create new user
    users[username] = {
        username: username,
        password: password,
        fullName: fullName,
        email: email,
        isAdmin: false,
        created: new Date().toISOString()
    };
    
    localStorage.setItem('trialUsers', JSON.stringify(users));
    alert('✅ Registration successful! You can now login with your new account.');
    
    // Clear form and switch to login
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
    
    // Add dashboard buttons
    addDashboardButton();
    addFullDashboardButton();
    
    // Enable all tabs immediately upon login - THIS IS KEY!
    enableAllTabsOnLogin();
    
    // Initialize trial selection dropdowns
    initializeAllDropdowns();
    
    console.log('✅ Main app shown, all tabs enabled');
}

function logout() {
    currentUser = null;
    currentTrialId = null;
    trialConfig = [];
    entryResults = [];
    
    document.getElementById('authOverlay').style.display = 'flex';
    document.getElementById('mainApp').classList.add('hidden');
    
    // Clear all input fields
    var inputs = document.querySelectorAll('input');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].value = '';
    }
    
    console.log('✅ User logged out');
}

// ===== UTILITY FUNCTIONS =====

function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showStatusMessage(message, type) {
    alert(message);
}

// ===== DASHBOARD BUTTON FUNCTIONS =====

function addDashboardButton() {
    var userBar = document.querySelector('.user-bar');
    if (userBar && !document.getElementById('dashboardBtn')) {
        var dashboardBtn = document.createElement('button');
        dashboardBtn.id = 'dashboardBtn';
        dashboardBtn.textContent = '📊 Trial Dashboard';
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
        dashboardBtn.onclick = function() {
            if (typeof showDashboard === 'function') {
                showDashboard();
            } else {
                showTab('trials', document.querySelector('.nav-tab[onclick*="trials"]'));
            }
        };
        
        var logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            userBar.insertBefore(dashboardBtn, logoutBtn);
        }
    }
}

function addFullDashboardButton() {
    var userBar = document.querySelector('.user-bar');
    if (userBar && !document.getElementById('fullDashboardBtn')) {
        var fullDashboardBtn = document.createElement('button');
        fullDashboardBtn.id = 'fullDashboardBtn';
        fullDashboardBtn.textContent = '🏠 Main Dashboard';
        fullDashboardBtn.style.cssText = `
            background: #6f42c1; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 5px; 
            cursor: pointer; 
            font-weight: bold;
            margin-left: 10px;
        `;
        fullDashboardBtn.onclick = function() {
            if (typeof goToMainDashboard === 'function') {
                goToMainDashboard();
            } else {
                showTab('trials', document.querySelector('.nav-tab[onclick*="trials"]'));
            }
        };
        
        var dashboardBtn = document.getElementById('dashboardBtn');
        if (dashboardBtn) {
            userBar.insertBefore(fullDashboardBtn, dashboardBtn);
        }
    }
}

function goToMainDashboard() {
    if (typeof showDashboard === 'function') {
        showDashboard();
    } else {
        showTab('trials', document.querySelector('.nav-tab[onclick*="trials"]'));
    }
}

// ===== TAB ENABLING FUNCTIONS =====

function enableAllTabsOnLogin() {
    var navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(function(tab) {
        // Remove any disabled state
        tab.style.display = 'inline-block';
        tab.style.opacity = '1';
        tab.style.pointerEvents = 'auto';
        tab.style.background = '#f8f9fa';
        tab.disabled = false;
        tab.classList.remove('disabled');
        
        // Add hover effects
        tab.addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.background = '#e9ecef';
            }
        });
        
        tab.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.background = '#f8f9fa';
            }
        });
    });
    
    console.log('✅ All tabs enabled for logged-in user');
}

// ===== DROPDOWN FUNCTIONS =====

function initializeAllDropdowns() {
    setTimeout(function() {
        populateJudgeDropdowns();
        populateClassDropdowns();
        console.log('✅ All dropdown menus initialized');
    }, 100);
}

function populateJudgeDropdowns() {
    var judgeSelects = document.querySelectorAll('select[data-type="judge"], .judge-select, select[name*="judge"], select[id*="judge"]');
    judgeSelects.forEach(function(select) {
        var currentValue = select.value;
        select.innerHTML = '<option value="">-- Select Judge --</option>';
        
        judgeDatabase.forEach(function(judge) {
            var option = document.createElement('option');
            option.value = judge;
            option.textContent = judge;
            if (judge === currentValue) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    });
}

function populateClassDropdowns() {
    var classSelects = document.querySelectorAll('select[data-type="class"], .class-select, select[name*="class"], select[id*="class"]');
    classSelects.forEach(function(select) {
        var currentValue = select.value;
        select.innerHTML = '<option value="">-- Select Class --</option>';
        
        classDatabase.forEach(function(className) {
            var option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            if (className === currentValue) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    });
}

// ===== TRIAL MANAGEMENT FUNCTIONS =====

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
        
        trialIds.forEach(function(trialId) {
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

function createNewTrial() {
    if (!currentUser) {
        alert('Please log in to create a trial.');
        return;
    }
    
    currentTrialId = 'trial_' + Date.now();
    trialConfig = [];
    entryResults = [];
    
    // Clear form fields
    var trialNameField = document.getElementById('trialName');
    var clubNameField = document.getElementById('clubName');
    var locationField = document.getElementById('trialLocation');
    
    if (trialNameField) trialNameField.value = '';
    if (clubNameField) clubNameField.value = '';
    if (locationField) locationField.value = '';
    
    // Switch to setup tab
    if (typeof showTab === 'function') {
        showTab('setup', document.querySelector('.nav-tab[onclick*="setup"]'));
    }
    
    alert('✅ New trial created! Configure the trial details in the Setup tab.');
}

function editTrial(trialId) {
    if (!currentUser) {
        alert('Please log in to edit trials.');
        return;
    }
    
    currentTrialId = trialId;
    
    // Load trial data
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    
    var trial = userTrials[trialId] || publicTrials[trialId];
    
    if (!trial) {
        alert('Trial not found!');
        return;
    }
    
    // Set global variables
    currentTrial = trial;
    trialConfig = trial.config || [];
    entryResults = trial.results || [];
    
    // Switch to setup tab
    if (typeof showTab === 'function') {
        showTab('setup', document.querySelector('.nav-tab[onclick*="setup"]'));
    }
    
    // Populate form fields
    populateTrialEditForm(trial);
    
    alert('✅ Trial "' + trial.name + '" loaded for editing!\nAll original selections have been restored.');
}

// Enhanced populateTrialEditForm function - ADD this to js/database.js or replace existing one
function populateTrialEditForm(trial) {
    if (!trial) return;
    
    // Basic trial information
    if (trial.name) {
        var trialNameField = document.getElementById('trialName');
        if (trialNameField) trialNameField.value = trial.name;
    }
    
    if (trial.clubName) {
        var clubNameField = document.getElementById('clubName');
        if (clubNameField) clubNameField.value = trial.clubName;
    }
    
    if (trial.location) {
        var locationField = document.getElementById('trialLocation');
        if (locationField) locationField.value = trial.location;
    }
    
    // Set number of days and regenerate form
    if (trial.days) {
        var daysField = document.getElementById('trialDays');
        if (daysField) {
            daysField.value = trial.days;
            // Trigger regeneration of days
            if (typeof generateDays === 'function') {
                generateDays();
            }
        }
    }
    
    // Populate class configurations after form generation
    if (trial.config && trial.config.length > 0) {
        setTimeout(function() {
            populateEditModeSelections(trial.config);
        }, 1000); // Wait for form to be fully generated
    }
    
    console.log('✅ Trial form populated with original data');
}
    
    // Populate class configurations after form generation
    if (trial.config && trial.config.length > 0) {
        setTimeout(function() {
            populateEditModeSelections(trial.config);
        }, 1000); // Wait for form to be fully generated
    }
    
    console.log('✅ Trial form populated with original data');
}

function deleteTrial(trialId) {
    if (!currentUser) {
        alert('Please log in to delete trials.');
        return;
    }
    
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

function saveTrialUpdates() {
    if (!currentUser) {
        alert('Please log in to save trials.');
        return false;
    }
    
    var trialName = document.getElementById('trialName').value;
    if (!trialName) {
        alert('Please enter a trial name');
        return false;
    }
    
    if (!currentTrialId) {
        currentTrialId = 'trial_' + Date.now();
    }
    function populateEditModeSelections(config) {
    config.forEach(function(classConfig) {
        var day = classConfig.day;
        var classNum = classConfig.classNum;
        
        // Populate date field
        if (classConfig.date) {
            var dateField = document.getElementById('day' + day + '_date');
            if (dateField) dateField.value = classConfig.date;
        }
        
        // Populate class name dropdown
        if (classConfig.className) {
            var classField = document.getElementById('day' + day + '_class' + classNum + '_name');
            if (classField) {
                classField.value = classConfig.className;
                console.log('✅ Restored class name:', classConfig.className);
            }
        }
        
        // Populate rounds dropdown
        if (classConfig.round || classConfig.rounds) {
            var roundsField = document.getElementById('day' + day + '_class' + classNum + '_round');
            if (roundsField) {
                roundsField.value = classConfig.round || classConfig.rounds || 1;
                console.log('✅ Restored rounds:', classConfig.round || classConfig.rounds);
            }
        }
        
        // Populate judge dropdown
        if (classConfig.judge) {
            var judgeField = document.getElementById('day' + day + '_class' + classNum + '_judge');
            if (judgeField) {
                judgeField.value = classConfig.judge;
                console.log('✅ Restored judge:', classConfig.judge);
            }
        }
        
        // Set FEO checkbox
        if (classConfig.feoOffered) {
            var feoField = document.getElementById('day' + day + '_class' + classNum + '_feo');
            if (feoField) {
                feoField.checked = classConfig.feoOffered;
                console.log('✅ Restored FEO option:', classConfig.feoOffered);
            }
        }
    });
    
    console.log('✅ All original selections restored in edit mode');
}
    var trialData = {
        name: trialName,
        clubName: document.getElementById('clubName').value,
        location: document.getElementById('trialLocation').value,
        config: trialConfig,
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
    
    alert('✅ Trial configuration saved successfully!');
    return true;
}

// ===== ENTRY MANAGEMENT =====

function saveEntries() {
    if (!currentTrialId || !currentUser) return;
    
    // Update user trials
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    if (userTrials[currentTrialId]) {
        userTrials[currentTrialId].results = entryResults;
        userTrials[currentTrialId].updated = new Date().toISOString();
        localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
    }
    
    // Update public trials
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    if (publicTrials[currentTrialId]) {
        publicTrials[currentTrialId].results = entryResults;
        publicTrials[currentTrialId].updated = new Date().toISOString();
        localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    }
}

function deleteSelectedEntries() {
    var checkboxes = document.querySelectorAll('input[name="entrySelect"]:checked');
    
    if (checkboxes.length === 0) {
        alert('Please select entries to delete.');
        return;
    }
    
    var selectedIndices = Array.from(checkboxes).map(function(cb) {
        return parseInt(cb.value);
    });
    
    var confirmation = confirm('Are you sure you want to delete ' + selectedIndices.length + ' selected entries? This cannot be undone.');
    
    if (confirmation) {
        // Remove entries in reverse order to maintain indices
        selectedIndices.sort(function(a, b) { return b - a; });
        selectedIndices.forEach(function(index) {
            entryResults.splice(index, 1);
        });
        
        saveEntries();
        alert('✅ ' + selectedIndices.length + ' entries deleted successfully!');
        
        // Close modal and update displays
        var modal = document.querySelector('div[style*="position: fixed"]');
        if (modal) modal.remove();
        
        updateAllDisplays();
    }
}

function clearAllEntries() {
    if (entryResults.length === 0) {
        alert('No entries to clear.');
        return;
    }
    
    var confirmation = prompt('Type "DELETE ALL" to confirm permanent deletion of all ' + entryResults.length + ' entries:');
    
    if (confirmation === 'DELETE ALL') {
        entryResults = [];
        saveEntries();
        alert('✅ All entries have been cleared from the trial.');
        
        var modal = document.querySelector('div[style*="position: fixed"]');
        if (modal) modal.remove();
        
        updateAllDisplays();
    } else {
        alert('Deletion cancelled. Entries have NOT been deleted.');
    }
}

// ===== FORM HANDLING =====

function clearFormFields(form) {
    var textInputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="number"], textarea');
    textInputs.forEach(function(input) {
        input.value = '';
    });
    
    var checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
        checkbox.checked = false;
    });
    
    var selects = form.querySelectorAll('select');
    selects.forEach(function(select) {
        select.selectedIndex = 0;
    });
    
    var radios = form.querySelectorAll('input[type="radio"]');
    radios.forEach(function(radio) {
        radio.checked = false;
    });
}

// ===== UPDATE DISPLAYS =====

function updateAllDisplays() {
    if (typeof loadUserTrials === 'function') {
        loadUserTrials();
    }
    
    refreshTrialSelectors();
}

function refreshTrialSelectors() {
    var selectors = document.querySelectorAll('select[onchange*="selectTrialForContext"]');
    selectors.forEach(function(selector) {
        var currentValue = selector.value;
        
        var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        var userTrials = JSON.parse(localStorage.getItem('trials_' + (currentUser ? currentUser.username : 'guest')) || '{}');
        
        var allTrials = {};
        Object.assign(allTrials, publicTrials);
        Object.assign(allTrials, userTrials);
        
        selector.innerHTML = '<option value="">-- Select a Trial --</option>';
        
        Object.keys(allTrials).forEach(function(trialId) {
            var trial = allTrials[trialId];
            var entryCount = trial.results ? trial.results.length : 0;
            var option = document.createElement('option');
            option.value = trialId;
            option.textContent = trial.name + ' (' + entryCount + ' entries)';
            if (trialId === currentValue) {
                option.selected = true;
            }
            selector.appendChild(option);
        });
    });
}

// ===== MISSING FUNCTION STUBS =====

// These functions are referenced by other files but may not exist
function loadEntryTabWithTrialSelection() {
    // Stub function - called from trial-setup.js
    console.log('loadEntryTabWithTrialSelection called');
}

function loadEntryFormTabWithTrialSelection() {
    // Stub function - called from navigation.js
    console.log('loadEntryFormTabWithTrialSelection called');
}

function loadResultsTabWithTrialSelection() {
    // Stub function - called from navigation.js
    console.log('loadResultsTabWithTrialSelection called');
}

function loadCrossReferenceTabWithTrialSelection() {
    // Stub function
    console.log('loadCrossReferenceTabWithTrialSelection called');
}

function loadRunningOrderTabWithTrialSelection() {
    // Stub function
    console.log('loadRunningOrderTabWithTrialSelection called');
}

function loadScoreSheetsTabWithTrialSelection() {
    // Stub function
    console.log('loadScoreSheetsTabWithTrialSelection called');
}

function loadReportsTabWithTrialSelection() {
    // Stub function
    console.log('loadReportsTabWithTrialSelection called');
}

function loadScoreEntryTabWithTrialSelection() {
    // Stub function
    console.log('loadScoreEntryTabWithTrialSelection called');
}

// ===== INITIALIZATION =====

// Initialize demo accounts immediately when this file loads
createDemoAccountsIfNeeded();

// Initialize system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeEnhancedSystem();
    });
} else {
    initializeEnhancedSystem();
}
// Function to populate edit mode selections - ADD this to js/database.js
function populateEditModeSelections(config) {
    config.forEach(function(classConfig) {
        var day = classConfig.day;
        var classNum = classConfig.classNum;
        
        // Populate date field
        if (classConfig.date) {
            var dateField = document.getElementById('day' + day + '_date');
            if (dateField) dateField.value = classConfig.date;
        }
        
        // Populate class name dropdown
        if (classConfig.className) {
            var classField = document.getElementById('day' + day + '_class' + classNum + '_name');
            if (classField) {
                classField.value = classConfig.className;
                console.log('✅ Restored class name:', classConfig.className);
            }
        }
        
        // Populate rounds dropdown
        if (classConfig.round || classConfig.rounds) {
            var roundsField = document.getElementById('day' + day + '_class' + classNum + '_round');
            if (roundsField) {
                roundsField.value = classConfig.round || classConfig.rounds || 1;
                console.log('✅ Restored rounds:', classConfig.round || classConfig.rounds);
            }
        }
        
        // Populate judge dropdown
        if (classConfig.judge) {
            var judgeField = document.getElementById('day' + day + '_class' + classNum + '_judge');
            if (judgeField) {
                judgeField.value = classConfig.judge;
                console.log('✅ Restored judge:', classConfig.judge);
            }
        }
        
        // Set FEO checkbox
        if (classConfig.feoOffered) {
            var feoField = document.getElementById('day' + day + '_class' + classNum + '_feo');
            if (feoField) {
                feoField.checked = classConfig.feoOffered;
                console.log('✅ Restored FEO option:', classConfig.feoOffered);
            }
        }
    });
    
    console.log('✅ All original selections restored in edit mode');
}

// Enhanced saveTrialConfiguration function - REPLACE the existing one in js/trial-setup.js or add to js/database.js
function saveTrialConfiguration() {
    var trialName = document.getElementById('trialName').value.trim();
    var clubName = document.getElementById('clubName').value.trim();
    var location = document.getElementById('trialLocation').value.trim();
    var days = parseInt(document.getElementById('trialDays').value) || 1;
    
    if (!trialName) {
        alert('❌ Please enter a trial name.');
        return;
    }
    
    if (!currentUser) {
        alert('❌ Please log in to save trials.');
        return;
    }
    
    // Collect all class configurations with correct field names
    var config = [];
    
    for (var day = 1; day <= days; day++) {
        var dayDateField = document.getElementById('day' + day + '_date');
        var dayDate = dayDateField ? dayDateField.value : '';
        
        var numClassesField = document.getElementById('day' + day + '_numClasses');
        var classCount = numClassesField ? parseInt(numClassesField.value) || 2 : 2;
        
        for (var classNum = 1; classNum <= classCount; classNum++) {
            var classNameField = document.getElementById('day' + day + '_class' + classNum + '_name');
            var judgeField = document.getElementById('day' + day + '_class' + classNum + '_judge');
            var roundField = document.getElementById('day' + day + '_class' + classNum + '_round');
            var feoField = document.getElementById('day' + day + '_class' + classNum + '_feo');
            
            var className = classNameField ? classNameField.value : '';
            var judge = judgeField ? judgeField.value : '';
            var round = roundField ? parseInt(roundField.value) || 1 : 1;
            var feoOffered = feoField ? feoField.checked : false;
            
            // Only save if at least class name or judge is specified
            if (className || judge) {
                config.push({
                    day: day,
                    date: dayDate,
                    classNum: classNum,
                    className: className,
                    round: round,
                    rounds: round,
                    judge: judge,
                    feoOffered: feoOffered
                });
            }
        }
    }
    
    // Save trial data
    if (!currentTrialId) {
        currentTrialId = 'trial_' + Date.now();
    }
    
    var trialData = {
        name: trialName,
        clubName: clubName,
        location: location,
        days: days,
        config: config,
        results: entryResults || [],
        owner: currentUser.username,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };
    // CSV Data Loader for Judges and Classes - Add to js/database.js

// Global variables to store CSV data
var csvJudges = [];
var csvClasses = [];
var csvData = [];

// Function to load and parse CSV data from dogs.csv
async function loadCSVData() {
    try {
        console.log('🔄 Loading CSV data from data/dogs.csv...');
        
        // Fetch the CSV file
        const response = await fetch('data/dogs.csv');
        if (!response.ok) {
            throw new Error('CSV file not found at data/dogs.csv');
        }
        
        const csvText = await response.text();
        console.log('✅ CSV file loaded successfully');
        
        // Parse CSV data
        parseCSVData(csvText);
        
        // Update dropdowns after loading data
        updateAllDropdownsWithCSVData();
        
        console.log('✅ CSV data processed:', {
            totalRecords: csvData.length,
            uniqueJudges: csvJudges.length,
            uniqueClasses: csvClasses.length
        });
        
        console.log('📋 Available Judges:', csvJudges);
        console.log('📋 Available Classes:', csvClasses);
        
    } catch (error) {
        console.warn('❌ Could not load CSV data:', error.message);
        console.log('📝 Using default dropdown data instead');
        
        // Fallback to default data if CSV loading fails
        useDefaultDropdownData();
    }
}

// Function to parse the CSV data based on your format
function parseCSVData(csvText) {
    csvData = [];
    csvJudges = [];
    csvClasses = [];
    
    const lines = csvText.split('\n');
    
    lines.forEach(function(line, index) {
        line = line.trim();
        if (!line) return; // Skip empty lines
        
        try {
            // Your format: 07-0001-01BJShirley OttmerPatrol 1Linda Alberda
            // We need to extract the class (4th column) and judge (last column)
            
            // Parse the line by looking for patterns
            const regNumber = line.substring(0, 10); // 07-0001-01
            const restOfLine = line.substring(10); // BJShirley OttmerPatrol 1Linda Alberda
            
            // Method 1: Try to identify the class and judge by common patterns
            let className = '';
            let judgeName = '';
            
            // Common class patterns to look for
            const classPatterns = [
                'Patrol', 'Detective', 'Investigator', 'Super Sleuth', 'Private Inv',
                'Novice A', 'Novice B', 'Open A', 'Open B', 'Excellent A', 'Excellent B',
                'Masters', 'FAST', 'Jumpers', 'Standard', 'Premier', 'Wildcard', 'Snooker'
            ];
            
            // Find class pattern in the line
            for (let pattern of classPatterns) {
                const patternIndex = restOfLine.indexOf(pattern);
                if (patternIndex !== -1) {
                    // Found a class pattern
                    const classStart = patternIndex;
                    
                    // Look for the end of class (usually followed by a number then judge name)
                    let classEnd = classStart + pattern.length;
                    
                    // Check if there's a number after the class (like "Patrol 1")
                    const afterPattern = restOfLine.substring(classEnd).trim();
                    const numberMatch = afterPattern.match(/^(\s*\d+)/);
                    if (numberMatch) {
                        classEnd += numberMatch[0].length;
                        className = restOfLine.substring(classStart, classEnd).trim();
                    } else {
                        className = pattern;
                    }
                    
                    // Everything after the class should be the judge name
                    judgeName = restOfLine.substring(classEnd).trim();
                    
                    break;
                }
            }
            
            // Method 2: If no pattern found, try a different approach
            if (!className || !judgeName) {
                // Split by capital letters to identify sections
                const parts = restOfLine.split(/(?=[A-Z][a-z])/);
                
                if (parts.length >= 3) {
                    // Assume last 2 parts are judge name
                    judgeName = parts.slice(-2).join('').trim();
                    
                    // Look for class in remaining parts
                    const remaining = parts.slice(0, -2).join('');
                    const classMatch = remaining.match(/(Patrol|Detective|Investigator|Super Sleuth|Private Inv|Novice|Open|Excellent|Masters|FAST|Jumpers|Standard|Premier|Wildcard|Snooker)(\s*\d*)/);
                    if (classMatch) {
                        className = classMatch[0].trim();
                    }
                }
            }
            
            // Method 3: Manual parsing based on your specific examples
            if (!className || !judgeName) {
                // For: BJShirley OttmerPatrol 1Linda Alberda
                // Try to find where class starts by looking for known patterns
                const lineForAnalysis = restOfLine;
                
                // Look for patterns like "Patrol 1", "Detective 2", etc.
                const classRegex = /(Patrol|Detective|Investigator|Super Sleuth|Private Inv)\s*\d*/g;
                const classMatch = lineForAnalysis.match(classRegex);
                
                if (classMatch) {
                    className = classMatch[0];
                    
                    // Find where this class appears in the line
                    const classIndex = lineForAnalysis.indexOf(className);
                    
                    // Everything after the class is the judge
                    judgeName = lineForAnalysis.substring(classIndex + className.length).trim();
                }
            }
            
            // Clean up the names
            className = className.trim();
            judgeName = judgeName.trim();
            
            // Store the parsed data
            if (className && judgeName) {
                csvData.push({
                    regNumber: regNumber,
                    line: line,
                    className: className,
                    judgeName: judgeName
                });
                
                // Add to unique lists
                if (className && !csvClasses.includes(className)) {
                    csvClasses.push(className);
                }
                
                if (judgeName && !csvJudges.includes(judgeName)) {
                    csvJudges.push(judgeName);
                }
            }
            
        } catch (error) {
            console.warn('Error parsing line ' + (index + 1) + ':', line, error);
        }
    });
    
    // Sort the arrays for better UX
    csvClasses.sort();
    csvJudges.sort();
    
    console.log('✅ Parsed CSV data:', {
        classes: csvClasses,
        judges: csvJudges,
        sampleData: csvData.slice(0, 3)
    });
}

// Enhanced function to populate judge dropdown with CSV data
function populateJudgeDropdown(selectElement) {
    if (!selectElement) return;
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Judge --</option>';
    
    // Use CSV judges if available, otherwise fall back to default
    var judges = csvJudges.length > 0 ? csvJudges : [
        "Amanda Askell", "Andrew Anderson", "Barbara Brown", "Carol Chen", "David Davis",
        "Emily Evans", "Frank Fisher", "Grace Garcia", "Henry Harris", "Isabel Johnson",
        "Jack Jackson", "Karen King", "Lisa Lopez", "Michael Miller", "Nancy Nelson"
    ];
    
    judges.forEach(function(judge) {
        var option = document.createElement('option');
        option.value = judge;
        option.textContent = judge;
        if (judge === currentValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
    
    console.log('✅ Judge dropdown populated with', judges.length, 'judges');
}

// Enhanced function to populate class dropdown with CSV data
function populateClassDropdown(selectElement) {
    if (!selectElement) return;
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Class --</option>';
    
    // Use CSV classes if available, otherwise fall back to default
    var classes = csvClasses.length > 0 ? csvClasses : [
        "Agility - Novice", "Agility - Open", "Agility - Excellent", "Agility - Masters",
        "Jumpers - Novice", "Jumpers - Open", "Jumpers - Excellent", "Jumpers - Masters",
        "FAST", "Standard", "Premier Standard", "Wildcard", "Snooker"
    ];
    
    classes.forEach(function(className) {
        var option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        if (className === currentValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
    
    console.log('✅ Class dropdown populated with', classes.length, 'classes');
}

// Function to update all existing dropdowns with CSV data
function updateAllDropdownsWithCSVData() {
    // Update all judge dropdowns
    var judgeSelects = document.querySelectorAll('select[data-type="judge"], .judge-select, select[id*="judge"]');
    judgeSelects.forEach(function(select) {
        populateJudgeDropdown(select);
    });
    
    // Update all class dropdowns
    var classSelects = document.querySelectorAll('select[data-type="class"], .class-select, select[id*="class"][id*="name"]');
    classSelects.forEach(function(select) {
        populateClassDropdown(select);
    });
    
    console.log('✅ All dropdowns updated with CSV data');
}

// Fallback function if CSV loading fails
function useDefaultDropdownData() {
    csvJudges = [
        "Amanda Askell", "Andrew Anderson", "Barbara Brown", "Carol Chen", "David Davis",
        "Emily Evans", "Frank Fisher", "Grace Garcia", "Henry Harris", "Isabel Johnson"
    ];
    
    csvClasses = [
        "Agility - Novice", "Agility - Open", "Agility - Excellent", "Agility - Masters",
        "Jumpers - Novice", "Jumpers - Open", "FAST", "Standard", "Premier"
    ];
    
    updateAllDropdownsWithCSVData();
    console.log('✅ Using default dropdown data');
}

// Enhanced trial setup function with CSV data support
function generateClassesForDayWithCSV(dayNum) {
    var numClasses = parseInt(document.getElementById('day' + dayNum + '_numClasses').value) || 1;
    var container = document.getElementById('day' + dayNum + '_classes');
    
    if (!container) return;
    
    var html = '<h4 style="color: #2c5aa0; margin-bottom: 15px;">Classes for Day ' + dayNum + ':</h4>';
    
    for (var c = 1; c <= numClasses; c++) {
        html += `
            <div style="background: #fff3cd; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #ffc107;">
                <h5 style="margin: 0 0 15px 0; color: #856404;">Class ${c}</h5>
                <div style="display: grid; grid-template-columns: 2fr 1fr 2fr; gap: 15px;">
                    
                    <!-- 1. CLASS NAME (DROPDOWN) -->
                    <div class="form-group">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Class Name:</label>
                        <select id="day${dayNum}_class${c}_name" 
                                data-type="class"
                                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px; background: white;">
                            <option value="">-- Select Class --</option>
                        </select>
                    </div>
                    
                    <!-- 2. ROUNDS (DROPDOWN) -->
                    <div class="form-group">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Rounds:</label>
                        <select id="day${dayNum}_class${c}_round" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px; background: white;">
                            <option value="1">Round 1</option>
                            <option value="2">Round 2</option>
                            <option value="3">Round 3</option>
                            <option value="4">Round 4</option>
                            <option value="5">Round 5</option>
                        </select>
                    </div>
                    
                    <!-- 3. JUDGE (DROPDOWN) -->
                    <div class="form-group">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Judge:</label>
                        <select id="day${dayNum}_class${c}_judge" 
                                data-type="judge"
                                style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px; background: white;">
                            <option value="">-- Select Judge --</option>
                        </select>
                    </div>
                </div>
                
                <!-- FEO Option -->
                <div style="margin-top: 15px;">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" id="day${dayNum}_class${c}_feo" style="margin-right: 8px; transform: scale(1.2);">
                        <span style="font-weight: bold; color: #2c5aa0;">Offer FEO (For Exhibition Only)</span>
                    </label>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Populate dropdowns with CSV data
    setTimeout(function() {
        populateDropdownsForDay(dayNum);
    }, 100);
    
    console.log('✅ Classes generated for Day ' + dayNum + ' with CSV data support');
}

// Function to populate dropdowns for a specific day
function populateDropdownsForDay(dayNum) {
    // Find all dropdowns for this day and populate them
    var judgeSelects = document.querySelectorAll(`select[id*="day${dayNum}"][id*="judge"]`);
    judgeSelects.forEach(function(select) {
        populateJudgeDropdown(select);
    });
    
    var classSelects = document.querySelectorAll(`select[id*="day${dayNum}"][id*="class"][id*="name"]`);
    classSelects.forEach(function(select) {
        populateClassDropdown(select);
    });
}

// Initialize CSV loading when the application starts
function initializeCSVData() {
    // Load CSV data when user logs in or page loads
    loadCSVData();
}

// Enhanced showMainApp function to load CSV data on login
function showMainAppWithCSV() {
    document.getElementById('authOverlay').style.display = 'none';
    document.getElementById('mainApp').classList.remove('hidden');
    
    if (currentUser) {
        document.getElementById('userInfo').textContent = 
            'Welcome, ' + currentUser.fullName + ' (' + currentUser.username + ')';
    }
    
    // Add dashboard buttons
    addDashboardButton();
    addFullDashboardButton();
    
    // Enable all tabs
    enableAllTabsOnLogin();
    
    // Load CSV data for dropdowns
    initializeCSVData();
    
    console.log('✅ Main app shown with CSV data loading');
}

// Call this to test CSV loading manually
function testCSVLoading() {
    console.log('🧪 Testing CSV loading...');
    loadCSVData();
}

console.log('✅ CSV Data Loader initialized - will load judges and classes from data/dogs.csv');
    // Update global variables
    trialConfig = config;
    currentTrial = trialData;
    
    // Save to localStorage
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    userTrials[currentTrialId] = trialData;
    localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
    
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    publicTrials[currentTrialId] = trialData;
    localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    
    alert('✅ Trial "' + trialName + '" saved successfully!\n\nConfiguration:\n- ' + config.length + ' classes configured\n- ' + days + ' days\n- Ready for entries');
    
    // Update trials display
    if (typeof loadUserTrials === 'function') {
        loadUserTrials();
    }
    
    console.log('✅ Trial configuration saved with correct field order');
}
function initializeEnhancedSystem() {
    console.log('🚀 Enhanced Trial Management System Initialized');
    console.log('✅ Demo accounts: admin/admin and user/user');
    console.log('✅ Login authentication working');
    console.log('✅ Registration working');
    console.log('✅ All tabs will be enabled after login');
    console.log('✅ Entry deletion functionality available');
    console.log('✅ Edit trials with original selections');
    console.log('✅ Working dropdown menus for judges and classes');
}
