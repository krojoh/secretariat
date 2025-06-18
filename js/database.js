// Database Operations - localStorage Management
// Global variables
var currentUser = null;
var trialConfig = [];
var entryResults = [];
var currentTrialId = null;

// Authentication Functions
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
    
    // Add dashboard button
    addDashboardButton();
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
    // Simple alert for now - can be enhanced later
    alert(message);
}

// Trial Management Functions
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
                <button onclick="createNewTrial()">Create New Trial</button>
            </div>
        `;
    } else {
        var html = '<h3>My Trials</h3>';
        
        trialIds.forEach(function(trialId) {
            var trial = userTrials[trialId];
            html += `
                <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: bold; color: #2c5aa0;">${trial.name || 'Unnamed Trial'}</div>
                            <div style="font-size: 14px; color: #666;">
                                Created: ${new Date(trial.created).toLocaleDateString()} | 
                                Classes: ${trial.config ? trial.config.length : 0} |
                                Entries: ${trial.results ? trial.results.length : 0}
                            </div>
                        </div>
                        <div>
                            <button onclick="editTrial('${trialId}')" style="background: #28a745; color: white; border: none; padding: 8px 15px; border-radius: 5px; margin-right: 5px;">Edit</button>
                            <button onclick="deleteTrial('${trialId}')" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px;">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '<div style="text-align: center; margin-top: 20px;"><button onclick="createNewTrial()">Create New Trial</button></div>';
        container.innerHTML = html;
    }
}

function createNewTrial() {
    currentTrialId = 'trial_' + Date.now();
    trialConfig = [];
    entryResults = [];
    
    showTab('setup', document.querySelector('.nav-tab'));
    showStatusMessage('New trial created! Configure the trial details in the Setup tab.', 'info');
}

function editTrial(trialId) {
    currentTrialId = trialId;
    var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
    var trial = userTrials[trialId];
    
    if (trial) {
        trialConfig = trial.config || [];
        entryResults = trial.results || [];
        
        if (trial.name) document.getElementById('trialName').value = trial.name;
        if (trial.clubName) document.getElementById('clubName').value = trial.clubName;
        if (trial.location) document.getElementById('trialLocation').value = trial.location;
        
        showTab('setup', document.querySelector('.nav-tab'));
        showStatusMessage('Trial loaded for editing!', 'info');
    }
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
    loadUserTrials();
    generateEntryFormLinks();
    return true;
}

// Generate entry form links
function generateEntryFormLinks() {
    if (!currentTrialId || !trialConfig || trialConfig.length === 0) {
        return;
    }
    
    var entryFormLinkDiv = document.getElementById('entryFormLink');
    if (entryFormLinkDiv) {
        entryFormLinkDiv.style.display = 'block';
        
        var baseURL = window.location.origin + window.location.pathname.replace('/index.html', '');
        var entryFormURL = baseURL + '/pages/entry-form.html?trial=' + currentTrialId;
        
        var shareableURLInput = document.getElementById('shareableURL');
        if (shareableURLInput) {
            shareableURLInput.value = entryFormURL;
        }
    }
}

function copyURL() {
    var urlInput = document.getElementById('shareableURL');
    if (urlInput) {
        urlInput.select();
        urlInput.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            showStatusMessage('Entry form URL copied to clipboard!', 'success');
        } catch (err) {
            showStatusMessage('Could not copy URL automatically. Please copy manually.', 'warning');
        }
    }
}

// Initialize test user on page load
function initializeTestUsers() {
    var users = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    if (Object.keys(users).length === 0) {
        users['admin'] = {
            username: 'admin',
            password: 'admin123',
            fullName: 'Admin User',
            email: 'admin@dogtrial.com',
            created: new Date().toISOString()
        };
        localStorage.setItem('trialUsers', JSON.stringify(users));
        console.log('Test admin user created - Username: admin, Password: admin123');
    }
}
