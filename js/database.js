// Fixed database.js - Complete replacement with syntax fixes

// Global variables for application state
var currentUser = null;
var trialConfig = [];
var entryResults = [];
var currentTrialId = null;
var currentTrial = null;
var csvJudges = [];
var csvClasses = [];
var csvData = [];

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
    var tabs = document.querySelectorAll('.auth-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    
    if (element) {
        element.classList.add('active');
    }
    
    var forms = document.querySelectorAll('.auth-form');
    for (var i = 0; i < forms.length; i++) {
        forms[i].classList.remove('active');
    }
    
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
    
    createDemoAccountsIfNeeded();
    
    var users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    
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
    
    addDashboardButton();
    addFullDashboardButton();
    enableAllTabsOnLogin();
    
    // Load CSV data for dropdowns and auto-fill
    loadCSVDataForDropdowns();
    
    console.log('✅ Main app shown, all tabs enabled');
}

function logout() {
    currentUser = null;
    currentTrialId = null;
    trialConfig = [];
    entryResults = [];
    
    document.getElementById('authOverlay').style.display = 'flex';
    document.getElementById('mainApp').classList.add('hidden');
    
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
        dashboardBtn.style.cssText = 'background: #17a2b8; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: bold; margin-left: 10px;';
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
        fullDashboardBtn.style.cssText = 'background: #6f42c1; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: bold; margin-left: 10px;';
        fullDashboardBtn.onclick = function() {
            showTab('trials', document.querySelector('.nav-tab[onclick*="trials"]'));
        };
        
        var dashboardBtn = document.getElementById('dashboardBtn');
        if (dashboardBtn) {
            userBar.insertBefore(fullDashboardBtn, dashboardBtn);
        }
    }
}

// ===== TAB ENABLING FUNCTIONS =====

