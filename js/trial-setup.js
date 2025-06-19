// CLEAN TRIAL SETUP JS - Replace js/trial-setup.js entirely with this

// ===== TRIAL SETUP FUNCTIONS =====

// Generate days based on trial days input
function generateDays() {
    var days = parseInt(document.getElementById('trialDays').value) || 1;
    var container = document.getElementById('daysContainer');
    
    if (!container) {
        console.log('daysContainer not found');
        return;
    }
    
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
    
    console.log('✅ Generated ' + days + ' days');
}

// Generate classes for a specific day
function generateClassesForDay(dayNum) {
    var numClasses = parseInt(document.getElementById('day' + dayNum + '_numClasses').value) || 2;
    var container = document.getElementById('day' + dayNum + '_classes');
    
    if (!container) return;
    
    var html = '<h5 style="color: #2c5aa0; margin-bottom: 15px;">Classes for Day ' + dayNum + ':</h5>';
    
    for (var c = 1; c <= numClasses; c++) {
        html += generateSingleClass(dayNum, c);
    }
    
    container.innerHTML = html;
    
    // Populate dropdowns after creation
    setTimeout(function() {
        populateAllDropdowns();
    }, 100);
    
    console.log('✅ Generated ' + numClasses + ' classes for Day ' + dayNum);
}

// Generate a single class configuration
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
                <p style="color: #666; font-style: italic; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 5px; border: 1px dashed #ccc;">
                    Select number of rounds above to configure judges for each round
                </p>
            </div>
        </div>
    `;
}

// Generate judge dropdowns for each round
function generateRoundsForClass(dayNum, classNum) {
    var numRounds = parseInt(document.getElementById('day' + dayNum + '_class' + classNum + '_rounds').value);
    var container = document.getElementById('day' + dayNum + '_class' + classNum + '_rounds_container');
    
    if (!container || !numRounds) {
        if (container) {
            container.innerHTML = '<p style="color: #666; font-style: italic; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 5px; border: 1px dashed #ccc;">Select number of rounds above to configure judges for each round</p>';
        }
        return;
    }
    
    var html = `
        <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; border: 2px solid #2c5aa0;">
            <h6 style="color: #2c5aa0; margin: 0 0 15px 0; text-align: center;">
                Configure ${numRounds} Round${numRounds > 1 ? 's' : ''} for this Class
            </h6>
    `;
    
    for (var r = 1; r <= numRounds; r++) {
        html += `
            <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border: 1px solid #ddd; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 15px; align-items: center;">
                    
                    <div style="text-align: center;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #2c5aa0;">Round:</label>
                        <div style="background: #2c5aa0; color: white; padding: 8px 15px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                            ${r}
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">Judge:</label>
                        <select id="day${dayNum}_class${classNum}_round${r}_judge" 
                                data-type="judge"
                                style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 8px; background: white; font-size: 14px;">
                            <option value="">-- Select Judge --</option>
                        </select>
                    </div>
                    
                    <div style="text-align: center;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">FEO:</label>
                        <label style="display: flex; flex-direction: column; align-items: center; cursor: pointer; background: #f8f9fa; padding: 10px; border-radius: 8px; border: 2px solid #ddd; transition: all 0.3s;">
                            <input type="checkbox" 
                                   id="day${dayNum}_class${classNum}_round${r}_feo" 
                                   style="transform: scale(1.5); margin-bottom: 5px;"
                                   onchange="this.parentElement.style.borderColor = this.checked ? '#28a745' : '#ddd'; this.parentElement.style.backgroundColor = this.checked ? '#d4edda' : '#f8f9fa';">
                            <span style="font-size: 11px; font-weight: bold; color: #28a745;">For Exhibition Only</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    // Populate the new judge dropdowns
    setTimeout(function() {
        populateAllDropdowns();
    }, 100);
    
    console.log('✅ Generated ' + numRounds + ' rounds for Day ' + dayNum + ' Class ' + classNum);
}

// ===== DROPDOWN POPULATION =====

