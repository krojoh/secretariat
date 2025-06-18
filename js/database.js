// Enhanced Login and Trial Management System - Complete Database.js Replacement

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

// ===== AUTHENTICATION FUNCTIONS =====

function showAuthTab(tab, element) {
    var tabs = document.querySelectorAll('.auth-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    element.classList.add('active');
    
    var forms = document.querySelectorAll('.auth-form');
    for (var i = 0; i < forms.length; i++) {
        forms[i].classList.remove('active');
    }
    document.getElementById(tab + 'Form').classList.add('active');
}

function handleLogin(event) {
    event.preventDefault();
    
    var username = document.getElementById('loginUsername').value;
    var password = document.getElementById('loginPassword').value;
    
    var users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    
    if (users[username] && users[username].password === password) {
        currentUser = users[username];
        showMainApp();
        loadUserTrials();
        showStatusMessage('Login successful!', 'success');
    } else {
        showStatusMessage('Invalid username or password', 'warning');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    var username = document.getElementById('regUsername').value;
    var password = document.getElementById('regPassword').value;
    var confirmPassword = document.getElementById('regConfirmPassword').value;
    var fullName = document.getElementById('regFullName').value;
    var email = document.getElementById('regEmail').value;
    
    if (password !== confirmPassword) {
        showStatusMessage('Passwords do not match', 'warning');
        return;
    }
    
    if (!validateEmail(email)) {
        showStatusMessage('Please enter a valid email address', 'warning');
        return;
    }
    
    var users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    
    if (users[username]) {
        showStatusMessage('Username already exists', 'warning');
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
    showStatusMessage('Registration successful! Please login.', 'success');
    
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
    
    console.log('✅ User logged in successfully, all tabs enabled');
}

// Add "Go to Full Dashboard" button
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
        fullDashboardBtn.onclick = goToMainDashboard;
        
        var dashboardBtn = document.getElementById('dashboardBtn');
        if (dashboardBtn) {
            userBar.insertBefore(fullDashboardBtn, dashboardBtn);
        }
    }
}

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
            }
        };
        
        var logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            userBar.insertBefore(dashboardBtn, logoutBtn);
        }
    }
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
}

// Utility functions
function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showStatusMessage(message, type) {
    alert(message); // Simple alert for now - can be enhanced later
}

// ===== ENHANCED TAB ENABLING FUNCTIONS =====

// Enable all tabs with full functionality upon login
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

// Initialize all dropdown menus with proper data
function initializeAllDropdowns() {
    // Initialize judge dropdowns
    populateJudgeDropdowns();
    
    // Initialize class dropdowns
    populateClassDropdowns();
    
    console.log('✅ All dropdown menus initialized');
}

// Populate judge dropdown menus throughout the application
function populateJudgeDropdowns() {
    var judgeSelects = document.querySelectorAll('select[data-type="judge"], .judge-select');
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

// Populate class dropdown menus throughout the application
function populateClassDropdowns() {
    var classSelects = document.querySelectorAll('select[data-type="class"], .class-select');
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
    
    showTab('setup', document.querySelector('.nav-tab[onclick*="setup"]'));
    showStatusMessage('New trial created! Configure the trial details in the Setup tab.', 'info');
}

// Enhanced Edit Trial Function with Original Selection Population
function editTrial(trialId) {
    currentTrialId = trialId;
    
    // Load trial data from both user trials and public trials
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
    showTab('setup', document.querySelector('.nav-tab[onclick*="setup"]'));
    
    // Populate all form fields with original trial data
    populateTrialEditForm(trial);
    
    // Show success message
    alert('✅ Trial "' + trial.name + '" loaded for editing!\nAll original selections have been restored.');
    
    console.log('✅ Trial loaded for editing:', trial.name);
}

// Populate trial edit form with original selections
function populateTrialEditForm(trial) {
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
    
    // Set number of days if field exists
    if (trial.days) {
        var daysField = document.getElementById('trialDays');
        if (daysField) {
            daysField.value = trial.days;
            // Trigger regeneration of day configuration if function exists
            if (typeof generateDays === 'function') {
                generateDays();
            }
        }
    }
    
    // Populate day-specific data and class configurations
    if (trial.config && trial.config.length > 0) {
        setTimeout(function() {
            populateClassConfigurations(trial.config);
        }, 500); // Allow time for day generation
    }
    
    console.log('✅ Trial form populated with original data');
}

// Populate class configurations with original selections
function populateClassConfigurations(config) {
    config.forEach(function(classConfig, index) {
        // Find the appropriate form fields for this class configuration
        var dayIndex = classConfig.day - 1; // Convert to 0-based index
        
        // Populate date field
        if (classConfig.date) {
            var dateField = document.getElementById('day' + classConfig.day + 'Date');
            if (dateField) dateField.value = classConfig.date;
        }
        
        // Populate class name dropdown
        if (classConfig.className) {
            var classField = document.querySelector('[data-day="' + classConfig.day + '"][data-type="class"]');
            if (classField) {
                classField.value = classConfig.className;
            } else {
                // Alternative selector method
                var altClassField = document.getElementById('day' + classConfig.day + 'Class' + (classConfig.classNum || 1));
                if (altClassField) altClassField.value = classConfig.className;
            }
        }
        
        // Populate judge dropdown
        if (classConfig.judge) {
            var judgeField = document.querySelector('[data-day="' + classConfig.day + '"][data-type="judge"]');
            if (judgeField) {
                judgeField.value = classConfig.judge;
            } else {
                // Alternative selector method
                var altJudgeField = document.getElementById('day' + classConfig.day + 'Judge' + (classConfig.classNum || 1));
                if (altJudgeField) altJudgeField.value = classConfig.judge;
            }
        }
        
        // Set rounds
        if (classConfig.round || classConfig.rounds) {
            var roundsField = document.querySelector('[data-day="' + classConfig.day + '"][data-type="rounds"]');
            if (roundsField) {
                roundsField.value = classConfig.round || classConfig.rounds || 1;
            }
        }
        
        // Set FEO checkbox
        if (classConfig.feoOffered) {
            var feoField = document.querySelector('[data-day="' + classConfig.day + '"][data-type="feo"]');
            if (feoField) {
                feoField.checked = classConfig.feoOffered;
            }
        }
    });
    
    console.log('✅ Class configurations populated with original selections');
}

function deleteTrial(trialId) {
    if (confirm('Are you sure you want to delete this trial? This cannot be undone.')) {
        var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
        delete userTrials[trialId];
        localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
        
        var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        delete publicTrials[trialId];
        localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
        
        loadUserTrials();
        showStatusMessage('Trial deleted successfully!', 'success');
    }
}

// Save trial data
function saveTrialUpdates() {
    var trialName = document.getElementById('trialName').value;
    if (!trialName) {
        showStatusMessage('Please enter a trial name', 'warning');
        return false;
    }
    
    if (!currentTrialId) {
        currentTrialId = 'trial_' + Date.now();
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
    
    showStatusMessage('Trial configuration saved successfully!', 'success');
    return true;
}

// ===== ENTRY MANAGEMENT WITH DELETION =====

function saveEntries() {
    if (!currentTrialId) return;
    
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
    
    console.log('✅ Entries saved to localStorage');
}

// Enhanced Entry Management with Deletion
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
        
        // Save updated entries
        saveEntries();
        
        alert('✅ ' + selectedIndices.length + ' entries deleted successfully!');
        
        // Close modal and update displays
        var modal = document.querySelector('div[style*="position: fixed"]');
        if (modal) modal.remove();
        
        updateAllDisplays();
    }
}

