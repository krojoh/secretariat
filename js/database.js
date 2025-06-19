// COMPLETE CLEAN TRIAL MANAGEMENT SYSTEM
// Replace js/database.js entirely with this clean version

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

// EXACT CSV PARSER FOR YOUR FORMAT - Replace parseCSVData function in js/database.js

// REPLACE the parseCSVData function in js/database.js with this enhanced version

function parseCSVData(csvText) {
    csvJudges = [];
    csvClasses = [];
    csvData = [];
    
    const lines = csvText.split('\n');
    console.log('📄 Processing CSV with ' + lines.length + ' total lines');
    
    let successfulParses = 0;
    let skippedLines = 0;
    let judgeSet = new Set(); // Use Set to avoid duplicates but preserve order
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
                
                // More robust validation and cleaning
                if (registration && registration.match(/^\d{2}-\d{4}-\d{2}/)) {
                    
                    // Process class name
                    if (className && className.length > 0) {
                        // Clean up class name (remove extra spaces, standardize)
                        const cleanClassName = className.replace(/\s+/g, ' ').trim();
                        if (cleanClassName && !classSet.has(cleanClassName)) {
                            classSet.add(cleanClassName);
                            csvClasses.push(cleanClassName);
                        }
                    }
                    
                    // Process judge name with enhanced cleaning
                    if (judgeName && judgeName.length > 1) {
                        // Clean up judge name
                        let cleanJudgeName = judgeName
                            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
                            .trim()                // Remove leading/trailing spaces
                            .replace(/[""'']/g, '') // Remove quotes
                            .replace(/\.$/, '');    // Remove trailing period
                        
                        // Additional validation - must look like a name
                        if (cleanJudgeName.length > 2 && 
                            cleanJudgeName.match(/[A-Za-z]/) && 
                            !cleanJudgeName.match(/^[\d\s]*$/)) { // Not just numbers and spaces
                            
                            if (!judgeSet.has(cleanJudgeName)) {
                                judgeSet.add(cleanJudgeName);
                                csvJudges.push(cleanJudgeName);
                            }
                        }
                    }
                    
                    // Store complete record
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
                skippedLines++;
            }
            
        } catch (error) {
            skippedLines++;
        }
    });
    
    console.log('✅ CSV Parsing Complete:');
    console.log('📊 Total lines processed:', lines.length);
    console.log('✅ Successfully parsed:', successfulParses);
    console.log('⏭️ Skipped lines:', skippedLines);
    console.log('📚 Unique classes found (in original order):', csvClasses.length);
    console.log('👨‍⚖️ Unique judges found (in original order):', csvJudges.length);
}