// Populate all dropdowns with CSV data
function populateAllDropdowns() {
    // Populate class dropdowns
    document.querySelectorAll('select[data-type="class"]').forEach(function(select) {
        populateClassDropdown(select);
    });
    
    // Populate judge dropdowns
    document.querySelectorAll('select[data-type="judge"]').forEach(function(select) {
        populateJudgeDropdown(select);
    });
    
    console.log('✅ All dropdowns populated');
}
    
    classes.forEach(function(className) {
        var option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        if (className === currentValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
    
    // Visual indicator
    selectElement.style.borderColor = classes.length > 3 ? '#28a745' : '#ffc107';
}

// Populate a single judge dropdown
function populateJudgeDropdown(selectElement) {
    if (!selectElement) return;
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Judge --</option>';
    
    // Use global CSV data if available
    var judges = [];
    if (typeof csvJudges !== 'undefined' && csvJudges.length > 0) {
        judges = csvJudges;
    } else {
        // Fallback judges
        judges = ["Linda Alberda", "Ginger Alpine", "Paige Alpine-Malone", "Anita Ambani", "Denise Ames"];
    }
    
    judges.forEach(function(judgeName) {
        var option = document.createElement('option');
        option.value = judgeName;
        option.textContent = judgeName;
        if (judgeName === currentValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
    
    // Visual indicator
    selectElement.style.borderColor = judges.length > 3 ? '#28a745' : '#ffc107';
}

// ===== CONFIGURATION COLLECTION =====

// Collect all trial configuration data
function collectTrialConfiguration() {
    var config = [];
    var days = parseInt(document.getElementById('trialDays').value) || 1;
    
    for (var day = 1; day <= days; day++) {
        var dayDate = document.getElementById('day' + day + '_date').value;
        var numClasses = parseInt(document.getElementById('day' + day + '_numClasses').value) || 2;
        
        for (var classNum = 1; classNum <= numClasses; classNum++) {
            var classNameElement = document.getElementById('day' + day + '_class' + classNum + '_name');
            var numRoundsElement = document.getElementById('day' + day + '_class' + classNum + '_rounds');
            
            if (!classNameElement || !numRoundsElement) continue;
            
            var className = classNameElement.value;
            var numRounds = parseInt(numRoundsElement.value);
            
            if (className && numRounds) {
                for (var round = 1; round <= numRounds; round++) {
                    var judgeElement = document.getElementById('day' + day + '_class' + classNum + '_round' + round + '_judge');
                    var feoElement = document.getElementById('day' + day + '_class' + classNum + '_round' + round + '_feo');
                    
                    if (judgeElement) {
                        config.push({
                            day: day,
                            date: dayDate,
                            classNum: classNum,
                            className: className,
                            round: round,
                            judge: judgeElement.value,
                            feoOffered: feoElement ? feoElement.checked : false
                        });
                    }
                }
            }
        }
    }
    
    console.log('✅ Collected configuration for ' + config.length + ' class/round combinations');
    return config;
}

// Save trial configuration
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
    
    if (config.length === 0) {
        alert('Please configure at least one class with rounds and judges.');
        return;
    }
    
    var trialData = {
        name: trialName,
        clubName: document.getElementById('clubName').value,
        location: document.getElementById('trialLocation').value,
        config: config,
        results: entryResults || [],
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
    
    alert('✅ Trial "' + trialName + '" saved successfully!\n\nConfiguration:\n- ' + config.length + ' class/round combinations\n- Ready for entries');
    
    // Update displays
    if (typeof loadUserTrials === 'function') {
        loadUserTrials();
    }
    
    console.log('✅ Trial configuration saved');
}

// ===== EDIT TRIAL SUPPORT =====

// Populate edit form with existing trial data
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
    
    // Regenerate form structure and populate with data
    if (trial.config && trial.config.length > 0) {
        setTimeout(function() {
            populateEditData(trial.config);
        }, 1000);
    }
    
    console.log('✅ Trial edit form populated');
}

// Populate form with existing configuration data
function populateEditData(config) {
    config.forEach(function(item) {
        // Populate class name
        var classField = document.getElementById('day' + item.day + '_class' + item.classNum + '_name');
        if (classField && item.className) {
            classField.value = item.className;
        }
        
        // Populate rounds
        var roundsField = document.getElementById('day' + item.day + '_class' + item.classNum + '_rounds');
        if (roundsField) {
            // Determine max rounds for this class
            var maxRounds = config.filter(function(c) {
                return c.day === item.day && c.classNum === item.classNum;
            }).length;
            
            if (roundsField.value !== maxRounds.toString()) {
                roundsField.value = maxRounds;
                generateRoundsForClass(item.day, item.classNum);
                
                // Wait for rounds to be generated, then populate
                setTimeout(function() {
                    var judgeField = document.getElementById('day' + item.day + '_class' + item.classNum + '_round' + item.round + '_judge');
                    var feoField = document.getElementById('day' + item.day + '_class' + item.classNum + '_round' + item.round + '_feo');
                    
                    if (judgeField && item.judge) judgeField.value = item.judge;
                    if (feoField && item.feoOffered) feoField.checked = item.feoOffered;
                }, 500);
            }
        }
        
        // Populate individual round data
        var judgeField = document.getElementById('day' + item.day + '_class' + item.classNum + '_round' + item.round + '_judge');
        var feoField = document.getElementById('day' + item.day + '_class' + item.classNum + '_round' + item.round + '_feo');
        
        if (judgeField && item.judge) judgeField.value = item.judge;
        if (feoField && item.feoOffered) feoField.checked = item.feoOffered;
    });
    
    console.log('✅ Edit data populated');
}

// ===== INITIALIZATION =====

// Initialize trial setup when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Clean Trial Setup System Loaded');
    console.log('🎯 Features: Dynamic rounds with individual judge dropdowns');
    
    // Auto-populate dropdowns if data is available
    setTimeout(function() {
        populateAllDropdowns();
    }, 1000);
});

// ===== UTILITY FUNCTIONS =====

// Debug function to check current state
function debugTrialSetup() {
    console.log('=== TRIAL SETUP DEBUG ===');
    console.log('Current User:', currentUser ? currentUser.username : 'Not logged in');
    console.log('Current Trial ID:', currentTrialId);
    console.log('CSV Classes:', typeof csvClasses !== 'undefined' ? csvClasses : 'Not loaded');
    console.log('CSV Judges:', typeof csvJudges !== 'undefined' ? csvJudges : 'Not loaded');
    
    var days = parseInt(document.getElementById('trialDays').value) || 0;
    console.log('Number of days configured:', days);
    
    for (var day = 1; day <= days; day++) {
        var numClasses = parseInt(document.getElementById('day' + day + '_numClasses').value) || 0;
        console.log('Day ' + day + ' has ' + numClasses + ' classes');
    }
}

// Export functions for console access
window.debugTrialSetup = debugTrialSetup;
window.populateAllDropdowns = populateAllDropdowns;
window.collectTrialConfiguration = collectTrialConfiguration;
// Quick fix for the HTML reference error
// Add this to the end of your js/trial-setup.js file or run in console

// Create the missing function that your HTML is trying to call
function initializeTrialSetup() {
    console.log('✅ Trial setup initialized via HTML call');
    
    // Populate dropdowns if data is available
    setTimeout(function() {
        populateAllDropdowns();
    }, 500);
    
    // Any other initialization needed
    if (typeof csvClasses !== 'undefined' && csvClasses.length > 0) {
        console.log('✅ CSV data available for trial setup');
    }
}

// Also create any other missing functions that might be called
function initializeTestUsers() {
    if (typeof createDemoAccounts === 'function') {
        createDemoAccounts();
    }
    console.log('✅ Test users initialized');
}

// Quick console command to run if needed
function fixHTMLReferences() {
    // Create all missing functions
    window.initializeTrialSetup = initializeTrialSetup;
    window.initializeTestUsers = initializeTestUsers;
    
    console.log('✅ HTML reference errors fixed');
}

// Auto-run the fix
fixHTMLReferences();

console.log('✅ HTML compatibility functions added');
console.log('✅ Clean Trial Setup JS loaded - No conflicts!');
// ADD this to the END of js/trial-setup.js

// Populate a single class dropdown
function populateClassDropdown(selectElement) {
    if (!selectElement) return;
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Class --</option>';
    
    // Use global CSV data if available
    var classes = [];
    if (typeof csvClasses !== 'undefined' && csvClasses.length > 0) {
        classes = csvClasses;
    } else {
        // Fallback classes
        classes = ["Patrol 1", "Detective 2", "Investigator 3", "Super Sleuth 4", "Private Inv"];
    }
    
    classes.forEach(function(className) {
        var option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        if (className === currentValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
    
    // Visual indicator
    selectElement.style.borderColor = classes.length > 3 ? '#28a745' : '#ffc107';
    
    console.log('📚 Populated class dropdown with', classes.length, 'classes');
}

// Populate a single judge dropdown  
function populateJudgeDropdown(selectElement) {
    if (!selectElement) return;
    
    var currentValue = selectElement.value;
    selectElement.innerHTML = '<option value="">-- Select Judge --</option>';
    
    // Use global CSV data if available
    var judges = [];
    if (typeof csvJudges !== 'undefined' && csvJudges.length > 0) {
        judges = csvJudges;
    } else {
        // Fallback judges
        judges = ["Linda Alberda", "Ginger Alpine", "Paige Alpine-Malone", "Anita Ambani", "Denise Ames"];
    }
    
    judges.forEach(function(judgeName) {
        var option = document.createElement('option');
        option.value = judgeName;
        option.textContent = judgeName;
        if (judgeName === currentValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
    
    // Visual indicator
    selectElement.style.borderColor = judges.length > 3 ? '#28a745' : '#ffc107';
    
    console.log('👨‍⚖️ Populated judge dropdown with', judges.length, 'judges');
}