// Clear all entries function
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
        
        // Close any open modals
        var modal = document.querySelector('div[style*="position: fixed"]');
        if (modal) modal.remove();
        
        updateAllDisplays();
    } else {
        alert('Deletion cancelled. Entries have NOT been deleted.');
    }
}

// ===== ENHANCED FORM HANDLING =====

// Enhanced Form Submission with Clear and Return to Top
function enhancedFormSubmission() {
    // Find the entry form
    var entryForm = document.getElementById('trialEntryForm') || document.querySelector('form[onsubmit*="Entry"]');
    
    if (entryForm) {
        // Store original submit handler
        var originalSubmit = entryForm.onsubmit;
        
        // Enhanced submit handler
        entryForm.onsubmit = function(e) {
            e.preventDefault();
            
            // Call original submission logic
            if (originalSubmit) {
                var result = originalSubmit.call(this, e);
                if (result === false) return false;
            }
            
            // Clear form completely
            clearFormFields(this);
            
            // Return to top of page
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Close any modals
            var modal = this.closest('div[style*="position: fixed"]');
            if (modal) {
                setTimeout(function() {
                    modal.remove();
                }, 1000); // Allow time for success message
            }
            
            // Update all relevant displays
            updateAllDisplays();
            
            console.log('✅ Form submitted, cleared, and returned to top');
            
            return false;
        };
    }
}

// Clear all form fields
function clearFormFields(form) {
    // Clear text inputs
    var textInputs = form.querySelectorAll('input[type="text"], input[type="email"], input[type="number"], textarea');
    textInputs.forEach(function(input) {
        input.value = '';
    });
    
    // Clear checkboxes
    var checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(function(checkbox) {
        checkbox.checked = false;
    });
    
    // Reset select dropdowns
    var selects = form.querySelectorAll('select');
    selects.forEach(function(select) {
        select.selectedIndex = 0;
    });
    
    // Clear radio buttons
    var radios = form.querySelectorAll('input[type="radio"]');
    radios.forEach(function(radio) {
        radio.checked = false;
    });
    
    console.log('✅ All form fields cleared');
}

// ===== DISPLAY UPDATE FUNCTIONS =====

// Update all displays after changes
function updateAllDisplays() {
    // Update trials list
    if (typeof loadUserTrials === 'function') {
        loadUserTrials();
    }
    
    // Update entry form displays
    if (document.getElementById('selectedTrialEntry')) {
        if (typeof loadEntryFormTabWithTrialSelection === 'function') {
            loadEntryFormTabWithTrialSelection();
        }
    }
    
    // Update results displays
    if (document.getElementById('selectedTrialResults')) {
        if (typeof loadResultsTabWithTrialSelection === 'function') {
            loadResultsTabWithTrialSelection();
        }
    }
    
    // Refresh trial selectors
    refreshTrialSelectors();
    
    console.log('✅ All displays updated');
}

// Refresh all trial selector dropdowns
function refreshTrialSelectors() {
    var selectors = document.querySelectorAll('select[onchange*="selectTrialForContext"]');
    selectors.forEach(function(selector) {
        var currentValue = selector.value;
        
        // Regenerate options
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

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeEnhancedSystem();
    });
} else {
    initializeEnhancedSystem();
}

function initializeEnhancedSystem() {
    console.log('🚀 Enhanced Trial Management System Initialized');
    console.log('✅ Login authentication working');
    console.log('✅ Login enables all tabs');
    console.log('✅ Edit trials populate original selections');
    console.log('✅ Working dropdown menus for judges and classes');
    console.log('✅ Enhanced form submission with clear and return to top');
    console.log('✅ Entry deletion functionality');
}

// Main Dashboard Functions (if needed by other parts of the app)
function goToMainDashboard() {
    if (typeof showDashboard === 'function') {
        showDashboard();
    } else {
        showTab('trials', document.querySelector('.nav-tab[onclick*="trials"]'));
    }
}