function enableAllTabsOnLogin() {
    var navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(function(tab) {
        tab.style.display = 'inline-block';
        tab.style.opacity = '1';
        tab.style.pointerEvents = 'auto';
        tab.style.background = '#f8f9fa';
        tab.disabled = false;
        tab.classList.remove('disabled');
        
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

// ===== CSV DATA LOADING FOR DROPDOWNS =====

async function loadCSVDataForDropdowns() {
    try {
        console.log('🔄 Loading CSV data from data/dogs.csv...');
        
        var response = await fetch('data/dogs.csv');
        if (!response.ok) {
            throw new Error('CSV file not found at data/dogs.csv');
        }
        
        var csvText = await response.text();
        console.log('✅ CSV file loaded successfully');
        
        parseCSVForDropdowns(csvText);
        updateAllDropdownsWithCSVData();
        
        console.log('✅ CSV data processed for dropdowns:', {
            totalRecords: csvData.length,
            uniqueJudges: csvJudges.length,
            uniqueClasses: csvClasses.length
        });
        
    } catch (error) {
        console.warn('❌ Could not load CSV data:', error.message);
        console.log('📝 Using default dropdown data instead');
        useDefaultDropdownData();
    }
}

// Improved CSV Parser - Replace the parseCSVForDropdowns function in js/database.js

function parseCSVForDropdowns(csvText) {
    csvData = [];
    csvJudges = [];
    csvClasses = [];
    
    var lines = csvText.split('\n');
    console.log('📄 Processing ' + lines.length + ' lines from CSV');
    
    lines.forEach(function(line, index) {
        line = line.trim();
        if (!line) return;
        
        try {
            // Parse your format: 07-0001-01BJShirley OttmerPatrol 1Linda Alberda
            var regNumber = line.substring(0, 10); // 07-0001-01
            var restOfLine = line.substring(10); // BJShirley OttmerPatrol 1Linda Alberda
            
            console.log('🔍 Line ' + (index + 1) + ':', line);
            console.log('📝 Processing:', restOfLine);
            
            var dogName = '';
            var handlerName = '';
            var className = '';
            var judgeName = '';
            
            // Strategy: Look for class patterns to split the string
            var classPatterns = [
                'Super Sleuth 1', 'Super Sleuth 2', 'Super Sleuth 3', 'Super Sleuth 4', 'Super Sleuth 5',
                'Detective 1', 'Detective 2', 'Detective 3', 'Detective 4', 'Detective 5',
                'Investigator 1', 'Investigator 2', 'Investigator 3', 'Investigator 4', 'Investigator 5',
                'Patrol 1', 'Patrol 2', 'Patrol 3', 'Patrol 4', 'Patrol 5',
                'Private Inv', 'Private Investigation'
            ];
            
            var found = false;
            
            // Try each pattern to find the class
            for (var i = 0; i < classPatterns.length; i++) {
                var pattern = classPatterns[i];
                var patternIndex = restOfLine.indexOf(pattern);
                
                if (patternIndex !== -1) {
                    className = pattern;
                    
                    // Everything before the class pattern contains dog name and handler
                    var beforeClass = restOfLine.substring(0, patternIndex);
                    
                    // Everything after the class pattern is the judge
                    var afterClass = restOfLine.substring(patternIndex + pattern.length);
                    judgeName = afterClass.trim();
                    
                    // Now parse the beforeClass part to separate dog name and handler
                    // Look for capital letters to identify where names start
                    var nameMatches = beforeClass.match(/[A-Z][a-z]*/g);
                    
                    if (nameMatches && nameMatches.length >= 2) {
                        // First match is likely dog name
                        dogName = nameMatches[0];
                        
                        // Rest are handler name parts
                        handlerName = nameMatches.slice(1).join(' ');
                    } else {
                        // Fallback: try to split by looking for typical name patterns
                        var capitalLetterSplit = beforeClass.split(/(?=[A-Z])/);
                        if (capitalLetterSplit.length >= 3) {
                            dogName = capitalLetterSplit[1] || '';
                            handlerName = capitalLetterSplit.slice(2).join('').trim();
                        }
                    }
                    
                    found = true;
                    console.log('✅ Parsed - Dog:', dogName, 'Handler:', handlerName, 'Class:', className, 'Judge:', judgeName);
                    break;
                }
            }
            
            // Alternative parsing method if pattern matching failed
            if (!found) {
                console.log('⚠️ Pattern matching failed, trying alternative method...');
                
                // Try to manually parse based on your examples
                // Look for known judge names at the end
                var knownJudgePatterns = [
                    'Linda Alberda', 'Ginger Alpine', 'Paige Alpine-Malone', 'Anita Ambani', 'Denise Ames',
                    'Shirley Ottmer', 'Russ Hornfisher'
                ];
                
                for (var j = 0; j < knownJudgePatterns.length; j++) {
                    var judgePattern = knownJudgePatterns[j];
                    if (restOfLine.indexOf(judgePattern) !== -1) {
                        judgeName = judgePattern;
                        
                        // Remove judge from the end to get the rest
                        var withoutJudge = restOfLine.replace(judgePattern, '').trim();
                        
                        // Now look for class patterns in what's left
                        for (var k = 0; k < classPatterns.length; k++) {
                            var classPattern = classPatterns[k];
                            if (withoutJudge.indexOf(classPattern) !== -1) {
                                className = classPattern;
                                
                                // What's left should be dog name and handler
                                var withoutClassAndJudge = withoutJudge.replace(classPattern, '').trim();
                                
                                // Parse names from remaining text
                                var nameMatches = withoutClassAndJudge.match(/[A-Z][a-z]*/g);
                                if (nameMatches && nameMatches.length >= 2) {
                                    dogName = nameMatches[0];
                                    handlerName = nameMatches.slice(1).join(' ');
                                }
                                
                                found = true;
                                console.log('✅ Alternative parse - Dog:', dogName, 'Handler:', handlerName, 'Class:', className, 'Judge:', judgeName);
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            
            // Final fallback - manual parsing based on your specific examples
            if (!found) {
                console.log('⚠️ Trying manual parsing for line:', restOfLine);
                
                // For: BJShirley OttmerPatrol 1Linda Alberda
                if (restOfLine.includes('Patrol 1')) {
                    var parts = restOfLine.split('Patrol 1');
                    className = 'Patrol 1';
                    judgeName = parts[1].trim();
                    
                    var namePart = parts[0].trim();
                    if (namePart.includes('Shirley')) {
                        dogName = namePart.substring(0, namePart.indexOf('Shirley')).trim();
                        handlerName = namePart.substring(namePart.indexOf('Shirley')).trim();
                    }
                    found = true;
                }
                // Add more specific patterns as needed...
            }
            
            // Store the parsed data if we found all required fields
            if (className && judgeName) {
                csvData.push({
                    regNumber: regNumber,
                    dogName: dogName,
                    handlerName: handlerName,
                    className: className,
                    judgeName: judgeName,
                    line: line
                });
                
                // Add to unique lists
                if (!csvClasses.includes(className)) {
                    csvClasses.push(className);
                    console.log('➕ Added class:', className);
                }
                
                if (!csvJudges.includes(judgeName)) {
                    csvJudges.push(judgeName);
                    console.log('➕ Added judge:', judgeName);
                }
            } else {
                console.warn('❌ Could not fully parse line:', line);
                console.warn('   Found - Class:', className, 'Judge:', judgeName);
            }
            
        } catch (error) {
            console.error('❌ Error parsing line ' + (index + 1) + ':', line, error);
        }
    });
    
    // Sort the arrays for better UX
    csvClasses.sort();
    csvJudges.sort();
    
    console.log('✅ Final CSV parsing results:');
    console.log('📊 Total lines processed:', lines.length);
    console.log('📈 Successfully parsed records:', csvData.length);
    console.log('📚 Unique classes found (' + csvClasses.length + '):', csvClasses);
    console.log('👨‍⚖️ Unique judges found (' + csvJudges.length + '):', csvJudges);
    console.log('📋 Sample parsed data:', csvData.slice(0, 3));
    
    // Force immediate dropdown update
    forceUpdateAllDropdowns();
    
    return {
        classes: csvClasses,
        judges: csvJudges,
        totalRecords: csvData.length
    };
}

// Enhanced manual testing function to help debug parsing
function testCSVParsing() {
    console.log('🧪 Testing CSV parsing with sample data...');
    
    var sampleLines = [
        '07-0001-01BJShirley OttmerPatrol 1Linda Alberda',
        '07-0001-02JaidonShirley OttmerDetective 2Ginger Alpine',
        '07-0001-03JakeShirley OttmerInvestigator 3Paige Alpine-Malone',
        '07-0001-04OzoneShirley OttmerSuper Sleuth 4Anita Ambani',
        '07-0002-01LizRuss HornfisherPrivate InvDenise Ames'
    ];
    
    var testCSV = sampleLines.join('\n');
    console.log('📝 Test CSV data:');
    console.log(testCSV);
    
    console.log('\n🔄 Running parser...');
    var result = parseCSVForDropdowns(testCSV);
    
    console.log('\n📊 Test Results:');
    console.log('Classes found:', result.classes);
    console.log('Judges found:', result.judges);
    console.log('Total records:', result.totalRecords);
    
    return result;
}

// Function to manually reload CSV with better error reporting
async function reloadCSVWithDebugging() {
    try {
        console.log('🔄 Reloading CSV with enhanced debugging...');
        
        var response = await fetch('data/dogs.csv');
        if (!response.ok) {
            throw new Error('CSV file not found at data/dogs.csv (Status: ' + response.status + ')');
        }
        
        var csvText = await response.text();
        console.log('✅ CSV loaded - Size:', csvText.length, 'characters');
        console.log('📄 Total lines in file:', csvText.split('\n').length);
        console.log('📝 First 5 lines:');
        csvText.split('\n').slice(0, 5).forEach(function(line, index) {
            console.log('  Line ' + (index + 1) + ':', line);
        });
        
        var result = parseCSVForDropdowns(csvText);
        
        console.log('\n🎯 Final Summary:');
        console.log('Expected to find: Multiple classes and judges');
        console.log('Actually found:', result.classes.length, 'classes and', result.judges.length, 'judges');
        
        return result;
        
    } catch (error) {
        console.error('❌ Failed to reload CSV:', error);
        return null;
    }
}

// Enhanced class pattern detection for your specific format
function detectClassPatterns(text) {
    var patterns = [
        /Patrol\s*\d+/g,
        /Detective\s*\d+/g,
        /Investigator\s*\d+/g,
        /Super Sleuth\s*\d+/g,
        /Private Inv/g
    ];
    
    var found = [];
    patterns.forEach(function(pattern) {
        var matches = text.match(pattern);
        if (matches) {
            found = found.concat(matches);
        }
    });
    
    return found;
}

console.log('✅ Improved CSV parser loaded');
console.log('🧪 Test functions available:');
console.log('   - testCSVParsing() : Test with sample data');
console.log('   - reloadCSVWithDebugging() : Reload CSV with detailed logging');
console.log('   - detectClassPatterns(text) : Find class patterns in text');

function populateJudgeDropdown(selectElement) {
    if (!selectElement) return;
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Judge --</option>';
    
    var judges = csvJudges.length > 0 ? csvJudges : [
        "Amanda Askell", "Andrew Anderson", "Barbara Brown", "Carol Chen", "David Davis"
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
}

function populateClassDropdown(selectElement) {
    if (!selectElement) return;
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Class --</option>';
    
    var classes = csvClasses.length > 0 ? csvClasses : [
        "Agility - Novice", "Agility - Open", "Agility - Excellent", "Agility - Masters"
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
}

function updateAllDropdownsWithCSVData() {
    setTimeout(function() {
        var judgeSelects = document.querySelectorAll('select[data-type="judge"], .judge-select, select[id*="judge"]');
        judgeSelects.forEach(function(select) {
            populateJudgeDropdown(select);
        });
        
        var classSelects = document.querySelectorAll('select[data-type="class"], .class-select, select[id*="class"][id*="name"]');
        classSelects.forEach(function(select) {
            populateClassDropdown(select);
        });
        
        console.log('✅ All dropdowns updated with CSV data');
    }, 500);
}

function useDefaultDropdownData() {
    csvJudges = ["Amanda Askell", "Andrew Anderson", "Barbara Brown", "Carol Chen", "David Davis"];
    csvClasses = ["Agility - Novice", "Agility - Open", "Agility - Excellent", "Agility - Masters"];
    updateAllDropdownsWithCSVData();
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
        container.innerHTML = '<div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 10px;"><h3>No Trials Found</h3><p>You haven\'t created any trials yet.</p><button onclick="createNewTrial()" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Create New Trial</button></div>';
    } else {
        var html = '<h3>My Trials</h3>';
        
        trialIds.forEach(function(trialId) {
            var trial = userTrials[trialId];
            var isMyTrial = currentUser && trial.owner === currentUser.username;
            
            html += '<div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"><div style="display: flex; justify-content: space-between; align-items: center;"><div><div style="font-weight: bold; color: #2c5aa0; font-size: 16px;">' + (trial.name || 'Unnamed Trial') + '</div><div style="font-size: 14px; color: #666; margin-top: 5px;">Created: ' + (trial.created ? new Date(trial.created).toLocaleDateString() : 'Unknown') + ' | Classes: ' + (trial.config ? trial.config.length : 0) + ' | Entries: ' + (trial.results ? trial.results.length : 0) + '</div></div><div style="display: flex; gap: 5px; flex-direction: column;">' + (isMyTrial ? '<button onclick="editTrial(\'' + trialId + '\')" style="background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%;">⚙️ Edit Trial</button>' : '') + (isMyTrial ? '<button onclick="deleteTrial(\'' + trialId + '\')" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%;">🗑️ Delete</button>' : '') + '</div></div></div>';
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
    
    var trialNameField = document.getElementById('trialName');
    var clubNameField = document.getElementById('clubName');
    var locationField = document.getElementById('trialLocation');
    
    if (trialNameField) trialNameField.value = '';
    if (clubNameField) clubNameField.value = '';
    if (locationField) locationField.value = '';
    
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
    
    if (typeof showTab === 'function') {
        showTab('setup', document.querySelector('.nav-tab[onclick*="setup"]'));
    }
    
    populateTrialEditForm(trial);
    
    alert('✅ Trial "' + trial.name + '" loaded for editing!');
}

function populateTrialEditForm(trial) {
    if (!trial) return;
    
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
    
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    if (userTrials[currentTrialId]) {
        userTrials[currentTrialId].results = entryResults;
        userTrials[currentTrialId].updated = new Date().toISOString();
        localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
    }
    
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    if (publicTrials[currentTrialId]) {
        publicTrials[currentTrialId].results = entryResults;
        publicTrials[currentTrialId].updated = new Date().toISOString();
        localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    }
}

// ===== MISSING FUNCTION STUBS =====

function loadEntryTabWithTrialSelection() {
    console.log('loadEntryTabWithTrialSelection called');
}

function loadEntryFormTabWithTrialSelection() {
    console.log('loadEntryFormTabWithTrialSelection called');
}

function loadResultsTabWithTrialSelection() {
    console.log('loadResultsTabWithTrialSelection called');
}

function updateAllDisplays() {
    if (typeof loadUserTrials === 'function') {
        loadUserTrials();
    }
}

// ===== INITIALIZATION =====

createDemoAccountsIfNeeded();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('✅ Database.js initialized');
    });
} else {
    console.log('✅ Database.js initialized');
}
// Dropdown Population Fix - Add to js/database.js to replace existing functions

// Enhanced CSV parsing with better data extraction
function parseCSVForDropdowns(csvText) {
    csvData = [];
    csvJudges = [];
    csvClasses = [];
    
    var lines = csvText.split('\n');
    console.log('📄 Processing ' + lines.length + ' lines from CSV');
    
    lines.forEach(function(line, index) {
        line = line.trim();
        if (!line) return;
        
        try {
            // Parse: 07-0001-01BJShirley OttmerPatrol 1Linda Alberda
            var regNumber = line.substring(0, 10);
            var restOfLine = line.substring(10);
            
            console.log('🔍 Processing line ' + (index + 1) + ':', restOfLine);
            
            var className = '';
            var judgeName = '';
            
            // Enhanced pattern matching for classes
            var classPatterns = [
                'Patrol 1', 'Patrol 2', 'Patrol 3', 'Patrol 4', 'Patrol 5',
                'Detective 1', 'Detective 2', 'Detective 3', 'Detective 4', 'Detective 5',
                'Investigator 1', 'Investigator 2', 'Investigator 3', 'Investigator 4', 'Investigator 5',
                'Super Sleuth 1', 'Super Sleuth 2', 'Super Sleuth 3', 'Super Sleuth 4', 'Super Sleuth 5',
                'Private Inv', 'Private Investigation',
                'Patrol', 'Detective', 'Investigator', 'Super Sleuth'
            ];
            
            // Sort patterns by length (longest first) for better matching
            classPatterns.sort(function(a, b) { return b.length - a.length; });
            
            // Find class pattern in the line
            for (var i = 0; i < classPatterns.length; i++) {
                var pattern = classPatterns[i];
                var patternIndex = restOfLine.indexOf(pattern);
                if (patternIndex !== -1) {
                    className = pattern;
                    
                    // Everything after the class pattern should be the judge name
                    var afterClass = restOfLine.substring(patternIndex + pattern.length).trim();
                    
                    // Clean up judge name (remove any remaining numbers)
                    judgeName = afterClass.replace(/^\d+\s*/, '').trim();
                    
                    console.log('✅ Found class:', className, 'Judge:', judgeName);
                    break;
                }
            }
            
            // Alternative method if no pattern found
            if (!className || !judgeName) {
                // Try to split by capital letters to find sections
                var parts = restOfLine.match(/[A-Z][a-z]*\s*\d*/g);
                if (parts && parts.length >= 3) {
                    // Look for known class keywords
                    for (var j = 0; j < parts.length; j++) {
                        if (parts[j].match(/(Patrol|Detective|Investigator|Super|Private)/i)) {
                            className = parts[j];
                            if (j + 1 < parts.length && /^\d+$/.test(parts[j + 1])) {
                                className += ' ' + parts[j + 1];
                                judgeName = parts.slice(j + 2).join(' ');
                            } else {
                                judgeName = parts.slice(j + 1).join(' ');
                            }
                            break;
                        }
                    }
                }
            }
            
            // Store data if we found both class and judge
            if (className && judgeName) {
                csvData.push({
                    regNumber: regNumber,
                    className: className,
                    judgeName: judgeName,
                    line: line
                });
                
                // Add to unique lists
                if (!csvClasses.includes(className)) {
                    csvClasses.push(className);
                }
                
                if (!csvJudges.includes(judgeName)) {
                    csvJudges.push(judgeName);
                }
                
                console.log('📝 Stored:', { class: className, judge: judgeName });
            } else {
                console.warn('⚠️ Could not parse line:', line);
            }
            
        } catch (error) {
            console.error('❌ Error parsing line ' + (index + 1) + ':', line, error);
        }
    });
    
    // Sort the arrays for better UX
    csvClasses.sort();
    csvJudges.sort();
    
    console.log('✅ Final CSV parsing results:');
    console.log('📊 Classes found:', csvClasses);
    console.log('👨‍⚖️ Judges found:', csvJudges);
    console.log('📈 Total records:', csvData.length);
    
    // Force immediate dropdown update
    forceUpdateAllDropdowns();
}

// Force update all dropdowns with CSV data
function forceUpdateAllDropdowns() {
    console.log('🔄 Force updating all dropdowns with CSV data...');
    
    // Wait a moment then update all dropdowns
    setTimeout(function() {
        updateAllExistingDropdowns();
    }, 100);
    
    // Also update after a longer delay to catch any dynamically created dropdowns
    setTimeout(function() {
        updateAllExistingDropdowns();
    }, 1000);
    
    // And one more time after an even longer delay
    setTimeout(function() {
        updateAllExistingDropdowns();
    }, 2000);
}

// Update all existing dropdowns with CSV data
function updateAllExistingDropdowns() {
    console.log('🔧 Updating all existing dropdowns...');
    
    // Find and update all judge dropdowns
    var judgeSelects = document.querySelectorAll('select[data-type="judge"], select[id*="judge"], .judge-select');
    console.log('🔍 Found ' + judgeSelects.length + ' judge dropdowns');
    
    judgeSelects.forEach(function(select, index) {
        console.log('📝 Updating judge dropdown ' + (index + 1));
        populateJudgeDropdownWithCSV(select);
    });
    
    // Find and update all class dropdowns
    var classSelects = document.querySelectorAll('select[data-type="class"], select[id*="class"][id*="name"], .class-select');
    console.log('🔍 Found ' + classSelects.length + ' class dropdowns');
    
    classSelects.forEach(function(select, index) {
        console.log('📝 Updating class dropdown ' + (index + 1));
        populateClassDropdownWithCSV(select);
    });
    
    console.log('✅ All dropdowns updated with CSV data');
}

// Enhanced populate judge dropdown with CSV data
function populateJudgeDropdownWithCSV(selectElement) {
    if (!selectElement) return;
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Judge --</option>';
    
    // Use CSV judges if available
    var judges = csvJudges.length > 0 ? csvJudges : [
        "Linda Alberda", "Ginger Alpine", "Paige Alpine-Malone", "Anita Ambani", "Denise Ames"
    ];
    
    console.log('👨‍⚖️ Populating judge dropdown with:', judges);
    
    judges.forEach(function(judge) {
        var option = document.createElement('option');
        option.value = judge;
        option.textContent = judge;
        if (judge === currentValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
    
    // Add visual indicator that CSV data was loaded
    selectElement.style.borderColor = '#28a745';
    selectElement.title = 'Loaded from CSV: ' + judges.length + ' judges';
    
    console.log('✅ Judge dropdown populated with ' + judges.length + ' judges');
}

// Enhanced populate class dropdown with CSV data
function populateClassDropdownWithCSV(selectElement) {
    if (!selectElement) return;
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Class --</option>';
    
    // Use CSV classes if available
    var classes = csvClasses.length > 0 ? csvClasses : [
        "Patrol 1", "Detective 2", "Investigator 3", "Super Sleuth 4", "Private Inv"
    ];
    
    console.log('📚 Populating class dropdown with:', classes);
    
    classes.forEach(function(className) {
        var option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        if (className === currentValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
    
    // Add visual indicator that CSV data was loaded
    selectElement.style.borderColor = '#28a745';
    selectElement.title = 'Loaded from CSV: ' + classes.length + ' classes';
    
    console.log('✅ Class dropdown populated with ' + classes.length + ' classes');
}

// Override the original functions to use CSV versions
function populateJudgeDropdown(selectElement) {
    populateJudgeDropdownWithCSV(selectElement);
}

function populateClassDropdown(selectElement) {
    populateClassDropdownWithCSV(selectElement);
}

// Enhanced CSV loading with better error handling
async function loadCSVDataForDropdowns() {
    try {
        console.log('🔄 Loading CSV data from data/dogs.csv...');
        
        var response = await fetch('data/dogs.csv');
        if (!response.ok) {
            throw new Error('CSV file not found at data/dogs.csv (Status: ' + response.status + ')');
        }
        
        var csvText = await response.text();
        console.log('✅ CSV file loaded successfully, size:', csvText.length, 'characters');
        console.log('📄 First 200 characters of CSV:', csvText.substring(0, 200));
        
        parseCSVForDropdowns(csvText);
        
    } catch (error) {
        console.error('❌ Could not load CSV data:', error.message);
        console.log('📝 Using default dropdown data instead');
        useDefaultDropdownData();
    }
}

// Enhanced default data fallback
function useDefaultDropdownData() {
    csvJudges = [
        "Linda Alberda", "Ginger Alpine", "Paige Alpine-Malone", "Anita Ambani", "Denise Ames",
        "Amanda Askell", "Andrew Anderson", "Barbara Brown", "Carol Chen", "David Davis"
    ];
    
    csvClasses = [
        "Patrol 1", "Detective 2", "Investigator 3", "Super Sleuth 4", "Private Inv",
        "Agility - Novice", "Agility - Open", "Agility - Excellent", "Agility - Masters"
    ];
    
    console.log('📝 Using default data - Judges:', csvJudges.length, 'Classes:', csvClasses.length);
    forceUpdateAllDropdowns();
}

// Manual function to refresh dropdowns (can be called from console)
function refreshAllDropdowns() {
    console.log('🔄 Manual dropdown refresh requested...');
    updateAllExistingDropdowns();
}

// Manual function to reload CSV data (can be called from console)
function reloadCSVData() {
    console.log('🔄 Manual CSV reload requested...');
    loadCSVDataForDropdowns();
}

console.log('✅ Enhanced dropdown population system loaded');
console.log('💡 Manual commands available: refreshAllDropdowns(), reloadCSVData()');

// Auto-refresh dropdowns when new elements are added to the page
var observer = new MutationObserver(function(mutations) {
    var shouldUpdate = false;
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1 && node.tagName === 'SELECT') {
                    shouldUpdate = true;
                }
                if (node.nodeType === 1 && node.querySelectorAll && node.querySelectorAll('select').length > 0) {
                    shouldUpdate = true;
                }
            });
        }
    });
    
    if (shouldUpdate) {
        console.log('🔄 New dropdowns detected, updating with CSV data...');
        setTimeout(updateAllExistingDropdowns, 200);
    }
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log('👀 Dropdown observer started - will auto-update new dropdowns');