// Enhanced populate functions that preserve order
function populateClassDropdown(selectElement) {
    if (!selectElement) return;
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Class --</option>';
    
    // Use CSV classes in ORIGINAL ORDER (no sorting)
    var classes = csvClasses.length > 0 ? csvClasses : [
        "Patrol 1", "Detective 2", "Investigator 3", "Super Sleuth 4", "Private Inv"
    ];
    
    console.log('📚 Populating class dropdown with ' + classes.length + ' classes (preserving CSV order)');
    
    classes.forEach(function(className, index) {
        var option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        if (className === currentValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
    
    // Visual indicator showing order preserved
    selectElement.style.borderColor = '#007bff';
    selectElement.title = 'Classes in original CSV order (' + classes.length + ' total)';
    
    console.log('✅ Class dropdown populated with ' + classes.length + ' classes in original order');
}

function populateJudgeDropdown(selectElement) {
    if (!selectElement) return;
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Judge --</option>';
    
    // Use CSV judges in ORIGINAL ORDER (no sorting)
    var judges = csvJudges.length > 0 ? csvJudges : [
        "Linda Alberda", "Ginger Alpine", "Paige Alpine-Malone", "Anita Ambani", "Denise Ames"
    ];
    
    console.log('👨‍⚖️ Populating judge dropdown with ' + judges.length + ' judges (preserving CSV order)');
    
    judges.forEach(function(judgeName, index) {
        var option = document.createElement('option');
        option.value = judgeName;
        option.textContent = judgeName;
        if (judgeName === currentValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
    
    // Visual indicator showing order preserved
    selectElement.style.borderColor = '#007bff';
    selectElement.title = 'Judges in original CSV order (' + judges.length + ' total)';
    
    console.log('✅ Judge dropdown populated with ' + judges.length + ' judges in original order');
}

// Console command to test the exact parser
async function testExactCSVParsing() {
    try {
        console.log('🧪 Testing exact CSV parsing...');
        
        const response = await fetch('data/dogs.csv');
        if (!response.ok) {
            throw new Error('CSV file not found');
        }
        
        const csvText = await response.text();
        console.log('✅ CSV loaded - Size:', Math.round(csvText.length / 1024) + ' KB');
        
        // Show first few lines to verify format
        const lines = csvText.split('\n');
        console.log('📋 First 5 lines of CSV:');
        lines.slice(0, 5).forEach((line, index) => {
            console.log(`${index + 1}: ${line}`);
        });
        
        // Parse with new function
        parseCSVData(csvText);
        
        // Update dropdowns
        if (typeof populateAllDropdowns === 'function') {
            populateAllDropdowns();
            console.log('✅ Dropdowns updated with CSV data in original order');
        }
        
        // Show results summary
        console.log('\n🎯 RESULTS SUMMARY:');
        console.log('📊 Total CSV lines:', lines.length);
        console.log('📚 Classes found:', csvClasses.length);
        console.log('👨‍⚖️ Judges found:', csvJudges.length);
        console.log('📝 Complete records:', csvData.length);
        
        return {
            totalLines: lines.length,
            classes: csvClasses.length,
            judges: csvJudges.length,
            records: csvData.length
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return null;
    }
}

// Console command to verify dropdown order
function verifyDropdownOrder() {
    console.log('🔍 Verifying dropdown order...');
    
    console.log('\n📚 Classes in dropdown order:');
    csvClasses.forEach((className, index) => {
        console.log(`${index + 1}. ${className}`);
    });
    
    console.log('\n👨‍⚖️ Judges in dropdown order:');
    csvJudges.forEach((judgeName, index) => {
        console.log(`${index + 1}. ${judgeName}`);
    });
    
    console.log('\n✅ Order verification complete - data shown as found in CSV');
}

console.log('✅ Exact CSV parser loaded (preserves original order)');
console.log('💡 Commands:');
console.log('  - testExactCSVParsing() : Parse your exact CSV format');
console.log('  - verifyDropdownOrder() : Check the order of dropdown items');

// Auto-run the test
console.log('\n🚀 Auto-testing CSV parsing...');
testExactCSVParsing();

function useDefaultData() {
    csvJudges = ["Linda Alberda", "Ginger Alpine", "Paige Alpine-Malone", "Anita Ambani", "Denise Ames"];
    csvClasses = ["Patrol 1", "Detective 2", "Investigator 3", "Super Sleuth 4", "Private Inv"];
}

// ===== TRIAL SETUP SYSTEM =====
function generateDays() {
    var days = parseInt(document.getElementById('trialDays').value) || 1;
    var container = document.getElementById('daysContainer');
    
    if (!container) return;
    
    var html = '';
    for (var i = 1; i <= days; i++) {
        html += `
            <div class="day-container" style="background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 10px; border: 2px solid #2c5aa0;">
                <h4 style="background: #2c5aa0; color: white; margin: -20px -20px 20px -20px; padding: 15px; border-radius: 8px 8px 0 0;">
                    Day ${i}
                </h4>
                
                <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                    <div style="flex: 1;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Date:</label>
                        <input type="date" id="day${i}_date" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Number of Classes:</label>
                        <input type="number" id="day${i}_numClasses" min="1" max="20" value="2" onchange="generateClassesForDay(${i})" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                </div>
                
                <div id="day${i}_classes"></div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Generate classes for each day
    for (var i = 1; i <= days; i++) {
        generateClassesForDay(i);
    }
}

function generateClassesForDay(dayNum) {
    var numClasses = parseInt(document.getElementById('day' + dayNum + '_numClasses').value) || 2;
    var container = document.getElementById('day' + dayNum + '_classes');
    
    if (!container) return;
    
    var html = '<h5 style="color: #2c5aa0; margin-bottom: 15px;">Classes for Day ' + dayNum + ':</h5>';
    
    for (var c = 1; c <= numClasses; c++) {
        html += generateSingleClass(dayNum, c);
    }
    
    container.innerHTML = html;
    populateAllDropdowns();
}

function generateSingleClass(dayNum, classNum) {
    return `
        <div class="class-setup" style="background: #fff3cd; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h6 style="margin: 0 0 20px 0; color: #856404; font-weight: bold;">Class ${classNum}</h6>
            
            <!-- Class Name and Rounds Selection -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; font-weight: bold; margin-bottom: 8px;">Class Name:</label>
                    <select id="day${dayNum}_class${classNum}_name" 
                            data-type="class"
                            style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; background: white; font-size: 14px;">
                        <option value="">-- Select Class --</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; font-weight: bold; margin-bottom: 8px;">How Many Rounds:</label>
                    <select id="day${dayNum}_class${classNum}_rounds" 
                            onchange="generateRoundsForClass(${dayNum}, ${classNum})"
                            style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; background: white; font-size: 14px;">
                        <option value="">How Many Rounds</option>
                        <option value="1">1 Round</option>
                        <option value="2">2 Rounds</option>
                        <option value="3">3 Rounds</option>
                        <option value="4">4 Rounds</option>
                        <option value="5">5 Rounds</option>
                        <option value="6">6 Rounds</option>
                        <option value="7">7 Rounds</option>
                        <option value="8">8 Rounds</option>
                        <option value="9">9 Rounds</option>
                        <option value="10">10 Rounds</option>
                    </select>
                </div>
            </div>
            
            <!-- Rounds Container - Judges will be created here -->
            <div id="day${dayNum}_class${classNum}_rounds_container">
                <p style="color: #666; font-style: italic; text-align: center; padding: 20px;">
                    Select number of rounds above to configure judges for each round
                </p>
            </div>
        </div>
    `;
}

function generateRoundsForClass(dayNum, classNum) {
    var numRounds = parseInt(document.getElementById('day' + dayNum + '_class' + classNum + '_rounds').value);
    var container = document.getElementById('day' + dayNum + '_class' + classNum + '_rounds_container');
    
    if (!container || !numRounds) {
        if (container) {
            container.innerHTML = '<p style="color: #666; font-style: italic; text-align: center; padding: 20px;">Select number of rounds above to configure judges for each round</p>';
        }
        return;
    }
    
    var html = '<h6 style="color: #2c5aa0; margin-bottom: 15px;">Configure ' + numRounds + ' Round' + (numRounds > 1 ? 's' : '') + ':</h6>';
    
    for (var r = 1; r <= numRounds; r++) {
        html += `
            <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border: 1px solid #ddd;">
                <div style="display: grid; grid-template-columns: 1fr 2fr auto; gap: 15px; align-items: end;">
                    
                    <div>
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">Round:</label>
                        <input type="text" 
                               value="Round ${r}" 
                               readonly 
                               style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 5px; background: #f9f9f9; text-align: center; font-weight: bold;">
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">Judge:</label>
                        <select id="day${dayNum}_class${classNum}_round${r}_judge" 
                                data-type="judge"
                                style="width: 100%; padding: 8px; border: 2px solid #ddd; border-radius: 5px; background: white;">
                            <option value="">-- Select Judge --</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">FEO:</label>
                        <label style="display: flex; align-items: center; cursor: pointer; background: #f8f9fa; padding: 8px 12px; border-radius: 5px; border: 1px solid #ddd;">
                            <input type="checkbox" 
                                   id="day${dayNum}_class${classNum}_round${r}_feo" 
                                   style="margin-right: 8px; transform: scale(1.3);">
                            <span style="font-size: 12px; font-weight: bold; color: #28a745;">FEO</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Populate the new judge dropdowns
    setTimeout(function() {
        populateAllDropdowns();
    }, 100);
    
    console.log('✅ Generated ' + numRounds + ' rounds for Day ' + dayNum + ' Class ' + classNum);
}

function populateAllDropdowns() {
    // Populate class dropdowns
    document.querySelectorAll('select[data-type="class"]').forEach(select => {
        populateClassDropdown(select);
    });
    
    // Populate judge dropdowns
    document.querySelectorAll('select[data-type="judge"]').forEach(select => {
        populateJudgeDropdown(select);
    });
}

function populateClassDropdown(selectElement) {
    if (!selectElement) return;
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Class --</option>';
    
    var classes = csvClasses.length > 0 ? csvClasses : ["Patrol 1", "Detective 2", "Investigator 3"];
    
    classes.forEach(className => {
        var option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        if (className === currentValue) option.selected = true;
        selectElement.appendChild(option);
    });
}

function populateJudgeDropdown(selectElement) {
    if (!selectElement) return;
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Judge --</option>';
    
    var judges = csvJudges.length > 0 ? csvJudges : ["Linda Alberda", "Ginger Alpine", "Paige Alpine-Malone"];
    
    judges.forEach(judgeName => {
        var option = document.createElement('option');
        option.value = judgeName;
        option.textContent = judgeName;
        if (judgeName === currentValue) option.selected = true;
        selectElement.appendChild(option);
    });
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
    
    // Clear form fields
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
    
    // Collect configuration data
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
    
    // Save to storage
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

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Clean Trial Management System Loaded');
    console.log('🎯 Features: Rounds create multiple judge dropdowns with FEO boxes');
    console.log('📝 Demo accounts: admin/admin, user/user');
});

// ===== UTILITY FUNCTIONS =====
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== MISSING FUNCTION STUBS =====
function initializeTestUsers() { createDemoAccounts(); }
function loadEntryTabWithTrialSelection() { console.log('Entry tab loaded'); }
function loadEntryFormTabWithTrialSelection() { console.log('Entry form tab loaded'); }
function loadResultsTabWithTrialSelection() { console.log('Results tab loaded'); }
function updateAllDisplays() { if (typeof loadUserTrials === 'function') loadUserTrials(); }
// ADD this missing function to the end of your js/database.js file

function saveTrialUpdates() {
    if (!currentUser) {
        alert('Please log in to save trials.');
        return false;
    }
    
    var trialName = document.getElementById('trialName').value.trim();
    if (!trialName) {
        alert('Please enter a trial name.');
        return false;
    }
    
    if (!currentTrialId) {
        currentTrialId = 'trial_' + Date.now();
    }
    
    // Use the enhanced configuration collection
    var config = [];
    if (typeof collectTrialConfiguration === 'function') {
        config = collectTrialConfiguration();
    } else {
        // Fallback configuration collection
        config = collectBasicTrialConfiguration();
    }
    
    var trialData = {
        name: trialName,
        clubName: document.getElementById('clubName').value || '',
        location: document.getElementById('trialLocation').value || '',
        config: config,
        results: entryResults || [],
        owner: currentUser.username,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };
    
    // Save to user trials
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    userTrials[currentTrialId] = trialData;
    localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
    
    // Save to public trials
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    publicTrials[currentTrialId] = trialData;
    localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    
    // Update global variables
    trialConfig = config;
    currentTrial = trialData;
    
    alert('✅ Trial "' + trialName + '" saved successfully!\n\nConfiguration:\n- ' + config.length + ' class/round combinations\n- Ready for entries');
    
    // Update trials display
    if (typeof loadUserTrials === 'function') {
        loadUserTrials();
    }
    
    console.log('✅ Trial configuration saved:', trialData);
    return true;
}

// Fallback configuration collection if the main one doesn't exist
function collectBasicTrialConfiguration() {
    var config = [];
    var days = parseInt(document.getElementById('trialDays').value) || 1;
    
    for (var day = 1; day <= days; day++) {
        var dayDateElement = document.getElementById('day' + day + '_date');
        var numClassesElement = document.getElementById('day' + day + '_numClasses');
        
        var dayDate = dayDateElement ? dayDateElement.value : '';
        var numClasses = numClassesElement ? parseInt(numClassesElement.value) || 2 : 2;
        
        for (var classNum = 1; classNum <= numClasses; classNum++) {
            var classNameElement = document.getElementById('day' + day + '_class' + classNum + '_name');
            var roundsElement = document.getElementById('day' + day + '_class' + classNum + '_rounds');
            
            if (classNameElement && roundsElement) {
                var className = classNameElement.value;
                var numRounds = parseInt(roundsElement.value);
                
                if (className && numRounds) {
                    for (var round = 1; round <= numRounds; round++) {
                        var judgeElement = document.getElementById('day' + day + '_class' + classNum + '_round' + round + '_judge');
                        var feoElement = document.getElementById('day' + day + '_class' + classNum + '_round' + round + '_feo');
                        
                        config.push({
                            day: day,
                            date: dayDate,
                            classNum: classNum,
                            className: className,
                            round: round,
                            judge: judgeElement ? judgeElement.value : '',
                            feoOffered: feoElement ? feoElement.checked : false
                        });
                    }
                }
            }
        }
    }
    
    console.log('✅ Collected ' + config.length + ' class/round configurations');
    return config;
}

// Also add the main save function if it's missing
function saveTrialConfiguration() {
    return saveTrialUpdates();
}

console.log('✅ Missing save functions added');
// ===== SEARCHABLE DROPDOWNS =====
function makeDropdownSearchable(selectElement) {
    if (!selectElement || selectElement.dataset.searchable) return;
    
    console.log('🔍 Making dropdown searchable:', selectElement.id);
    
    // Mark as processed
    selectElement.dataset.searchable = 'true';
    
    // Hide original select
    selectElement.style.display = 'none';
    
    // Create container
    var container = document.createElement('div');
    container.style.cssText = 'position: relative; width: 100%;';
    selectElement.parentNode.insertBefore(container, selectElement);
    container.appendChild(selectElement);
    
    // Create search input
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = selectElement.options[0] ? selectElement.options[0].text : 'Type to search...';
    searchInput.style.cssText = `
        width: 100%; 
        padding: 10px 12px; 
        border: 2px solid #ddd; 
        border-radius: 8px; 
        background: white; 
        font-size: 14px;
        box-sizing: border-box;
    `;
    
    // Create dropdown list
    var dropdownList = document.createElement('div');
    dropdownList.style.cssText = `
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
    
    container.appendChild(searchInput);
    container.appendChild(dropdownList);
    
    // Store all options
    var allOptions = Array.from(selectElement.options).slice(1); // Skip first "-- Select --" option
    
    // Function to populate dropdown list
    function populateList(filteredOptions) {
        dropdownList.innerHTML = '';
        
        if (filteredOptions.length === 0) {
            var noResults = document.createElement('div');
            noResults.textContent = 'No matches found';
            noResults.style.cssText = 'padding: 10px; color: #666; font-style: italic; text-align: center;';
            dropdownList.appendChild(noResults);
        } else {
            filteredOptions.forEach(function(option) {
                var item = document.createElement('div');
                item.textContent = option.text;
                item.style.cssText = `
                    padding: 10px 12px;
                    cursor: pointer;
                    border-bottom: 1px solid #f0f0f0;
                    transition: background-color 0.2s;
                `;
                
                item.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#e3f2fd';
                });
                
                item.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = '';
                });
                
                item.addEventListener('click', function() {
                    // Update original select
                    selectElement.value = option.value;
                    
                    // Update search input
                    searchInput.value = option.text;
                    searchInput.style.borderColor = '#28a745';
                    
                    // Hide dropdown
                    dropdownList.style.display = 'none';
                    
                    // Trigger change event
                    var event = new Event('change', { bubbles: true });
                    selectElement.dispatchEvent(event);
                    
                    console.log('✅ Selected:', option.text);
                });
                
                dropdownList.appendChild(item);
            });
        }
    }
    
    // Search functionality
    searchInput.addEventListener('input', function() {
        var searchTerm = this.value.toLowerCase();
        
        if (searchTerm === '') {
            dropdownList.style.display = 'none';
            selectElement.value = '';
            this.style.borderColor = '#ddd';
            return;
        }
        
        var filteredOptions = allOptions.filter(function(option) {
            return option.text.toLowerCase().includes(searchTerm);
        });
        
        populateList(filteredOptions);
        dropdownList.style.display = 'block';
        this.style.borderColor = '#2196f3';
    });
    
    // Show all options when focused
    searchInput.addEventListener('focus', function() {
        if (this.value === '') {
            populateList(allOptions);
            dropdownList.style.display = 'block';
        }
        this.style.borderColor = '#2196f3';
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            dropdownList.style.display = 'none';
            searchInput.style.borderColor = '#ddd';
        }
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        var items = dropdownList.querySelectorAll('div');
        var currentIndex = Array.from(items).findIndex(item => item.style.backgroundColor === 'rgb(227, 242, 253)');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            var nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            if (items[nextIndex]) {
                items.forEach(item => item.style.backgroundColor = '');
                items[nextIndex].style.backgroundColor = '#e3f2fd';
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            var prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            if (items[prevIndex]) {
                items.forEach(item => item.style.backgroundColor = '');
                items[prevIndex].style.backgroundColor = '#e3f2fd';
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            var highlighted = Array.from(items).find(item => item.style.backgroundColor === 'rgb(227, 242, 253)');
            if (highlighted) {
                highlighted.click();
            }
        } else if (e.key === 'Escape') {
            dropdownList.style.display = 'none';
            this.style.borderColor = '#ddd';
        }
    });
    
    console.log('✅ Searchable dropdown created for:', selectElement.id);
}

// Function to make all dropdowns searchable
function makeAllDropdownsSearchable() {
    console.log('🔍 Converting all dropdowns to searchable...');
    
    // Find all select elements
    var selects = document.querySelectorAll('select');
    var count = 0;
    
    selects.forEach(function(select) {
        // Skip if already processed or has very few options
        if (select.dataset.searchable || select.options.length < 5) return;
        
        makeDropdownSearchable(select);
        count++;
    });
    
    console.log('✅ Made ' + count + ' dropdowns searchable');
}

// Function to apply all UI improvements
function applyUIImprovements() {
    console.log('🎨 Applying all UI improvements...');
    
    // Improve tabs
    improveTabs();
    
    // Make dropdowns searchable
    makeAllDropdownsSearchable();
    
    // Set up automatic detection for new dropdowns
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                setTimeout(function() {
                    makeAllDropdownsSearchable();
                }, 200);
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ UI improvements applied and monitoring for new elements');
}

// CSS for permanent tab improvements (add to css/main.css)
function generateTabCSS() {
    return `
/* Enhanced Navigation Tabs - Add this to css/main.css */
.nav-tabs {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 30px;
    border-bottom: 3px solid #2c5aa0;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 5px;
    border-radius: 10px 10px 0 0;
}

.nav-tab {
    padding: 15px 25px;
    background: linear-gradient(135deg, #ffffff 0%, #f1f3f4 100%);
    border: 2px solid #dee2e6;
    cursor: pointer;
    font-weight: bold;
    font-size: 14px;
    border-radius: 8px;
    margin: 3px;
    transition: all 0.3s ease;
    color: #495057 !important;
    text-shadow: 0 1px 2px rgba(255,255,255,0.8);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-tab:hover {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    border-color: #2196f3;
    color: #1976d2 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.nav-tab.active {
    background: linear-gradient(135deg, #2c5aa0 0%, #1e3d72 100%);
    color: white !important;
    border-color: #1e3d72;
    text-shadow: 0 1px 3px rgba(0,0,0,0.3);
    box-shadow: 0 4px 12px rgba(44, 90, 160, 0.3);
    transform: translateY(-1px);
}

.nav-tab.active:hover {
    background: linear-gradient(135deg, #1e3d72 0%, #2c5aa0 100%);
    transform: translateY(-2px);
}

.nav-tab * {
    color: inherit !important;
}

/* Searchable dropdown styling */
.searchable-dropdown {
    position: relative;
}

.searchable-dropdown input {
    width: 100%;
    padding: 10px 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: white;
    font-size: 14px;
    box-sizing: border-box;
}

.searchable-dropdown input:focus {
    border-color: #2196f3;
    outline: none;
    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
}
`;
}

// Auto-run improvements
console.log('🚀 Loading UI improvements...');
applyUIImprovements();

// Make available globally
window.applyUIImprovements = applyUIImprovements;
window.makeAllDropdownsSearchable = makeAllDropdownsSearchable;
window.improveTabs = improveTabs;

console.log('✅ UI Improvements loaded!');
console.log('💡 Commands available:');
console.log('  - applyUIImprovements() : Apply all improvements');
console.log('  - makeAllDropdownsSearchable() : Convert dropdowns');
console.log('  - improveTabs() : Fix tab contrast');
console.log('  - generateTabCSS() : Get CSS for permanent fix');

// Instructions for permanent fix
console.log('\n📝 For permanent fixes:');
console.log('1. Add the CSS from generateTabCSS() to your css/main.css file');
console.log('2. Add the JavaScript functions to your js files');
console.log('3. Call applyUIImprovements() after login');
// ENHANCED AUTO-COMPLETE DROPDOWN SYSTEM
// Add this to your existing js/database.js or create a new js/autocomplete.js

// ===== ENHANCED AUTO-COMPLETE DROPDOWN SYSTEM =====

// Convert any select element to an auto-complete dropdown
function makeDropdownAutoComplete(selectElement) {
    if (!selectElement || selectElement.dataset.autocomplete) return;
    
    console.log('🔍 Converting to auto-complete:', selectElement.id);
    
    // Mark as processed
    selectElement.dataset.autocomplete = 'true';
    
    // Hide original select
    selectElement.style.display = 'none';
    
    // Create container
    var container = document.createElement('div');
    container.className = 'autocomplete-container';
    container.style.cssText = 'position: relative; width: 100%;';
    selectElement.parentNode.insertBefore(container, selectElement);
    container.appendChild(selectElement);
    
    // Create search input with enhanced styling
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'autocomplete-input';
    searchInput.placeholder = selectElement.options[0] ? selectElement.options[0].text : 'Type to search...';
    searchInput.style.cssText = `
        width: 100%; 
        padding: 12px 40px 12px 16px; 
        border: 2px solid #ddd; 
        border-radius: 8px; 
        background: white url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 12px center;
        background-size: 16px;
        font-size: 14px;
        box-sizing: border-box;
        transition: all 0.3s ease;
        font-family: inherit;
    `;
    
    // Create dropdown list with enhanced styling
    var dropdownList = document.createElement('div');
    dropdownList.className = 'autocomplete-dropdown';
    dropdownList.style.cssText = `
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
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        margin-top: -1px;
    `;
    
    container.appendChild(searchInput);
    container.appendChild(dropdownList);
    
    // Store all options (skip first "-- Select --" option)
    var allOptions = Array.from(selectElement.options).slice(1);
    
    // Function to populate dropdown list with enhanced items
    function populateList(filteredOptions, searchTerm = '') {
        dropdownList.innerHTML = '';
        
        if (filteredOptions.length === 0) {
            var noResults = document.createElement('div');
            noResults.className = 'autocomplete-no-results';
            noResults.textContent = searchTerm ? `No matches for "${searchTerm}"` : 'No options available';
            noResults.style.cssText = `
                padding: 16px; 
                color: #6b7280; 
                font-style: italic; 
                text-align: center;
                background: #f9fafb;
                border-bottom: 1px solid #e5e7eb;
            `;
            dropdownList.appendChild(noResults);
        } else {
            filteredOptions.forEach(function(option, index) {
                var item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.dataset.value = option.value;
                
                // Highlight matching text
                var displayText = option.text;
                if (searchTerm) {
                    var regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    displayText = option.text.replace(regex, '<mark style="background: #fef08a; color: #854d0e; padding: 0 2px; border-radius: 2px;">$1</mark>');
                }
                
                item.innerHTML = displayText;
                item.style.cssText = `
                    padding: 12px 16px;
                    cursor: pointer;
                    border-bottom: 1px solid #f3f4f6;
                    transition: all 0.2s ease;
                    font-size: 14px;
                    position: relative;
                `;
                
                // Enhanced hover effects
                item.addEventListener('mouseenter', function() {
                    // Remove hover from all items
                    dropdownList.querySelectorAll('.autocomplete-item').forEach(i => {
                        i.style.backgroundColor = '';
                        i.style.borderLeft = '';
                    });
                    // Add hover to this item
                    this.style.backgroundColor = '#eff6ff';
                    this.style.borderLeft = '4px solid #3b82f6';
                });
                
                item.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = '';
                    this.style.borderLeft = '';
                });
                
                // Click handler
                item.addEventListener('click', function() {
                    selectOption(option);
                });
                
                dropdownList.appendChild(item);
            });
        }
    }
    
    // Function to select an option
    function selectOption(option) {
        // Update original select
        selectElement.value = option.value;
        
        // Update search input
        searchInput.value = option.text;
        searchInput.style.borderColor = '#10b981';
        searchInput.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
        
        // Hide dropdown
        dropdownList.style.display = 'none';
        
        // Add success animation
        searchInput.style.background = `white url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2310b981' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 13l4 4L19 7'/%3e%3c/svg%3e") no-repeat right 12px center`;
        searchInput.style.backgroundSize = '16px';
        
        // Reset background after 2 seconds
        setTimeout(function() {
            searchInput.style.background = `white url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 12px center`;
            searchInput.style.backgroundSize = '16px';
            searchInput.style.borderColor = '#ddd';
            searchInput.style.boxShadow = '';
        }, 2000);
        
        // Trigger change event
        var event = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(event);
        
        console.log('✅ Selected:', option.text);
    }
    
    // Search functionality with enhanced filtering
    searchInput.addEventListener('input', function() {
        var searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            dropdownList.style.display = 'none';
            selectElement.value = '';
            this.style.borderColor = '#ddd';
            this.style.boxShadow = '';
            return;
        }
        
        // Enhanced filtering - match start of words and full text
        var filteredOptions = allOptions.filter(function(option) {
            var text = option.text.toLowerCase();
            return text.includes(searchTerm) || 
                   text.split(' ').some(word => word.startsWith(searchTerm));
        });
        
        // Sort results by relevance
        filteredOptions.sort(function(a, b) {
            var aText = a.text.toLowerCase();
            var bText = b.text.toLowerCase();
            var aStarts = aText.startsWith(searchTerm);
            var bStarts = bText.startsWith(searchTerm);
            
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return aText.localeCompare(bText);
        });
        
        populateList(filteredOptions, searchTerm);
        dropdownList.style.display = 'block';
        this.style.borderColor = '#3b82f6';
        this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
    });
    
    // Show all options when focused
    searchInput.addEventListener('focus', function() {
        if (this.value === '' && allOptions.length > 0) {
            populateList(allOptions);
            dropdownList.style.display = 'block';
        }
        this.style.borderColor = '#3b82f6';
        this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
    });
    
    // Enhanced keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        var items = dropdownList.querySelectorAll('.autocomplete-item');
        var currentIndex = -1;
        
        // Find currently highlighted item
        items.forEach(function(item, index) {
            if (item.style.backgroundColor === 'rgb(239, 246, 255)') {
                currentIndex = index;
            }
        });
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            var nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            highlightItem(items, nextIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            var prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            highlightItem(items, prevIndex);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentIndex >= 0 && items[currentIndex]) {
                var selectedValue = items[currentIndex].dataset.value;
                var selectedOption = allOptions.find(opt => opt.value === selectedValue);
                if (selectedOption) {
                    selectOption(selectedOption);
                }
            }
        } else if (e.key === 'Escape') {
            dropdownList.style.display = 'none';
            this.style.borderColor = '#ddd';
            this.style.boxShadow = '';
        }
    });
    
    // Helper function to highlight items
    function highlightItem(items, index) {
        items.forEach(function(item, i) {
            if (i === index) {
                item.style.backgroundColor = '#eff6ff';
                item.style.borderLeft = '4px solid #3b82f6';
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.style.backgroundColor = '';
                item.style.borderLeft = '';
            }
        });
    }
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            dropdownList.style.display = 'none';
            searchInput.style.borderColor = '#ddd';
            searchInput.style.boxShadow = '';
        }
    });
    
    console.log('✅ Auto-complete dropdown created for:', selectElement.id);
}

// Function to make all dropdowns auto-complete
function makeAllDropdownsAutoComplete() {
    console.log('🔍 Converting all dropdowns to auto-complete...');
    
    var selects = document.querySelectorAll('select[data-type="class"], select[data-type="judge"]');
    var count = 0;
    
    selects.forEach(function(select) {
        if (select.dataset.autocomplete || select.options.length < 2) return;
        
        makeDropdownAutoComplete(select);
        count++;
    });
    
    console.log('✅ Made ' + count + ' dropdowns auto-complete');
}

// Enhanced dropdown population that triggers auto-complete conversion
function populateDropdownWithAutoComplete(selectElement, options, placeholder) {
    if (!selectElement) return;
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = `<option value="">${placeholder}</option>`;
    
    options.forEach(function(option) {
        var optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        if (option === currentValue) {
            optionElement.selected = true;
        }
        selectElement.appendChild(optionElement);
    });
    
    // Convert to auto-complete after population
    setTimeout(function() {
        makeDropdownAutoComplete(selectElement);
    }, 100);
}

// Override existing populate functions to use auto-complete
function populateClassDropdownAutoComplete(selectElement) {
    var classes = (typeof csvClasses !== 'undefined' && csvClasses.length > 0) ? 
        csvClasses : ["Patrol 1", "Detective 2", "Investigator 3", "Super Sleuth 4", "Private Inv"];
    
    populateDropdownWithAutoComplete(selectElement, classes, "-- Select Class --");
}

function populateJudgeDropdownAutoComplete(selectElement) {
    var judges = (typeof csvJudges !== 'undefined' && csvJudges.length > 0) ? 
        csvJudges : ["Linda Alberda", "Ginger Alpine", "Paige Alpine-Malone", "Anita Ambani", "Denise Ames"];
    
    populateDropdownWithAutoComplete(selectElement, judges, "-- Select Judge --");
}

// Enhanced populateAllDropdowns function
function populateAllDropdownsWithAutoComplete() {
    document.querySelectorAll('select[data-type="class"]').forEach(function(select) {
        populateClassDropdownAutoComplete(select);
    });
    
    document.querySelectorAll('select[data-type="judge"]').forEach(function(select) {
        populateJudgeDropdownAutoComplete(select);
    });
    
    console.log('✅ All dropdowns populated with auto-complete functionality');
}

// Set up automatic detection for new dropdowns
function setupAutoCompleteObserver() {
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                setTimeout(function() {
                    makeAllDropdownsAutoComplete();
                }, 200);
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ Auto-complete observer set up');
}

// CSS for auto-complete styling
function addAutoCompleteCSS() {
    var style = document.createElement('style');
    style.textContent = `
        .autocomplete-container {
            position: relative;
            width: 100%;
        }
        
        .autocomplete-input:focus {
            outline: none;
        }
        
        .autocomplete-dropdown {
            font-family: inherit;
        }
        
        .autocomplete-item:last-child {
            border-bottom: none;
        }
        
        .autocomplete-dropdown::-webkit-scrollbar {
            width: 8px;
        }
        
        .autocomplete-dropdown::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }
        
        .autocomplete-dropdown::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
        }
        
        .autocomplete-dropdown::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
        
        @media (max-width: 768px) {
            .autocomplete-dropdown {
                max-height: 150px;
            }
            
            .autocomplete-item {
                padding: 14px 16px;
                font-size: 16px; /* Prevents zoom on iOS */
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize auto-complete system
function initializeAutoCompleteSystem() {
    console.log('🚀 Initializing auto-complete system...');
    
    // Add CSS
    addAutoCompleteCSS();
    
    // Convert existing dropdowns
    makeAllDropdownsAutoComplete();
    
    // Set up observer for new dropdowns
    setupAutoCompleteObserver();
    
    console.log('✅ Auto-complete system initialized');
}

// Console commands
console.log('✅ Enhanced Auto-Complete Dropdown System Loaded');
console.log('💡 Commands available:');
console.log('  - makeAllDropdownsAutoComplete() : Convert all dropdowns');
console.log('  - initializeAutoCompleteSystem() : Full initialization');
console.log('  - populateAllDropdownsWithAutoComplete() : Populate and convert');

// Export functions to global scope
window.makeDropdownAutoComplete = makeDropdownAutoComplete;
window.makeAllDropdownsAutoComplete = makeAllDropdownsAutoComplete;
window.populateAllDropdownsWithAutoComplete = populateAllDropdownsWithAutoComplete;
window.initializeAutoCompleteSystem = initializeAutoCompleteSystem;

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAutoCompleteSystem);
} else {
    initializeAutoCompleteSystem();
}
// FIXED AUTO-COMPLETE DROPDOWN SYSTEM
// This version properly disables browser autocomplete and ensures custom filtering works

// Convert any select element to a proper auto-complete dropdown
function makeDropdownAutoComplete(selectElement) {
    if (!selectElement || selectElement.dataset.autocomplete) return;
    
    console.log('🔍 Converting to auto-complete:', selectElement.id);
    
    // Mark as processed
    selectElement.dataset.autocomplete = 'true';
    
    // Hide original select
    selectElement.style.display = 'none';
    
    // Create container
    var container = document.createElement('div');
    container.className = 'autocomplete-container';
    container.style.cssText = 'position: relative; width: 100%;';
    selectElement.parentNode.insertBefore(container, selectElement);
    container.appendChild(selectElement);
    
    // Create search input with DISABLED browser autocomplete
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'autocomplete-input';
    
    // CRITICAL: Disable all browser autocomplete features
    searchInput.setAttribute('autocomplete', 'off');
    searchInput.setAttribute('autocorrect', 'off');
    searchInput.setAttribute('autocapitalize', 'off');
    searchInput.setAttribute('spellcheck', 'false');
    searchInput.setAttribute('role', 'combobox');
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.setAttribute('aria-autocomplete', 'list');
    
    searchInput.placeholder = selectElement.options[0] ? selectElement.options[0].text : 'Type to search...';
    searchInput.style.cssText = `
        width: 100%; 
        padding: 12px 40px 12px 16px; 
        border: 2px solid #ddd; 
        border-radius: 8px; 
        background: white url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 12px center;
        background-size: 16px;
        font-size: 14px;
        box-sizing: border-box;
        transition: all 0.3s ease;
        font-family: inherit;
    `;
    
    // Create dropdown list
    var dropdownList = document.createElement('div');
    dropdownList.className = 'autocomplete-dropdown';
    dropdownList.setAttribute('role', 'listbox');
    dropdownList.style.cssText = `
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
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        margin-top: -1px;
    `;
    
    container.appendChild(searchInput);
    container.appendChild(dropdownList);
    
    // Store all options (skip first "-- Select --" option)
    var allOptions = Array.from(selectElement.options).slice(1);
    var currentSelectedIndex = -1;
    
    console.log('📋 Available options:', allOptions.map(o => o.text));
    
    // Function to populate dropdown list
    function populateList(filteredOptions, searchTerm = '') {
        dropdownList.innerHTML = '';
        currentSelectedIndex = -1;
        
        console.log('🔍 Filtering with term "' + searchTerm + '", found ' + filteredOptions.length + ' matches');
        
        if (filteredOptions.length === 0) {
            var noResults = document.createElement('div');
            noResults.className = 'autocomplete-no-results';
            noResults.textContent = searchTerm ? `No matches for "${searchTerm}"` : 'No options available';
            noResults.style.cssText = `
                padding: 16px; 
                color: #6b7280; 
                font-style: italic; 
                text-align: center;
                background: #f9fafb;
                border-bottom: 1px solid #e5e7eb;
            `;
            dropdownList.appendChild(noResults);
        } else {
            filteredOptions.forEach(function(option, index) {
                var item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.setAttribute('role', 'option');
                item.dataset.value = option.value;
                item.dataset.index = index;
                
                // Highlight matching text
                var displayText = option.text;
                if (searchTerm && searchTerm.length > 0) {
                    var regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    displayText = option.text.replace(regex, '<mark style="background: #fef08a; color: #854d0e; padding: 0 2px; border-radius: 2px; font-weight: bold;">$1</mark>');
                }
                
                item.innerHTML = displayText;
                item.style.cssText = `
                    padding: 12px 16px;
                    cursor: pointer;
                    border-bottom: 1px solid #f3f4f6;
                    transition: all 0.2s ease;
                    font-size: 14px;
                    position: relative;
                `;
                
                // Mouse events
                item.addEventListener('mouseenter', function() {
                    highlightItem(parseInt(this.dataset.index));
                });
                
                item.addEventListener('click', function() {
                    selectOption(option);
                });
                
                dropdownList.appendChild(item);
            });
        }
        
        // Update ARIA attributes
        searchInput.setAttribute('aria-expanded', 'true');
        dropdownList.setAttribute('aria-activedescendant', '');
    }
    
    // Function to select an option
    function selectOption(option) {
        console.log('✅ Selecting option:', option.text);
        
        // Update original select
        selectElement.value = option.value;
        
        // Update search input
        searchInput.value = option.text;
        searchInput.style.borderColor = '#10b981';
        searchInput.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
        
        // Hide dropdown
        hideDropdown();
        
        // Success feedback
        searchInput.style.background = `white url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2310b981' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 13l4 4L19 7'/%3e%3c/svg%3e") no-repeat right 12px center`;
        searchInput.style.backgroundSize = '16px';
        
        // Reset background after 2 seconds
        setTimeout(function() {
            searchInput.style.background = `white url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") no-repeat right 12px center`;
            searchInput.style.backgroundSize = '16px';
            searchInput.style.borderColor = '#ddd';
            searchInput.style.boxShadow = '';
        }, 2000);
        
        // Trigger change event
        var event = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(event);
    }
    
    // Function to hide dropdown
    function hideDropdown() {
        dropdownList.style.display = 'none';
        searchInput.setAttribute('aria-expanded', 'false');
        currentSelectedIndex = -1;
    }
    
    // Function to show dropdown
    function showDropdown() {
        dropdownList.style.display = 'block';
        searchInput.setAttribute('aria-expanded', 'true');
    }
    
    // Function to highlight an item
    function highlightItem(index) {
        var items = dropdownList.querySelectorAll('.autocomplete-item');
        
        // Remove highlight from all items
        items.forEach(function(item) {
            item.style.backgroundColor = '';
            item.style.borderLeft = '';
        });
        
        // Highlight selected item
        if (index >= 0 && index < items.length) {
            currentSelectedIndex = index;
            var selectedItem = items[index];
            selectedItem.style.backgroundColor = '#eff6ff';
            selectedItem.style.borderLeft = '4px solid #3b82f6';
            selectedItem.scrollIntoView({ block: 'nearest' });
            
            // Update ARIA
            dropdownList.setAttribute('aria-activedescendant', selectedItem.id || '');
        }
    }
    
    // ENHANCED INPUT EVENT - This is the key fix!
    searchInput.addEventListener('input', function(e) {
        // Prevent browser autocomplete interference
        e.stopPropagation();
        
        var searchTerm = this.value.toLowerCase().trim();
        console.log('🔍 Input event - searching for:', '"' + searchTerm + '"');
        
        // If empty, hide dropdown and clear selection
        if (searchTerm === '') {
            hideDropdown();
            selectElement.value = '';
            this.style.borderColor = '#ddd';
            this.style.boxShadow = '';
            return;
        }
        
        // Enhanced filtering - match start of words and full text
        var filteredOptions = allOptions.filter(function(option) {
            var text = option.text.toLowerCase();
            var matches = text.includes(searchTerm) || 
                         text.split(' ').some(word => word.startsWith(searchTerm));
            return matches;
        });
        
        console.log('📋 Filtered results:', filteredOptions.map(o => o.text));
        
        // Sort results by relevance
        filteredOptions.sort(function(a, b) {
            var aText = a.text.toLowerCase();
            var bText = b.text.toLowerCase();
            var aStarts = aText.startsWith(searchTerm);
            var bStarts = bText.startsWith(searchTerm);
            
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return aText.localeCompare(bText);
        });
        
        // Show filtered results
        populateList(filteredOptions, searchTerm);
        showDropdown();
        this.style.borderColor = '#3b82f6';
        this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
    });
    
    // PREVENT keydown interference with custom input
    searchInput.addEventListener('keydown', function(e) {
        var items = dropdownList.querySelectorAll('.autocomplete-item');
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                e.stopPropagation();
                var nextIndex = currentSelectedIndex < items.length - 1 ? currentSelectedIndex + 1 : 0;
                highlightItem(nextIndex);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation();
                var prevIndex = currentSelectedIndex > 0 ? currentSelectedIndex - 1 : items.length - 1;
                highlightItem(prevIndex);
                break;
                
            case 'Enter':
                e.preventDefault();
                e.stopPropagation();
                if (currentSelectedIndex >= 0 && items[currentSelectedIndex]) {
                    var selectedValue = items[currentSelectedIndex].dataset.value;
                    var selectedOption = allOptions.find(opt => opt.value === selectedValue);
                    if (selectedOption) {
                        selectOption(selectedOption);
                    }
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                hideDropdown();
                this.style.borderColor = '#ddd';
                this.style.boxShadow = '';
                break;
                
            case 'Tab':
                // Allow normal tab behavior but hide dropdown
                hideDropdown();
                break;
                
            default:
                // For other keys, let the input event handle it
                break;
        }
    });
    
    // Focus event
    searchInput.addEventListener('focus', function() {
        console.log('📍 Input focused');
        if (this.value === '' && allOptions.length > 0) {
            populateList(allOptions);
            showDropdown();
        } else if (this.value !== '') {
            // Re-trigger filtering for current value
            var event = new Event('input', { bubbles: true });
            this.dispatchEvent(event);
        }
        this.style.borderColor = '#3b82f6';
        this.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
    });
    
    // Blur event
    searchInput.addEventListener('blur', function() {
        // Delay hiding dropdown to allow for clicks
        setTimeout(function() {
            hideDropdown();
            searchInput.style.borderColor = '#ddd';
            searchInput.style.boxShadow = '';
        }, 150);
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!container.contains(e.target)) {
            hideDropdown();
            searchInput.style.borderColor = '#ddd';
            searchInput.style.boxShadow = '';
        }
    });
    
    console.log('✅ Auto-complete dropdown created for:', selectElement.id);
}

// Quick fix function to replace problematic dropdowns immediately
function fixAutoCompleteDropdowns() {
    console.log('🔧 Applying auto-complete fix to existing dropdowns...');
    
    // Remove any existing autocomplete containers that might be causing issues
    document.querySelectorAll('.autocomplete-container').forEach(function(container) {
        var select = container.querySelector('select');
        if (select) {
            // Reset the select
            select.style.display = '';
            select.dataset.autocomplete = '';
            
            // Move select back to original parent
            var parent = container.parentNode;
            parent.insertBefore(select, container);
            container.remove();
        }
    });
    
    // Now convert all dropdowns fresh
    var selects = document.querySelectorAll('select[data-type="class"], select[data-type="judge"]');
    var count = 0;
    
    selects.forEach(function(select) {
        if (select.options.length > 1) {
            makeDropdownAutoComplete(select);
            count++;
        }
    });
    
    console.log('✅ Fixed ' + count + ' auto-complete dropdowns');
}

// Enhanced populate functions
function populateClassDropdownAutoComplete(selectElement) {
    if (!selectElement) return;
    
    var classes = (typeof csvClasses !== 'undefined' && csvClasses.length > 0) ? 
        csvClasses : ["Patrol 1", "Detective 2", "Investigator 3", "Super Sleuth 4", "Private Inv"];
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Class --</option>';
    
    classes.forEach(function(className) {
        var option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        if (className === currentValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
    
    // Convert to auto-complete
    setTimeout(function() {
        makeDropdownAutoComplete(selectElement);
    }, 100);
}

function populateJudgeDropdownAutoComplete(selectElement) {
    if (!selectElement) return;
    
    var judges = (typeof csvJudges !== 'undefined' && csvJudges.length > 0) ? 
        csvJudges : ["Linda Alberda", "Ginger Alpine", "Paige Alpine-Malone", "Anita Ambani", "Denise Ames"];
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Judge --</option>';
    
    judges.forEach(function(judgeName) {
        var option = document.createElement('option');
        option.value = judgeName;
        option.textContent = judgeName;
        if (judgeName === currentValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
    
    // Convert to auto-complete
    setTimeout(function() {
        makeDropdownAutoComplete(selectElement);
    }, 100);
}

// Override existing populate functions
function populateAllDropdownsWithAutoComplete() {
    console.log('🔄 Populating all dropdowns with auto-complete...');
    
    document.querySelectorAll('select[data-type="class"]').forEach(function(select) {
        populateClassDropdownAutoComplete(select);
    });
    
    document.querySelectorAll('select[data-type="judge"]').forEach(function(select) {
        populateJudgeDropdownAutoComplete(select);
    });
    
    console.log('✅ All dropdowns populated with working auto-complete');
}

// Add enhanced CSS
function addAutoCompleteCSS() {
    var style = document.createElement('style');
    style.id = 'autocomplete-css';
    style.textContent = `
        .autocomplete-container {
            position: relative;
            width: 100%;
        }
        
        .autocomplete-input {
            outline: none !important;
        }
        
        .autocomplete-input::-webkit-outer-spin-button,
        .autocomplete-input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        
        .autocomplete-dropdown {
            font-family: inherit;
        }
        
        .autocomplete-item:last-child {
            border-bottom: none;
        }
        
        .autocomplete-dropdown::-webkit-scrollbar {
            width: 8px;
        }
        
        .autocomplete-dropdown::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }
        
        .autocomplete-dropdown::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
        }
        
        .autocomplete-dropdown::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
        }
        
        /* Disable browser autocomplete styling */
        .autocomplete-input::-webkit-credentials-auto-fill-button {
            display: none !important;
        }
        
        .autocomplete-input:-webkit-autofill,
        .autocomplete-input:-webkit-autofill:hover,
        .autocomplete-input:-webkit-autofill:focus {
            -webkit-text-fill-color: inherit !important;
            -webkit-box-shadow: 0 0 0px 1000px white inset !important;
            transition: background-color 5000s ease-in-out 0s !important;
        }
        
        @media (max-width: 768px) {
            .autocomplete-dropdown {
                max-height: 150px;
            }
            
            .autocomplete-item {
                padding: 14px 16px;
                font-size: 16px;
            }
            
            .autocomplete-input {
                font-size: 16px; /* Prevents zoom on iOS */
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize the fixed system
function initializeFixedAutoComplete() {
    console.log('🚀 Initializing FIXED auto-complete system...');
    
    // Remove any existing CSS
    var existingCSS = document.getElementById('autocomplete-css');
    if (existingCSS) {
        existingCSS.remove();
    }
    
    // Add proper CSS
    addAutoCompleteCSS();
    
    // Fix existing dropdowns
    fixAutoCompleteDropdowns();
    
    console.log('✅ Fixed auto-complete system initialized');
}

// Export to global scope
window.makeDropdownAutoComplete = makeDropdownAutoComplete;
window.fixAutoCompleteDropdowns = fixAutoCompleteDropdowns;
window.populateAllDropdownsWithAutoComplete = populateAllDropdownsWithAutoComplete;
window.initializeFixedAutoComplete = initializeFixedAutoComplete;

// Console commands
console.log('✅ FIXED Auto-Complete System Loaded');
console.log('💡 Commands to fix the issue:');
console.log('  - fixAutoCompleteDropdowns() : Fix existing dropdowns');
console.log('  - initializeFixedAutoComplete() : Complete fix');
console.log('  - populateAllDropdownsWithAutoComplete() : Repopulate with fix');

// Auto-run the fix
setTimeout(function() {
    initializeFixedAutoComplete();
}, 1000);
// ENHANCED AUTO-COMPLETE DEBUG FOR BOTH CLASS AND JUDGE DROPDOWNS
// This version tests both dropdown types separately

// Enhanced diagnostic function
function debugBothDropdownTypes() {
    console.log('🔍 DEBUGGING BOTH CLASS AND JUDGE DROPDOWNS...');
    
    // Check class dropdowns
    var classSelects = document.querySelectorAll('select[data-type="class"]');
    var judgeSelects = document.querySelectorAll('select[data-type="judge"]');
    
    console.log('📚 CLASS DROPDOWNS:');
    console.log('- Found ' + classSelects.length + ' class dropdowns');
    classSelects.forEach(function(select, index) {
        console.log('  ' + (index + 1) + '. ID: ' + select.id + ', Options: ' + select.options.length);
    });
    
    console.log('👨‍⚖️ JUDGE DROPDOWNS:');
    console.log('- Found ' + judgeSelects.length + ' judge dropdowns');
    judgeSelects.forEach(function(select, index) {
        console.log('  ' + (index + 1) + '. ID: ' + select.id + ', Options: ' + select.options.length);
    });
    
    // Check existing autocomplete containers
    var classContainers = document.querySelectorAll('.autocomplete-container select[data-type="class"]');
    var judgeContainers = document.querySelectorAll('.autocomplete-container select[data-type="judge"]');
    
    console.log('📦 AUTOCOMPLETE CONTAINERS:');
    console.log('- Class containers: ' + classContainers.length);
    console.log('- Judge containers: ' + judgeContainers.length);
    
    return {
        classDropdowns: classSelects.length,
        judgeDropdowns: judgeSelects.length,
        classContainers: classContainers.length,
        judgeContainers: judgeContainers.length
    };
}

// Test both dropdown types
function testBothDropdownTypes() {
    console.log('🧪 TESTING BOTH DROPDOWN TYPES...');
    
    // Test class dropdowns
    var classInputs = document.querySelectorAll('.autocomplete-container input[data-type="class"], .autocomplete-container input');
    var judgeInputs = document.querySelectorAll('.autocomplete-container input[data-type="judge"], .autocomplete-container input');
    
    // If inputs don't have data-type, we need to identify them by their parent select
    var allAutoInputs = document.querySelectorAll('.autocomplete-container input.autocomplete-input');
    
    console.log('⌨️ FOUND AUTOCOMPLETE INPUTS:');
    console.log('- Total autocomplete inputs: ' + allAutoInputs.length);
    
    var classTestInputs = [];
    var judgeTestInputs = [];
    
    // Identify which inputs belong to which type
    allAutoInputs.forEach(function(input, index) {
        var container = input.closest('.autocomplete-container');
        if (container) {
            var select = container.querySelector('select');
            if (select) {
                var type = select.getAttribute('data-type');
                console.log('  Input ' + (index + 1) + ': Type = ' + type + ', ID = ' + select.id);
                
                if (type === 'class') {
                    classTestInputs.push({ input: input, select: select, type: 'class' });
                } else if (type === 'judge') {
                    judgeTestInputs.push({ input: input, select: select, type: 'judge' });
                }
            }
        }
    });
    
    console.log('📚 CLASS INPUTS: ' + classTestInputs.length);
    console.log('👨‍⚖️ JUDGE INPUTS: ' + judgeTestInputs.length);
    
    // Test class dropdown first
    if (classTestInputs.length > 0) {
        console.log('🧪 TESTING CLASS DROPDOWN...');
        testSpecificDropdown(classTestInputs[0], 'patrol', 'CLASS');
    }
    
    // Test judge dropdown after a delay
    setTimeout(function() {
        if (judgeTestInputs.length > 0) {
            console.log('🧪 TESTING JUDGE DROPDOWN...');
            testSpecificDropdown(judgeTestInputs[0], 'linda', 'JUDGE');
        } else {
            console.log('❌ No judge inputs found to test');
        }
    }, 3000);
    
    return {
        classInputs: classTestInputs.length,
        judgeInputs: judgeTestInputs.length
    };
}

// Test a specific dropdown with detailed logging
function testSpecificDropdown(dropdownInfo, testTerm, label) {
    var input = dropdownInfo.input;
    var select = dropdownInfo.select;
    
    console.log('🎯 TESTING ' + label + ' DROPDOWN:');
    console.log('- Input element:', input);
    console.log('- Select ID:', select.id);
    console.log('- Select options:', select.options.length);
    
    // List available options
    console.log('- Available options:');
    Array.from(select.options).slice(1).forEach(function(option, index) {
        console.log('  ' + (index + 1) + '. ' + option.text);
    });
    
    // Focus the input
    input.focus();
    console.log('📍 Focused ' + label + ' input');
    
    // Clear any existing value
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Type letter by letter
    var letters = testTerm.split('');
    console.log('⌨️ Typing "' + testTerm + '" letter by letter...');
    
    letters.forEach(function(letter, index) {
        setTimeout(function() {
            var currentValue = testTerm.substring(0, index + 1);
            input.value = currentValue;
            
            console.log('📝 ' + label + ' - Typed: "' + currentValue + '"');
            
            // Trigger input event
            var inputEvent = new Event('input', { bubbles: true });
            input.dispatchEvent(inputEvent);
            
            // Check dropdown visibility
            var container = input.closest('.autocomplete-container');
            var dropdown = container ? container.querySelector('.autocomplete-dropdown') : null;
            
            if (dropdown) {
                var isVisible = dropdown.style.display !== 'none';
                var itemCount = dropdown.querySelectorAll('.autocomplete-item, div').length;
                console.log('  📋 ' + label + ' - Dropdown visible: ' + isVisible + ', Items: ' + itemCount);
            } else {
                console.log('  ❌ ' + label + ' - No dropdown found');
            }
            
        }, index * 800); // Slower typing for better observation
    });
}

// Force fix with specific attention to both types
function forceFixBothDropdownTypes() {
    console.log('🔧 FORCE FIXING BOTH CLASS AND JUDGE DROPDOWNS...');
    
    // Step 1: Remove existing autocomplete containers
    document.querySelectorAll('.autocomplete-container').forEach(function(container) {
        var select = container.querySelector('select');
        if (select) {
            select.style.display = '';
            select.removeAttribute('data-autocomplete');
            container.parentNode.insertBefore(select, container);
        }
        container.remove();
    });
    
    // Step 2: Fix class dropdowns
    var classSelects = document.querySelectorAll('select[data-type="class"]');
    console.log('📚 Converting ' + classSelects.length + ' class dropdowns...');
    
    classSelects.forEach(function(select, index) {
        console.log('🔄 Converting class dropdown ' + (index + 1) + ': ' + select.id);
        createSpecificAutoComplete(select, 'class');
    });
    
    // Step 3: Fix judge dropdowns
    var judgeSelects = document.querySelectorAll('select[data-type="judge"]');
    console.log('👨‍⚖️ Converting ' + judgeSelects.length + ' judge dropdowns...');
    
    judgeSelects.forEach(function(select, index) {
        console.log('🔄 Converting judge dropdown ' + (index + 1) + ': ' + select.id);
        createSpecificAutoComplete(select, 'judge');
    });
    
    console.log('✅ Force conversion complete for both types');
}

// Create autocomplete with type-specific handling
function createSpecificAutoComplete(selectElement, dropdownType) {
    if (!selectElement || selectElement.options.length < 2) {
        console.log('❌ Skipping dropdown - insufficient options');
        return;
    }
    
    console.log('🛠️ Creating ' + dropdownType.toUpperCase() + ' autocomplete for:', selectElement.id);
    
    // Hide original
    selectElement.style.display = 'none';
    
    // Create container
    var container = document.createElement('div');
    container.className = 'autocomplete-container';
    container.setAttribute('data-dropdown-type', dropdownType);
    container.style.cssText = 'position: relative; width: 100%;';
    
    selectElement.parentNode.insertBefore(container, selectElement);
    container.appendChild(selectElement);
    
    // Create input
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'autocomplete-input';
    input.setAttribute('data-type', dropdownType);
    
    // Aggressive autocomplete blocking
    input.setAttribute('autocomplete', 'new-password');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('autocapitalize', 'off');
    input.setAttribute('spellcheck', 'false');
    
    input.placeholder = dropdownType === 'class' ? 'Type class name...' : 'Type judge name...';
    input.style.cssText = `
        width: 100%; 
        padding: 12px 16px; 
        border: 2px solid #ddd; 
        border-radius: 8px; 
        background: white;
        font-size: 14px;
        box-sizing: border-box;
        font-family: inherit;
    `;
    
    // Create dropdown
    var dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown';
    dropdown.setAttribute('data-type', dropdownType);
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
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    `;
    
    container.appendChild(input);
    container.appendChild(dropdown);
    
    // Get options
    var allOptions = Array.from(selectElement.options).slice(1);
    console.log('📋 ' + dropdownType.toUpperCase() + ' options:', allOptions.map(o => o.text));
    
    // Populate dropdown function
    function populateDropdown(filteredOptions, searchTerm) {
        dropdown.innerHTML = '';
        
        console.log('🔍 ' + dropdownType.toUpperCase() + ' - Populating with ' + filteredOptions.length + ' options for: "' + searchTerm + '"');
        
        if (filteredOptions.length === 0) {
            dropdown.innerHTML = '<div style="padding: 16px; color: #666; text-align: center;">No ' + dropdownType + 's found</div>';
        } else {
            filteredOptions.forEach(function(option) {
                var item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.style.cssText = `
                    padding: 12px 16px;
                    cursor: pointer;
                    border-bottom: 1px solid #eee;
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
                    console.log('✅ ' + dropdownType.toUpperCase() + ' - Selected:', option.text);
                    selectElement.value = option.value;
                    input.value = option.text;
                    dropdown.style.display = 'none';
                    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                });
                
                dropdown.appendChild(item);
            });
        }
    }
    
    // Input event with type-specific logging
    input.addEventListener('input', function(e) {
        console.log('⌨️ ' + dropdownType.toUpperCase() + ' INPUT - Value: "' + this.value + '"');
        
        var searchTerm = this.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            dropdown.style.display = 'none';
            return;
        }
        
        // Filter options
        var filtered = allOptions.filter(function(option) {
            return option.text.toLowerCase().includes(searchTerm);
        });
        
        console.log('🔍 ' + dropdownType.toUpperCase() + ' - Filtered ' + allOptions.length + ' down to ' + filtered.length);
        
        populateDropdown(filtered, searchTerm);
        dropdown.style.display = 'block';
    });
    
    // Focus event
    input.addEventListener('focus', function() {
        console.log('📍 ' + dropdownType.toUpperCase() + ' input focused');
        
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
    
    console.log('✅ ' + dropdownType.toUpperCase() + ' autocomplete setup complete');
}

// Complete test for both types
function completeTestBothTypes() {
    console.log('🚀 RUNNING COMPLETE TEST FOR BOTH DROPDOWN TYPES...');
    
    // Step 1: Debug current state
    debugBothDropdownTypes();
    
    // Step 2: Force fix both types
    forceFixBothDropdownTypes();
    
    // Step 3: Wait and test both types
    setTimeout(function() {
        console.log('🧪 Testing both dropdown types...');
        testBothDropdownTypes();
    }, 2000);
    
    console.log('✅ Complete test initiated for both class and judge dropdowns');
}

// Manual test functions for each type
function testClassDropdownOnly() {
    var classInputs = document.querySelectorAll('.autocomplete-container select[data-type="class"]');
    if (classInputs.length > 0) {
        var container = classInputs[0].closest('.autocomplete-container');
        var input = container.querySelector('input');
        if (input) {
            testSpecificDropdown({ input: input, select: classInputs[0] }, 'patrol', 'CLASS');
        }
    } else {
        console.log('❌ No class dropdowns found');
    }
}

function testJudgeDropdownOnly() {
    var judgeSelects = document.querySelectorAll('.autocomplete-container select[data-type="judge"]');
    if (judgeSelects.length > 0) {
        var container = judgeSelects[0].closest('.autocomplete-container');
        var input = container.querySelector('input');
        if (input) {
            testSpecificDropdown({ input: input, select: judgeSelects[0] }, 'linda', 'JUDGE');
        }
    } else {
        console.log('❌ No judge dropdowns found');
    }
}

// Export functions
window.debugBothDropdownTypes = debugBothDropdownTypes;
window.testBothDropdownTypes = testBothDropdownTypes;
window.forceFixBothDropdownTypes = forceFixBothDropdownTypes;
window.completeTestBothTypes = completeTestBothTypes;
window.testClassDropdownOnly = testClassDropdownOnly;
window.testJudgeDropdownOnly = testJudgeDropdownOnly;

// Console instructions
console.log('🔧 ENHANCED DEBUG TOOLS FOR BOTH DROPDOWN TYPES LOADED');
console.log('💡 Commands available:');
console.log('');
console.log('📊 DIAGNOSTIC:');
console.log('  - debugBothDropdownTypes() - Check both class and judge dropdowns');
console.log('');
console.log('🔧 FIXES:');
console.log('  - forceFixBothDropdownTypes() - Force rebuild both types');
console.log('  - completeTestBothTypes() - Full diagnostic and fix');
console.log('');
console.log('🧪 TESTING:');
console.log('  - testClassDropdownOnly() - Test class dropdown typing');
console.log('  - testJudgeDropdownOnly() - Test judge dropdown typing');
console.log('  - testBothDropdownTypes() - Test both types');
console.log('');
console.log('🚀 QUICK START: Run completeTestBothTypes()');

// Auto-run the complete test
setTimeout(function() {
    console.log('🔄 Auto-running complete test for both types in 2 seconds...');
    setTimeout(completeTestBothTypes, 2000);
}, 1000);
