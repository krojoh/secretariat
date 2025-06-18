// Enhanced Login and Trial Management System

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

// Enhanced Authentication Functions
function showMainApp() {
    document.getElementById('authOverlay').style.display = 'none';
    document.getElementById('mainApp').classList.remove('hidden');
    
    if (currentUser) {
        document.getElementById('userInfo').textContent = 
            'Welcome, ' + currentUser.fullName + ' (' + currentUser.username + ')';
    }
    
    // Enable all tabs immediately upon login
    enableAllTabsOnLogin();
    
    // Initialize trial selection dropdowns
    initializeAllDropdowns();
    
    // Load user's trials automatically
    loadUserTrials();
}

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

// Enhanced Edit Trial Function
function editTrial(trialId) {
    currentTrialId = trialId;
    
    // Load trial data from both user trials and public trials
    var userTrials = JSON.parse(localStorage.getItem('trials_' + (currentUser ? currentUser.username : 'guest')) || '{}');
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
            // Trigger regeneration of day configuration
            generateDays();
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

// Update all displays after changes
function updateAllDisplays() {
    // Update trials list
    if (typeof loadUserTrials === 'function') {
        loadUserTrials();
    }
    
    // Update entry form displays
    if (document.getElementById('selectedTrialEntry')) {
        loadEntryFormTabWithTrialSelection();
    }
    
    // Update results displays
    if (document.getElementById('selectedTrialResults')) {
        loadResultsTabWithTrialSelection();
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
        var context = selector.getAttribute('onchange').match(/'([^']+)'/g)[1].replace(/'/g, '');
        
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

// Enhanced Tab Navigation (ensures tabs stay enabled)
function showTab(tabName, element) {
    // Hide all tab contents
    var tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(function(content) {
        content.classList.remove('active');
    });
    
    // Remove active class from all nav tabs
    var navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(function(tab) {
        tab.classList.remove('active');
        tab.style.background = '#f8f9fa';
    });
    
    // Show selected tab content
    var targetContent = document.getElementById(tabName);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Add active class to clicked tab
    if (element) {
        element.classList.add('active');
        element.style.background = '#667eea';
        element.style.color = 'white';
    }
    
    // Tab-specific initialization
    switch(tabName) {
        case 'entry':
            initializeEntryTab();
            break;
        case 'results':
            initializeResultsTab();
            break;
        case 'trials':
            loadUserTrials();
            break;
        default:
            // Initialize other tabs as needed
            break;
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize entry tab with enhanced functionality
function initializeEntryTab() {
    setTimeout(function() {
        // Populate dropdowns
        populateJudgeDropdowns();
        populateClassDropdowns();
        
        // Enhance form submission
        enhancedFormSubmission();
        
        console.log('✅ Entry tab initialized with enhanced functionality');
    }, 100);
}

// Initialize results tab with enhanced functionality
function initializeResultsTab() {
    setTimeout(function() {
        refreshTrialSelectors();
        console.log('✅ Results tab initialized with enhanced functionality');
    }, 100);
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
    console.log('✅ Login enables all tabs');
    console.log('✅ Edit trials populate original selections');
    console.log('✅ Working dropdown menus for judges and classes');
    console.log('✅ Enhanced form submission with clear and return to top');
    console.log('✅ Entry deletion functionality');
    
    // Add global event listeners for enhanced functionality
    document.addEventListener('click', function(e) {
        // Enhanced form submission for dynamically created forms
        if (e.target.matches('button[type="submit"]') || e.target.matches('input[type="submit"]')) {
            var form = e.target.closest('form');
            if (form && form.id === 'trialEntryForm') {
                enhancedFormSubmission();
            }
        }
    });
}
