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
