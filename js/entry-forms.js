// Entry Form Functions

function showJuneLeagueEntryForm() {
    if (!currentTrialId) {
        alert('No trial selected! Please select a trial first.');
        return;
    }
    
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var currentTrial = publicTrials[currentTrialId];
    var trialConfig = currentTrial.config || [];
    
    if (trialConfig.length === 0) {
        alert('Trial has no classes configured. Please set up the trial first.');
        return;
    }
    
    // Create entry form modal
    var modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 10000; 
        display: flex; justify-content: center; align-items: center; padding: 20px;
    `;
    
    // Build class selection HTML
    var classesHTML = '';
    var classesByDay = {};
    
    // Group classes by day
    trialConfig.forEach(function(config) {
        if (!classesByDay[config.day]) {
            classesByDay[config.day] = [];
        }
        classesByDay[config.day].push(config);
    });
    
    // Generate class selection interface
    Object.keys(classesByDay).forEach(function(day) {
        classesHTML += `
            <div style="border: 2px solid #2c5aa0; margin: 15px 0; padding: 15px; border-radius: 8px; background: #f8f9fa;">
                <h4 style="background: #2c5aa0; color: white; margin: -15px -15px 15px -15px; padding: 10px; border-radius: 6px 6px 0 0;">
                    Day ${day} - ${classesByDay[day][0].date || 'TBD'}
                </h4>
        `;
        
        classesByDay[day].forEach(function(config, index) {
            var classId = 'class_' + config.day + '_' + (config.classNum || index) + '_' + (config.round || 1);
            var classLabel = config.className + ' - Round ' + (config.round || 1) + ' (Judge: ' + (config.judge || 'TBD') + ')';
            var feoOption = config.feoOffered ? ' | FEO Available' : '';
            
            classesHTML += `
                <div style="background: white; padding: 12px; margin: 8px 0; border-radius: 6px; border: 1px solid #d0d0d0;">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" name="selectedClasses" value="${classId}" data-class="${config.className}" data-round="${config.round || 1}" data-judge="${config.judge}" data-day="${config.day}" style="margin-right: 10px; transform: scale(1.2);">
                        <span style="font-weight: bold;">${classLabel}${feoOption}</span>
                    </label>
                    ${config.feoOffered ? `
                        <div style="margin-left: 30px; margin-top: 8px;">
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox" name="feoClasses" value="${classId}_feo" data-class="${config.className}" data-round="${config.round || 1}" data-judge="${config.judge}" data-day="${config.day}" style="margin-right: 8px;">
                                <span style="color: #666; font-style: italic;">Enter as FEO (For Exhibition Only)</span>
                            </label>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        classesHTML += '</div>';
    });
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;">
            <div style="padding: 20px; border-bottom: 2px solid #eee; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 15px 15px 0 0;">
                <h2 style="margin: 0;">📝 ${currentTrial.name || 'Trial'} Entry Form</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">
                    Current entries: ${entryResults.length} | 
                    Club: ${currentTrial.clubName || 'N/A'} | 
                    Location: ${currentTrial.location || 'N/A'}
                </p>
            </div>
            <div style="padding: 30px;">
                <form id="trialEntryForm">
                    <!-- Handler Information -->
                    <div style="background: #e8f4f8; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 15px 0; color: #2c5aa0;">Handler Information</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Handler Name:</label>
                                <input type="text" id="handlerName" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px; box-sizing: border-box;" required>
                            </div>
                            <div>
                                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Email:</label>
                                <input type="email" id="handlerEmail" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px; box-sizing: border-box;" required>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Dog Information -->
                    <div style="background: #f0f8ff; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 15px 0; color: #2c5aa0;">Dog Information</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Dog's Call Name:</label>
                                <input type="text" id="dogCallName" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px; box-sizing: border-box;" required>
                            </div>
                            <div>
                                <label style="display: block; font-weight: bold; margin-bottom: 5px;">Registration Number:</label>
                                <input type="text" id="dogRegNumber" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px; box-sizing: border-box;" required>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Class Selection -->
                    <div style="background: #fff8e1; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                        <h3 style="margin: 0 0 15px 0; color: #2c5aa0;">Select Classes to Enter</h3>
                        <p style="color: #666; margin-bottom: 15px;">Choose which classes you want to enter. You can select multiple classes across different days.</p>
                        ${classesHTML}
                    </div>
                    
                    <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                        <button type="submit" style="background: linear-gradient(45deg, #28a745, #20c997); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">✅ Submit Entry</button>
                        <button type="button" onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="background: linear-gradient(45deg, #dc3545, #c82333); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">❌ Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add form submission handler
    document.getElementById('trialEntryForm').onsubmit = function(e) {
        e.preventDefault();
        
        // Get selected classes
        var selectedClasses = [];
        var feoClasses = [];
        
        document.querySelectorAll('input[name="selectedClasses"]:checked').forEach(function(checkbox) {
            selectedClasses.push({
                class: checkbox.dataset.class,
                round: checkbox.dataset.round,
                judge: checkbox.dataset.judge,
                day: checkbox.dataset.day,
                type: 'regular'
            });
        });
        
        document.querySelectorAll('input[name="feoClasses"]:checked').forEach(function(checkbox) {
            feoClasses.push({
                class: checkbox.dataset.class,
                round: checkbox.dataset.round,
                judge: checkbox.dataset.judge,
                day: checkbox.dataset.day,
                type: 'feo'
            });
        });
        
        var allSelectedClasses = selectedClasses.concat(feoClasses);
        
        if (allSelectedClasses.length === 0) {
            alert('Please select at least one class to enter.');
            return;
        }
        
        // Create entry object
        var newEntry = {
            callName: document.getElementById('dogCallName').value,
            regNumber: document.getElementById('dogRegNumber').value,
            handler: document.getElementById('handlerName').value,
            email: document.getElementById('handlerEmail').value,
            trials: allSelectedClasses,
            entryDate: new Date().toISOString(),
            confirmationNumber: 'TR' + Date.now(),
            trialId: currentTrialId,
            trialName: currentTrial.name
        };
        
        // Add to entries
        entryResults.push(newEntry);
        
        // Save to storage
        saveEntries();
        
        // Show confirmation
        var classListText = allSelectedClasses.map(function(c) {
            return c.class + ' Round ' + c.round + ' (' + c.type.toUpperCase() + ')';
        }).join('\n  ');
        
        alert('✅ Entry submitted successfully!\n\nHandler: ' + newEntry.handler + '\nDog: ' + newEntry.callName + ' (' + newEntry.regNumber + ')\nClasses entered:\n  ' + classListText + '\n\nConfirmation Number: ' + newEntry.confirmationNumber + '\nTotal entries in trial: ' + entryResults.length);
        
        // Clear form for next entry
        this.reset();
        
        // Update displays
        updateResultsDisplay();
        loadEntryFormTab();
    };
}

function saveEntries() {
    if (!currentTrialId) return;
    
    // Update user trials
    if (currentUser) {
        var userTrials = JSON.parse(localStorage.getItem('trials_' + currentUser.username) || '{}');
        if (userTrials[currentTrialId]) {
            userTrials[currentTrialId].results = entryResults;
            userTrials[currentTrialId].updated = new Date().toISOString();
            localStorage.setItem('trials_' + currentUser.username, JSON.stringify(userTrials));
        }
    }
    
    // Update public trials
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    if (publicTrials[currentTrialId]) {
        publicTrials[currentTrialId].results = entryResults;
        publicTrials[currentTrialId].updated = new Date().toISOString();
        localStorage.setItem('publicTrials', JSON.stringify(publicTrials));
    }
}

// Find specific trial by name
function findTrialByName(trialName) {
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var foundTrialId = null;
    var foundTrial = null;
    
    for (var trialId in publicTrials) {
        var trial = publicTrials[trialId];
        if (trial.name && trial.name.toLowerCase().includes(trialName.toLowerCase())) {
            foundTrialId = trialId;
            foundTrial = trial;
            break;
        }
    }
    
    if (foundTrial) {
        currentTrialId = foundTrialId;
        trialConfig = foundTrial.config || [];
        entryResults = foundTrial.results || [];
        
        // Load trial data into form
        if (foundTrial.name) document.getElementById('trialName').value = foundTrial.name;
        if (foundTrial.clubName) document.getElementById('clubName').value = foundTrial.clubName;
        if (foundTrial.location) document.getElementById('trialLocation').value = foundTrial.location;
        
        console.log('✅ Found trial: ' + foundTrial.name);
        console.log('Current entries: ' + entryResults.length);
        return foundTrialId;
    } else {
        console.log('❌ Trial not found: ' + trialName);
        console.log('Available trials:');
        for (var trialId in publicTrials) {
            console.log('- ' + (publicTrials[trialId].name || 'Unnamed Trial'));
        }
        return null;
    }
}

// Quick function to find and load June League
function loadJuneLeague() {
    return findTrialByName('june league');
}

// Enhanced entry form that works with any trial
function showTrialEntryForm(trialId) {
    if (trialId) {
        currentTrialId = trialId;
        var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        var trial = publicTrials[trialId];
        if (trial) {
            trialConfig = trial.config || [];
            entryResults = trial.results || [];
        }
    }
    
    showJuneLeagueEntryForm();
}

// Add quick access functions
function quickAccessJuneLeague() {
    var juneLeagueId = findTrialByName('june league');
    if (juneLeagueId) {
        showTrialEntryForm(juneLeagueId);
    } else {
        alert('June League trial not found. Please check the trial name.');
    }
}

// Validation functions
function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateForm(formId) {
    var form = document.getElementById(formId);
    if (!form) return false;
    
    var requiredFields = form.querySelectorAll('input[required]');
    var isValid = true;
    
    requiredFields.forEach(function(field) {
        if (!field.value.trim()) {
            field.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            field.style.borderColor = '#e0e0e0';
        }
    });
    
    return isValid;
}
