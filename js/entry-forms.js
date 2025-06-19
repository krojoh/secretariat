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

// Entry Management Functions - Delete and Clear Entries

// Function to show all entries with delete options
function showAllEntriesWithManagement() {
    if (entryResults.length === 0) {
        alert('No entries to manage');
        return;
    }
    
    var modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 10000; 
        display: flex; justify-content: center; align-items: center; padding: 20px;
    `;
    
    var html = `
        <div style="background: white; border-radius: 15px; max-width: 1200px; width: 100%; max-height: 80vh; overflow-y: auto;">
            <div style="padding: 20px; border-bottom: 2px solid #eee; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 15px 15px 0 0;">
                <h2 style="margin: 0;">📋 Manage Entries (${entryResults.length} total)</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Select entries to delete or clear all entries</p>
            </div>
            <div style="padding: 30px;">
                <div style="display: flex; gap: 15px; margin-bottom: 25px; justify-content: center;">
                    <button onclick="selectAllEntries()" style="background: #17a2b8; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">✅ Select All</button>
                    <button onclick="unselectAllEntries()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">❌ Unselect All</button>
                    <button onclick="deleteSelectedEntries()" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">🗑️ Delete Selected</button>
                    <button onclick="clearAllEntries()" style="background: #fd7e14; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">🧹 Clear All Entries</button>
                    <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">✅ Done</button>
                </div>
                
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; background: white;">
                        <thead>
                            <tr style="background: #f8f9fa;">
                                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">
                                    <input type="checkbox" id="selectAllCheckbox" onchange="toggleAllEntries(this.checked)" style="transform: scale(1.2);">
                                </th>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">#</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Dog Name</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Registration</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Handler</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Email</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Classes</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    // Enhanced Entry Form with Auto-fill - Add to js/entry-forms.js or replace existing functions

// Enhanced CSV parser to extract registration data for auto-fill
function parseCSVForEntryData(csvText) {
    csvData = [];
    csvJudges = [];
    csvClasses = [];
    var registrationData = {}; // For auto-fill lookup
    
    const lines = csvText.split('\n');
    
    lines.forEach(function(line, index) {
        line = line.trim();
        if (!line) return;
        
        try {
            // Parse: 07-0001-01BJShirley OttmerPatrol 1Linda Alberda
            const regNumber = line.substring(0, 10); // 07-0001-01
            const restOfLine = line.substring(10); // BJShirley OttmerPatrol 1Linda Alberda
            
            // Extract dog name, handler, class, and judge
            let dogName = '';
            let handlerName = '';
            let className = '';
            let judgeName = '';
            
            // Method to parse the combined string
            // Look for class patterns to split the string
            const classPatterns = [
                'Patrol', 'Detective', 'Investigator', 'Super Sleuth', 'Private Inv',
                'Novice', 'Open', 'Excellent', 'Masters', 'FAST', 'Jumpers',
                'Standard', 'Premier', 'Wildcard', 'Snooker', 'Gamblers'
            ];
            
            let classFound = false;
            
            for (let pattern of classPatterns) {
                const patternIndex = restOfLine.indexOf(pattern);
                if (patternIndex !== -1) {
                    // Split at the class pattern
                    const beforeClass = restOfLine.substring(0, patternIndex); // BJShirley Ottmer
                    const classAndAfter = restOfLine.substring(patternIndex); // Patrol 1Linda Alberda
                    
                    // Extract class (pattern + optional number)
                    const classMatch = classAndAfter.match(/^([A-Za-z\s]+\d*)/);
                    if (classMatch) {
                        className = classMatch[1].trim();
                    }
                    
                    // Everything after class is judge
                    judgeName = classAndAfter.substring(className.length).trim();
                    
                    // Parse beforeClass to get dog name and handler
                    // Look for capital letters to identify where handler name starts
                    const capitalMatches = beforeClass.match(/[A-Z][a-z]+/g);
                    
                    if (capitalMatches && capitalMatches.length >= 2) {
                        // First part is likely dog name, rest is handler
                        dogName = capitalMatches[0];
                        handlerName = capitalMatches.slice(1).join(' ');
                    }
                    
                    classFound = true;
                    break;
                }
            }
            
            // Alternative parsing if no class pattern found
            if (!classFound) {
                // Try to split by numbers or other patterns
                const parts = restOfLine.split(/(?=[A-Z][a-z])/);
                if (parts.length >= 3) {
                    dogName = parts[0] || '';
                    handlerName = parts[1] || '';
                    judgeName = parts.slice(-1)[0] || '';
                }
            }
            
            // Clean up extracted data
            dogName = dogName.trim();
            handlerName = handlerName.trim();
            className = className.trim();
            judgeName = judgeName.trim();
            
            // Store for auto-fill lookup
            if (regNumber && dogName && handlerName) {
                registrationData[regNumber] = {
                    dogName: dogName,
                    handlerName: handlerName,
                    className: className,
                    judgeName: judgeName,
                    fullLine: line
                };
            }
            
            // Store parsed data
            csvData.push({
                regNumber: regNumber,
                dogName: dogName,
                handlerName: handlerName,
                className: className,
                judgeName: judgeName,
                line: line
            });
            
            // Add to unique lists
            if (className && !csvClasses.includes(className)) {
                csvClasses.push(className);
            }
            
            if (judgeName && !csvJudges.includes(judgeName)) {
                csvJudges.push(judgeName);
            }
            
        } catch (error) {
            console.warn('Error parsing line ' + (index + 1) + ':', line, error);
        }
    });
    
    // Store registration data globally for auto-fill
    window.registrationDatabase = registrationData;
    
    // Sort arrays
    csvClasses.sort();
    csvJudges.sort();
    
    console.log('✅ CSV parsed for entry auto-fill:', {
        registrationRecords: Object.keys(registrationData).length,
        sampleRegistrations: Object.keys(registrationData).slice(0, 5),
        sampleData: registrationData[Object.keys(registrationData)[0]]
    });
}

// Enhanced entry form with reordered fields and auto-fill
function showEnhancedTrialEntryForm(trialId) {
    if (trialId) {
        currentTrialId = trialId;
        var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        var trial = publicTrials[trialId];
        if (trial) {
            trialConfig = trial.config || [];
            entryResults = trial.results || [];
        }
    }
    
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
    
    // Create entry form modal with reordered fields
    var modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 10000; 
        display: flex; justify-content: center; align-items: center; padding: 20px;
    `;
    
    // Build class selection HTML
    var classesHTML = generateClassSelectionHTML(trialConfig);
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;">
            <div style="padding: 20px; border-bottom: 2px solid #eee; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 15px 15px 0 0;">
                <h2 style="margin: 0;">📝 Trial Entry Form</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Enter your dog for: ${currentTrial.name || 'Selected Trial'}</p>
            </div>
            
            <form id="enhancedTrialEntryForm" style="padding: 30px;">
                
                <!-- 1. REGISTRATION NUMBER (Auto-fill trigger) -->
                <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #2196f3;">
                    <h4 style="margin: 0 0 15px 0; color: #1976d2;">🆔 Registration Information</h4>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">Registration Number:</label>
                        <input type="text" 
                               id="dogRegNumber" 
                               placeholder="e.g., 07-0001-01" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;"
                               onchange="autoFillDogInfo(this.value)"
                               oninput="autoFillDogInfo(this.value)">
                        <small style="color: #666; font-style: italic;">Enter registration number to auto-fill dog and handler information</small>
                    </div>
                </div>
                
                <!-- 2. DOG INFORMATION (Auto-filled) -->
                <div style="background: #f3e5f5; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #9c27b0;">
                    <h4 style="margin: 0 0 15px 0; color: #7b1fa2;">🐕 Dog Information</h4>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">Call Name:</label>
                        <input type="text" 
                               id="dogCallName" 
                               placeholder="Dog's call name" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;"
                               required>
                        <small id="autoFillStatus" style="color: #28a745; font-style: italic; display: none;">✅ Auto-filled from registration database</small>
                    </div>
                </div>
                
                <!-- 3. HANDLER INFORMATION (Auto-filled) -->
                <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #4caf50;">
                    <h4 style="margin: 0 0 15px 0; color: #388e3c;">👤 Handler Information</h4>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">Handler Name:</label>
                        <input type="text" 
                               id="handlerName" 
                               placeholder="Handler's full name" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;"
                               required>
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">Email Address:</label>
                        <input type="email" 
                               id="handlerEmail" 
                               placeholder="handler@email.com" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;"
                               required>
                    </div>
                </div>
                
                <!-- 4. CLASS SELECTION -->
                <div style="background: #fff3e0; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #ff9800;">
                    <h4 style="margin: 0 0 15px 0; color: #f57c00;">🏆 Class Selection</h4>
                    <p style="color: #666; margin-bottom: 15px;">Select the classes you want to enter. You can select multiple classes across different days.</p>
                    ${classesHTML}
                </div>
                
                <!-- Submit Buttons -->
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                    <button type="submit" style="background: linear-gradient(45deg, #28a745, #20c997); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">✅ Submit Entry</button>
                    <button type="button" onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="background: linear-gradient(45deg, #dc3545, #c82333); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">❌ Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add enhanced form submission handler
    setupEnhancedFormSubmission();
    
    console.log('✅ Enhanced entry form displayed with auto-fill capability');
}

// Auto-fill function triggered by registration number input
function autoFillDogInfo(regNumber) {
    if (!regNumber || regNumber.length < 8) {
        // Clear auto-fill status
        hideAutoFillStatus();
        return;
    }
    
    // Check if we have registration data loaded
    if (!window.registrationDatabase) {
        console.log('⚠️ Registration database not loaded yet');
        return;
    }
    
    // Look up the registration number
    const dogData = window.registrationDatabase[regNumber];
    
    if (dogData) {
        // Auto-fill the dog name and handler
        const dogCallNameField = document.getElementById('dogCallName');
        const handlerNameField = document.getElementById('handlerName');
        
        if (dogCallNameField && dogData.dogName) {
            dogCallNameField.value = dogData.dogName;
            dogCallNameField.style.background = '#e8f5e8'; // Green tint to show auto-filled
        }
        
        if (handlerNameField && dogData.handlerName) {
            handlerNameField.value = dogData.handlerName;
            handlerNameField.style.background = '#e8f5e8'; // Green tint to show auto-filled
        }
        
        // Show auto-fill status
        showAutoFillStatus('✅ Auto-filled from registration: ' + dogData.dogName + ' / ' + dogData.handlerName);
        
        console.log('✅ Auto-filled registration ' + regNumber + ':', dogData);
        
    } else {
        // Registration not found
        hideAutoFillStatus();
        
        // Reset background colors
        const dogCallNameField = document.getElementById('dogCallName');
        const handlerNameField = document.getElementById('handlerName');
        
        if (dogCallNameField) dogCallNameField.style.background = 'white';
        if (handlerNameField) handlerNameField.style.background = 'white';
        
        console.log('⚠️ Registration number not found:', regNumber);
    }
}

// Show auto-fill status message
function showAutoFillStatus(message) {
    const statusElement = document.getElementById('autoFillStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.display = 'block';
    }
}

// Hide auto-fill status message
function hideAutoFillStatus() {
    const statusElement = document.getElementById('autoFillStatus');
    if (statusElement) {
        statusElement.style.display = 'none';
    }
}

// Generate class selection HTML (unchanged from original)
function generateClassSelectionHTML(trialConfig) {
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
                            <label style="display: flex; align-items: center; cursor: pointer; color: #666;">
                                <input type="checkbox" name="feoClasses" value="${classId}_feo" data-class="${config.className}" data-round="${config.round || 1}" data-judge="${config.judge}" data-day="${config.day}" style="margin-right: 8px;">
                                <span>Enter FEO only (For Exhibition Only)</span>
                            </label>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        classesHTML += '</div>';
    });
    
    return classesHTML;
}

// Enhanced form submission with clear and scroll to top
function setupEnhancedFormSubmission() {
    const form = document.getElementById('enhancedTrialEntryForm');
    if (!form) return;
    
    form.onsubmit = function(e) {
        e.preventDefault();
        
        // Get form data
        const regNumber = document.getElementById('dogRegNumber').value.trim();
        const callName = document.getElementById('dogCallName').value.trim();
        const handler = document.getElementById('handlerName').value.trim();
        const email = document.getElementById('handlerEmail').value.trim();
        
        // Validate required fields
        if (!regNumber || !callName || !handler || !email) {
            alert('❌ Please fill in all required fields.');
            return false;
        }
        
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
            alert('❌ Please select at least one class to enter.');
            return false;
        }
        
        // Create entry object
        var newEntry = {
            regNumber: regNumber,
            callName: callName,
            handler: handler,
            email: email,
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
        
        alert('✅ Entry submitted successfully!\n\nRegistration: ' + regNumber + '\nHandler: ' + handler + '\nDog: ' + callName + '\nClasses entered:\n  ' + classListText + '\n\nConfirmation Number: ' + newEntry.confirmationNumber);
        
        // Clear form
        form.reset();
        
        // Remove auto-fill styling
        document.getElementById('dogCallName').style.background = 'white';
        document.getElementById('handlerName').style.background = 'white';
        hideAutoFillStatus();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Close modal after delay
        setTimeout(function() {
            const modal = document.querySelector('div[style*="position: fixed"]');
            if (modal) modal.remove();
        }, 2000);
        
        // Update displays
        updateAllDisplays();
        
        console.log('✅ Enhanced entry submitted:', newEntry);
        
        return false;
    };
}

// Enhanced CSV loading with entry data parsing
async function loadCSVDataForEntries() {
    try {
        console.log('🔄 Loading CSV data for entry auto-fill...');
        
        const response = await fetch('data/dogs.csv');
        if (!response.ok) {
            throw new Error('CSV file not found at data/dogs.csv');
        }
        
        const csvText = await response.text();
        console.log('✅ CSV loaded for entry auto-fill');
        
        // Parse CSV for both dropdowns and entry auto-fill
        parseCSVForEntryData(csvText);
        
        // Update dropdowns
        updateAllDropdownsWithCSVData();
        
    } catch (error) {
        console.warn('❌ Could not load CSV for entries:', error.message);
        useDefaultDropdownData();
    }
}

// Replacement function calls
function showJuneLeagueEntryForm() {
    showEnhancedTrialEntryForm(currentTrialId);
}

function showTrialEntryForm(trialId) {
    showEnhancedTrialEntryForm(trialId);
}

console.log('✅ Enhanced entry form with auto-fill and reordered fields loaded');
    entryResults.forEach(function(entry, index) {
        var classes = Array.isArray(entry.trials) ? 
            entry.trials.map(function(t) { 
                return t.class + ' R' + t.round + (t.type === 'feo' ? ' (FEO)' : ''); 
            }).join(', ') : 
            (entry.trialClass || 'N/A');
        
        html += `
            <tr style="border-bottom: 1px solid #eee; ${index % 2 === 0 ? 'background: #f8f9fa;' : 'background: white;'}" id="entryRow${index}">
                <td style="padding: 12px; text-align: center;">
                    <input type="checkbox" class="entryCheckbox" data-index="${index}" style="transform: scale(1.2);">
                </td>
                <td style="padding: 12px; font-weight: bold;">${index + 1}</td>
                <td style="padding: 12px; font-weight: bold; color: #2c5aa0;">${entry.callName}</td>
                <td style="padding: 12px;">${entry.regNumber}</td>
                <td style="padding: 12px;">${entry.handler}</td>
                <td style="padding: 12px; font-size: 12px;">${entry.email || 'N/A'}</td>
                <td style="padding: 12px; font-size: 11px; max-width: 200px;">${classes}</td>
                <td style="padding: 12px;">
                    <button onclick="deleteSingleEntry(${index})" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">🗑️ Delete</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div></div></div>';
    modal.innerHTML = html;
    document.body.appendChild(modal);
}

// Toggle all entries selection
function toggleAllEntries(checked) {
    var checkboxes = document.querySelectorAll('.entryCheckbox');
    checkboxes.forEach(function(checkbox) {
        checkbox.checked = checked;
    });
}

// Select all entries
function selectAllEntries() {
    document.getElementById('selectAllCheckbox').checked = true;
    toggleAllEntries(true);
}

// Unselect all entries
function unselectAllEntries() {
    document.getElementById('selectAllCheckbox').checked = false;
    toggleAllEntries(false);
}

// Delete selected entries
function deleteSelectedEntries() {
    var selectedIndices = [];
    var checkboxes = document.querySelectorAll('.entryCheckbox:checked');
    
    checkboxes.forEach(function(checkbox) {
        selectedIndices.push(parseInt(checkbox.dataset.index));
    });
    
    if (selectedIndices.length === 0) {
        alert('No entries selected for deletion.');
        return;
    }
    
    if (confirm('Are you sure you want to delete ' + selectedIndices.length + ' selected entries? This cannot be undone.')) {
        // Sort indices in descending order so we delete from the end first
        selectedIndices.sort(function(a, b) { return b - a; });
        
        selectedIndices.forEach(function(index) {
            entryResults.splice(index, 1);
        });
        
        // Save the updated entries
        saveEntries();
        
        alert('✅ Deleted ' + selectedIndices.length + ' entries successfully!');
        
        // Close modal and refresh displays
        document.querySelector('div[style*="position: fixed"]').remove();
        updateAllDisplays();
    }
}

// Delete a single entry
function deleteSingleEntry(index) {
    var entry = entryResults[index];
    
    if (confirm('Are you sure you want to delete this entry?\n\nDog: ' + entry.callName + ' (' + entry.regNumber + ')\nHandler: ' + entry.handler + '\n\nThis cannot be undone.')) {
        entryResults.splice(index, 1);
        saveEntries();
        
        alert('✅ Entry deleted successfully!');
        
        // Refresh the management modal
        document.querySelector('div[style*="position: fixed"]').remove();
        showAllEntriesWithManagement();
        updateAllDisplays();
    }
}

// Clear all entries from the trial
function clearAllEntries() {
    if (entryResults.length === 0) {
        alert('No entries to clear.');
        return;
    }
    
    var trialName = currentTrialId ? (function() {
        var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        var trial = publicTrials[currentTrialId];
        return trial ? trial.name : 'Current Trial';
    })() : 'Current Trial';
    
    if (confirm('⚠️ WARNING: This will delete ALL ' + entryResults.length + ' entries from "' + trialName + '".\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?')) {
        if (confirm('🚨 FINAL CONFIRMATION:\n\nYou are about to permanently delete ' + entryResults.length + ' entries.\n\nType "DELETE ALL" in the next dialog to confirm.')) {
            var confirmation = prompt('Type "DELETE ALL" to confirm permanent deletion:');
            
            if (confirmation === 'DELETE ALL') {
                entryResults = [];
                saveEntries();
                
                alert('✅ All entries have been cleared from the trial.');
                
                // Close modal and refresh displays
                document.querySelector('div[style*="position: fixed"]').remove();
                updateAllDisplays();
            } else {
                alert('Deletion cancelled. Entries have NOT been deleted.');
            }
        }
    }
}

// Update all displays after entry changes
function updateAllDisplays() {
    // Update entry form tab if it's showing current trial info
    if (document.getElementById('selectedTrialEntryManagement')) {
        var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        var trial = publicTrials[currentTrialId];
        if (trial) {
            updateEntryContext(trial);
        }
    }
    
    // Update results tab if it's showing current trial info
    if (document.getElementById('selectedTrialResults')) {
        var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        var trial = publicTrials[currentTrialId];
        if (trial) {
            updateResultsContext(trial);
        }
    }
    
    // Update My Trials tab
    if (typeof loadUserTrials === 'function') {
        loadUserTrials();
    }
}

// Enhanced showAllEntries function with management option
function showAllEntries() {
    if (entryResults.length === 0) {
        alert('No entries to display');
        return;
    }
    
    // Show choice modal
    var choiceModal = document.createElement('div');
    choiceModal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 10000; 
        display: flex; justify-content: center; align-items: center; padding: 20px;
    `;
    
    choiceModal.innerHTML = `
        <div style="background: white; border-radius: 15px; max-width: 500px; width: 100%; padding: 40px; text-align: center;">
            <h2 style="margin: 0 0 20px 0; color: #333;">📋 View Entries</h2>
            <p style="color: #666; margin-bottom: 30px;">Choose how you want to view the entries:</p>
            
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <button onclick="showEntriesReadOnly(); this.closest('div[style*=\"position: fixed\"]').remove();" style="background: linear-gradient(45deg, #17a2b8, #138496); color: white; border: none; padding: 15px 25px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">
                    👁️ View Only (Read Only)
                </button>
                <button onclick="showAllEntriesWithManagement(); this.closest('div[style*=\"position: fixed\"]').remove();" style="background: linear-gradient(45deg, #dc3545, #c82333); color: white; border: none; padding: 15px 25px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">
                    🗑️ Manage Entries (Delete/Edit)
                </button>
                <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer;">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(choiceModal);
}

// Read-only entries view
function showEntriesReadOnly() {
    var modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 10000; 
        display: flex; justify-content: center; align-items: center; padding: 20px;
    `;
    
    var html = `
        <div style="background: white; border-radius: 15px; max-width: 1000px; width: 100%; max-height: 80vh; overflow-y: auto;">
            <div style="padding: 20px; border-bottom: 2px solid #eee; background: #f8f9fa;">
                <h2 style="margin: 0; color: #333;">📋 All Entries (${entryResults.length} total)</h2>
                <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="float: right; background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">✕ Close</button>
            </div>
            <div style="padding: 20px;">
                ${generateDetailedEntriesTable(entryResults)}
            </div>
        </div>
    `;
    
    modal.innerHTML = html;
    document.body.appendChild(modal);
}

function generateDetailedEntriesTable(entries) {
    var html = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background: white;">
                <thead>
                    <tr style="background: linear-gradient(45deg, #667eea, #764ba2); color: white;">
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #ddd;">#</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #ddd;">Dog Name</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #ddd;">Registration</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #ddd;">Handler</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #ddd;">Email</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #ddd;">Classes Entered</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #ddd;">Entry Date</th>
                        <th style="padding: 15px; text-align: left; border-bottom: 2px solid #ddd;">Confirmation</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    entries.forEach(function(entry, index) {
        var classes = Array.isArray(entry.trials) ? 
            entry.trials.map(function(t) { 
                return t.class + ' R' + t.round + (t.type === 'feo' ? ' (FEO)' : ''); 
            }).join(', ') : 
            (entry.trialClass || 'N/A');
        
        var entryDate = entry.entryDate ? new Date(entry.entryDate).toLocaleDateString() : 'N/A';
        
        html += `
            <tr style="border-bottom: 1px solid #eee; ${index % 2 === 0 ? 'background: #f8f9fa;' : 'background: white;'}">
                <td style="padding: 12px; font-weight: bold;">${index + 1}</td>
                <td style="padding: 12px; font-weight: bold; color: #2c5aa0;">${entry.callName}</td>
                <td style="padding: 12px;">${entry.regNumber}</td>
                <td style="padding: 12px;">${entry.handler}</td>
                <td style="padding: 12px; font-size: 12px;">${entry.email || 'N/A'}</td>
                <td style="padding: 12px; font-size: 11px; max-width: 200px; word-wrap: break-word;">${classes}</td>
                <td style="padding: 12px;">${entryDate}</td>
                <td style="padding: 12px; font-size: 11px;">${entry.confirmationNumber || 'N/A'}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    return html;
    // Cancel Button Fix - Add to js/entry-forms.js or replace existing functions

// Enhanced cancel function that properly returns to dashboard
function cancelEntryForm() {
    // Close any open modal
    var modal = document.querySelector('div[style*="position: fixed"]');
    if (modal) {
        modal.remove();
        console.log('✅ Entry form modal closed');
    }
    
    // Clear any form data
    clearAnyFormData();
    
    // Return to dashboard/trials tab
    returnToDashboard();
    
    console.log('✅ Cancelled entry form and returned to dashboard');
}

// Clear any lingering form data
function clearAnyFormData() {
    // Clear any auto-fill status
    if (typeof hideAutoFillStatus === 'function') {
        hideAutoFillStatus();
    }
    
    // Reset any form fields that might be lingering
    var forms = document.querySelectorAll('form');
    forms.forEach(function(form) {
        if (form.id && form.id.includes('Entry')) {
            form.reset();
        }
    });
}

// Function to return to dashboard
function returnToDashboard() {
    // Option 1: Go to trials tab
    if (typeof showTab === 'function') {
        var trialsTab = document.querySelector('.nav-tab[onclick*="trials"]');
        if (trialsTab) {
            showTab('trials', trialsTab);
            console.log('✅ Switched to trials tab');
            return;
        }
    }
    
    // Option 2: Go to main dashboard if function exists
    if (typeof showDashboard === 'function') {
        showDashboard();
        console.log('✅ Returned to main dashboard');
        return;
    }
    
    // Option 3: Go to entry tab (fallback)
    if (typeof showTab === 'function') {
        var entryTab = document.querySelector('.nav-tab[onclick*="entry"]');
        if (entryTab) {
            showTab('entry', entryTab);
            console.log('✅ Returned to entry tab');
            return;
        }
    }
    
    // Option 4: Scroll to top (final fallback)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log('✅ Scrolled to top');
}

// Enhanced entry form generation with proper cancel button
function showEnhancedTrialEntryFormWithCancel(trialId) {
    if (trialId) {
        currentTrialId = trialId;
        var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        var trial = publicTrials[trialId];
        if (trial) {
            trialConfig = trial.config || [];
            entryResults = trial.results || [];
        }
    }
    
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
    
    // Build class selection HTML (reuse existing function if available)
    var classesHTML = '';
    if (typeof generateClassSelectionHTML === 'function') {
        classesHTML = generateClassSelectionHTML(trialConfig);
    } else {
        classesHTML = generateBasicClassSelectionHTML(trialConfig);
    }
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;">
            <div style="padding: 20px; border-bottom: 2px solid #eee; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 15px 15px 0 0;">
                <h2 style="margin: 0;">📝 Trial Entry Form</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Enter your dog for: ${currentTrial.name || 'Selected Trial'}</p>
            </div>
            
            <form id="enhancedTrialEntryForm" style="padding: 30px;">
                
                <!-- Registration Number -->
                <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #2196f3;">
                    <h4 style="margin: 0 0 15px 0; color: #1976d2;">🆔 Registration Information</h4>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">Registration Number:</label>
                        <input type="text" 
                               id="dogRegNumber" 
                               placeholder="e.g., 07-0001-01" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;"
                               onchange="autoFillDogInfo(this.value)"
                               oninput="autoFillDogInfo(this.value)">
                        <small style="color: #666; font-style: italic;">Enter registration number to auto-fill dog and handler information</small>
                    </div>
                </div>
                
                <!-- Dog Information -->
                <div style="background: #f3e5f5; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #9c27b0;">
                    <h4 style="margin: 0 0 15px 0; color: #7b1fa2;">🐕 Dog Information</h4>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">Call Name:</label>
                        <input type="text" 
                               id="dogCallName" 
                               placeholder="Dog's call name" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;"
                               required>
                        <small id="autoFillStatus" style="color: #28a745; font-style: italic; display: none;">✅ Auto-filled from registration database</small>
                    </div>
                </div>
                
                <!-- Handler Information -->
                <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #4caf50;">
                    <h4 style="margin: 0 0 15px 0; color: #388e3c;">👤 Handler Information</h4>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">Handler Name:</label>
                        <input type="text" 
                               id="handlerName" 
                               placeholder="Handler's full name" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;"
                               required>
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">Email Address:</label>
                        <input type="email" 
                               id="handlerEmail" 
                               placeholder="handler@email.com" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;"
                               required>
                    </div>
                </div>
                
                <!-- Class Selection -->
                <div style="background: #fff3e0; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #ff9800;">
                    <h4 style="margin: 0 0 15px 0; color: #f57c00;">🏆 Class Selection</h4>
                    <p style="color: #666; margin-bottom: 15px;">Select the classes you want to enter. You can select multiple classes across different days.</p>
                    ${classesHTML}
                </div>
                
                <!-- Enhanced Submit Buttons with proper cancel -->
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                    <button type="submit" style="background: linear-gradient(45deg, #28a745, #20c997); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">✅ Submit Entry</button>
                    <button type="button" onclick="cancelEntryForm()" style="background: linear-gradient(45deg, #6c757d, #5a6268); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">🏠 Return to Dashboard</button>
                    <button type="button" onclick="closeEntryFormOnly()" style="background: linear-gradient(45deg, #dc3545, #c82333); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">❌ Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add enhanced form submission handler
    setupEnhancedFormSubmissionWithCancel();
    
    console.log('✅ Enhanced entry form displayed with proper cancel functionality');
}

// Close form only (without navigation)
function closeEntryFormOnly() {
    var modal = document.querySelector('div[style*="position: fixed"]');
    if (modal) {
        modal.remove();
        console.log('✅ Entry form closed');
    }
}

// Basic class selection HTML generator (fallback)
function generateBasicClassSelectionHTML(trialConfig) {
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
            
            classesHTML += `
                <div style="background: white; padding: 12px; margin: 8px 0; border-radius: 6px; border: 1px solid #d0d0d0;">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" name="selectedClasses" value="${classId}" data-class="${config.className}" data-round="${config.round || 1}" data-judge="${config.judge}" data-day="${config.day}" style="margin-right: 10px; transform: scale(1.2);">
                        <span style="font-weight: bold;">${classLabel}</span>
                    </label>
                </div>
            `;
        });
        
        classesHTML += '</div>';
    });
    
    return classesHTML;
}

// Enhanced form submission handler
function setupEnhancedFormSubmissionWithCancel() {
    const form = document.getElementById('enhancedTrialEntryForm');
    if (!form) return;
    
    form.onsubmit = function(e) {
        e.preventDefault();
        
        // Get form data
        const regNumber = document.getElementById('dogRegNumber').value.trim();
        const callName = document.getElementById('dogCallName').value.trim();
        const handler = document.getElementById('handlerName').value.trim();
        const email = document.getElementById('handlerEmail').value.trim();
        
        // Validate required fields
        if (!regNumber || !callName || !handler || !email) {
            alert('❌ Please fill in all required fields.');
            return false;
        }
        
        // Get selected classes (simplified version)
        var selectedClasses = [];
        document.querySelectorAll('input[name="selectedClasses"]:checked').forEach(function(checkbox) {
            selectedClasses.push({
                class: checkbox.dataset.class,
                round: checkbox.dataset.round,
                judge: checkbox.dataset.judge,
                day: checkbox.dataset.day,
                type: 'regular'
            });
        });
        
        if (selectedClasses.length === 0) {
            alert('❌ Please select at least one class to enter.');
            return false;
        }
        
        // Create entry object
        var newEntry = {
            regNumber: regNumber,
            callName: callName,
            handler: handler,
            email: email,
            trials: selectedClasses,
            entryDate: new Date().toISOString(),
            confirmationNumber: 'TR' + Date.now(),
            trialId: currentTrialId,
            trialName: currentTrial.name
        };
        
        // Add to entries
        entryResults.push(newEntry);
        
        // Save to storage
        if (typeof saveEntries === 'function') {
            saveEntries();
        }
        
        // Show confirmation
        var classListText = selectedClasses.map(function(c) {
            return c.class + ' Round ' + c.round;
        }).join('\n  ');
        
        alert('✅ Entry submitted successfully!\n\nRegistration: ' + regNumber + '\nHandler: ' + handler + '\nDog: ' + callName + '\nClasses entered:\n  ' + classListText + '\n\nConfirmation Number: ' + newEntry.confirmationNumber);
        
        // Clear form
        form.reset();
        
        // Close modal and return to dashboard
        cancelEntryForm();
        
        console.log('✅ Enhanced entry submitted:', newEntry);
        
        return false;
    };
}

// Override existing entry form functions to use the enhanced version
function showJuneLeagueEntryForm() {
    showEnhancedTrialEntryFormWithCancel(currentTrialId);
}

function showTrialEntryForm(trialId) {
    showEnhancedTrialEntryFormWithCancel(trialId);
}

// Auto-fill function (simplified version)
function autoFillDogInfo(regNumber) {
    if (!regNumber || regNumber.length < 8) {
        if (typeof hideAutoFillStatus === 'function') {
            hideAutoFillStatus();
        }
        return;
    }
    
    // Check if we have registration data loaded
    if (window.registrationDatabase && window.registrationDatabase[regNumber]) {
        const dogData = window.registrationDatabase[regNumber];
        
        const dogCallNameField = document.getElementById('dogCallName');
        const handlerNameField = document.getElementById('handlerName');
        
        if (dogCallNameField && dogData.dogName) {
            dogCallNameField.value = dogData.dogName;
            dogCallNameField.style.background = '#e8f5e8';
        }
        
        if (handlerNameField && dogData.handlerName) {
            handlerNameField.value = dogData.handlerName;
            handlerNameField.style.background = '#e8f5e8';
        }
        
        if (typeof showAutoFillStatus === 'function') {
            showAutoFillStatus('✅ Auto-filled: ' + dogData.dogName + ' / ' + dogData.handlerName);
        }
        
        console.log('✅ Auto-filled registration ' + regNumber + ':', dogData);
    }
}

console.log('✅ Enhanced entry form with proper cancel button loaded');
}
// COMPLETE ENTRY FORM CANCEL FIX - Add to js/entry-forms.js or run in console

// Enhanced cancel function that properly returns to dashboard
function cancelEntryForm() {
    console.log('🚫 Cancelling entry form...');
    
    // 1. Close any modal
    var modals = document.querySelectorAll('div[style*="position: fixed"]');
    modals.forEach(function(modal) {
        modal.remove();
        console.log('✅ Modal removed');
    });
    
    // 2. Clear any form data
    clearAnyEntryFormData();
    
    // 3. Return to dashboard/trials tab
    returnToDashboard();
    
    console.log('✅ Entry form cancelled and returned to dashboard');
}

// Clear any lingering entry form data
function clearAnyEntryFormData() {
    // Clear any auto-fill status
    var autoFillStatus = document.getElementById('autoFillStatus');
    if (autoFillStatus) {
        autoFillStatus.style.display = 'none';
    }
    
    // Reset any highlighted form fields
    var entryInputs = document.querySelectorAll('input[id*="dog"], input[id*="handler"], input[id*="reg"]');
    entryInputs.forEach(function(input) {
        input.style.background = 'white';
        input.style.borderColor = '#ddd';
    });
    
    console.log('✅ Entry form data cleared');
}

// Function to return to dashboard with multiple fallback methods
function returnToDashboard() {
    console.log('🏠 Attempting to return to dashboard...');
    
    // Method 1: Try to go to trials tab (most common)
    var trialsTab = document.querySelector('.nav-tab[onclick*="trials"]');
    if (trialsTab && typeof showTab === 'function') {
        showTab('trials', trialsTab);
        console.log('✅ Returned to trials tab');
        return;
    }
    
    // Method 2: Try to go to entry tab
    var entryTab = document.querySelector('.nav-tab[onclick*="entry"]');
    if (entryTab && typeof showTab === 'function') {
        showTab('entry', entryTab);
        console.log('✅ Returned to entry tab');
        return;
    }
    
    // Method 3: Try to click trials tab directly
    var trialsTabDirect = document.querySelector('button[onclick*="showTab(\'trials\'"]');
    if (trialsTabDirect) {
        trialsTabDirect.click();
        console.log('✅ Clicked trials tab directly');
        return;
    }
    
    // Method 4: Use dashboard function if available
    if (typeof showDashboard === 'function') {
        showDashboard();
        console.log('✅ Used showDashboard function');
        return;
    }
    
    // Method 5: Scroll to top as final fallback
    window.scrollTo({ top: 0, behavior: 'smooth' });
    console.log('✅ Scrolled to top (fallback)');
}

// Fix all existing cancel buttons in entry forms
function fixAllCancelButtons() {
    console.log('🔧 Fixing all cancel buttons...');
    
    // Find all cancel buttons in entry forms
    var cancelButtons = document.querySelectorAll('button[onclick*="remove"], button[onclick*="cancel"], button[onclick*="Cancel"]');
    
    cancelButtons.forEach(function(button, index) {
        // Check if this is in an entry form modal
        var modal = button.closest('div[style*="position: fixed"]');
        if (modal) {
            console.log('📝 Fixing cancel button ' + (index + 1));
            
            // Replace the onclick
            button.onclick = function(e) {
                e.preventDefault();
                cancelEntryForm();
                return false;
            };
            
            // Update button text and style
            if (button.textContent.includes('Cancel') || button.textContent.includes('❌')) {
                button.innerHTML = '🏠 Return to Dashboard';
                button.style.background = 'linear-gradient(45deg, #6c757d, #5a6268)';
            }
            
            console.log('✅ Fixed cancel button: ' + button.textContent);
        }
    });
    
    console.log('✅ All cancel buttons fixed');
}

// Enhanced entry form creation with proper cancel handling
function createEntryFormWithProperCancel(trialId, trialName) {
    console.log('📝 Creating entry form with proper cancel for trial:', trialName);
    
    var modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 10000; 
        display: flex; justify-content: center; align-items: center; padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;">
            <div style="padding: 20px; border-bottom: 2px solid #eee; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 15px 15px 0 0;">
                <h2 style="margin: 0;">📝 Trial Entry Form</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Enter your dog for: ${trialName}</p>
            </div>
            
            <form id="enhancedTrialEntryForm" style="padding: 30px;">
                <!-- Registration Number -->
                <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                    <h4 style="margin: 0 0 15px 0; color: #1976d2;">🆔 Registration Information</h4>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Registration Number:</label>
                        <input type="text" id="dogRegNumber" placeholder="e.g., 07-0001-01" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px;">
                    </div>
                </div>
                
                <!-- Dog Information -->
                <div style="background: #f3e5f5; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                    <h4 style="margin: 0 0 15px 0; color: #7b1fa2;">🐕 Dog Information</h4>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Call Name:</label>
                        <input type="text" id="dogCallName" placeholder="Dog's call name" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px;" required>
                    </div>
                </div>
                
                <!-- Handler Information -->
                <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                    <h4 style="margin: 0 0 15px 0; color: #388e3c;">👤 Handler Information</h4>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Handler Name:</label>
                        <input type="text" id="handlerName" placeholder="Handler's full name" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px;" required>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Email Address:</label>
                        <input type="email" id="handlerEmail" placeholder="handler@email.com" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px;" required>
                    </div>
                </div>
                
                <!-- Submit Buttons with Enhanced Cancel -->
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                    <button type="submit" 
                            style="background: linear-gradient(45deg, #28a745, #20c997); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">
                        ✅ Submit Entry
                    </button>
                    <button type="button" onclick="cancelEntryForm()" 
                            style="background: linear-gradient(45deg, #6c757d, #5a6268); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">
                        🏠 Return to Dashboard
                    </button>
                    <button type="button" onclick="cancelEntryForm()" 
                            style="background: linear-gradient(45deg, #dc3545, #c82333); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">
                        ❌ Cancel
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add form submission handler
    document.getElementById('enhancedTrialEntryForm').onsubmit = function(e) {
        e.preventDefault();
        alert('Entry submitted! (Demo)');
        cancelEntryForm(); // Return to dashboard after submit
        return false;
    };
    
    console.log('✅ Entry form created with proper cancel functionality');
}

// Override existing entry form functions
function showJuneLeagueEntryForm() {
    if (currentTrialId) {
        var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        var trial = publicTrials[currentTrialId];
        if (trial) {
            createEntryFormWithProperCancel(currentTrialId, trial.name);
            return;
        }
    }
    
    createEntryFormWithProperCancel('demo', 'Demo Trial');
}

function showTrialEntryForm(trialId) {
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var trial = publicTrials[trialId];
    if (trial) {
        createEntryFormWithProperCancel(trialId, trial.name);
    }
}

// Console commands for immediate fixing
function fixCancelButtonsNow() {
    console.log('🔧 Immediate cancel button fix...');
    
    // Fix any current cancel buttons
    fixAllCancelButtons();
    
    // Override any problematic onclick handlers
    var problemButtons = document.querySelectorAll('button[onclick*="closest"][onclick*="remove"]');
    problemButtons.forEach(function(button) {
        button.onclick = function(e) {
            e.preventDefault();
            cancelEntryForm();
            return false;
        };
        button.innerHTML = '🏠 Return to Dashboard';
        button.style.background = 'linear-gradient(45deg, #6c757d, #5a6268)';
    });
    
    console.log('✅ Cancel buttons fixed immediately');
}

// Auto-run the fix
console.log('🔧 Entry form cancel fix loaded');
console.log('💡 Commands available:');
console.log('  - fixCancelButtonsNow() : Fix current cancel buttons');
console.log('  - cancelEntryForm() : Manual cancel');

// Auto-fix any existing problematic buttons
setTimeout(fixCancelButtonsNow, 1000);
// ADD this to the END of js/entry-forms.js

// ===== ENHANCED ENTRY FORM WITH AUTO-FILL =====

// Enhanced entry form with registration auto-fill
function showEnhancedTrialEntryForm(trialId) {
    if (trialId) {
        currentTrialId = trialId;
        var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        var trial = publicTrials[trialId];
        if (trial) {
            trialConfig = trial.config || [];
            entryResults = trial.results || [];
        }
    }
    
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
    
    // Create entry form modal with auto-fill
    var modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 10000; 
        display: flex; justify-content: center; align-items: center; padding: 20px;
    `;
    
    // Build class selection HTML
    var classesHTML = generateClassSelectionHTML(trialConfig);
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;">
            <div style="padding: 20px; border-bottom: 2px solid #eee; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 15px 15px 0 0;">
                <h2 style="margin: 0;">📝 Trial Entry Form</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Enter your dog for: ${currentTrial.name || 'Selected Trial'}</p>
            </div>
            
            <form id="enhancedTrialEntryForm" style="padding: 30px;">
                
                <!-- 1. REGISTRATION NUMBER (Auto-fill trigger) -->
                <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #2196f3;">
                    <h4 style="margin: 0 0 15px 0; color: #1976d2;">🆔 Registration Information</h4>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">Registration Number:</label>
                        <input type="text" 
                               id="dogRegNumber" 
                               placeholder="e.g., 07-0001-01" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;"
                               onchange="autoFillDogInfo(this.value)"
                               oninput="autoFillDogInfo(this.value)">
                        <small style="color: #666; font-style: italic;">Enter registration number to auto-fill dog and handler information</small>
                    </div>
                </div>
                
                <!-- 2. DOG INFORMATION (Auto-filled) -->
                <div style="background: #f3e5f5; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #9c27b0;">
                    <h4 style="margin: 0 0 15px 0; color: #7b1fa2;">🐕 Dog Information</h4>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">Call Name:</label>
                        <input type="text" 
                               id="dogCallName" 
                               placeholder="Dog's call name" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;"
                               required>
                        <small id="autoFillStatus" style="color: #28a745; font-style: italic; display: none;">✅ Auto-filled from registration database</small>
                    </div>
                </div>
                
                <!-- 3. HANDLER INFORMATION (Auto-filled) -->
                <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #4caf50;">
                    <h4 style="margin: 0 0 15px 0; color: #388e3c;">👤 Handler Information</h4>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">Handler Name:</label>
                        <input type="text" 
                               id="handlerName" 
                               placeholder="Handler's full name" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;"
                               required>
                    </div>
                    <div class="form-group" style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px; color: #333;">Email Address:</label>
                        <input type="email" 
                               id="handlerEmail" 
                               placeholder="handler@email.com" 
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; background: white;"
                               required>
                    </div>
                </div>
                
                <!-- 4. CLASS SELECTION -->
                <div style="background: #fff3e0; padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 5px solid #ff9800;">
                    <h4 style="margin: 0 0 15px 0; color: #f57c00;">🏆 Class Selection</h4>
                    <p style="color: #666; margin-bottom: 15px;">Select the classes you want to enter. You can select multiple classes across different days.</p>
                    ${classesHTML}
                </div>
                
                <!-- Submit Buttons -->
                <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                    <button type="submit" style="background: linear-gradient(45deg, #28a745, #20c997); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">✅ Submit Entry</button>
                    <button type="button" onclick="cancelEntryForm()" style="background: linear-gradient(45deg, #6c757d, #5a6268); color: white; border: none; padding: 15px 30px; border-radius: 25px; cursor: pointer; font-weight: bold; font-size: 16px;">🏠 Return to Dashboard</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add enhanced form submission handler
    setupEnhancedFormSubmission();
    
    console.log('✅ Enhanced entry form displayed with auto-fill capability');
}

// Auto-fill function triggered by registration number input
function autoFillDogInfo(regNumber) {
    if (!regNumber || regNumber.length < 8) {
        hideAutoFillStatus();
        return;
    }
    
    // Check if we have registration data loaded
    if (!window.registrationDatabase) {
        console.log('⚠️ Registration database not loaded yet');
        return;
    }
    
    // Look up the registration number
    const dogData = window.registrationDatabase[regNumber];
    
    if (dogData) {
        // Auto-fill the dog name and handler
        const dogCallNameField = document.getElementById('dogCallName');
        const handlerNameField = document.getElementById('handlerName');
        
        if (dogCallNameField && dogData.dogName) {
            dogCallNameField.value = dogData.dogName;
            dogCallNameField.style.background = '#e8f5e8';
        }
        
        if (handlerNameField && dogData.handlerName) {
            handlerNameField.value = dogData.handlerName;
            handlerNameField.style.background = '#e8f5e8';
        }
        
        showAutoFillStatus('✅ Auto-filled from registration: ' + dogData.dogName + ' / ' + dogData.handlerName);
        console.log('✅ Auto-filled registration ' + regNumber + ':', dogData);
        
    } else {
        hideAutoFillStatus();
        
        const dogCallNameField = document.getElementById('dogCallName');
        const handlerNameField = document.getElementById('handlerName');
        
        if (dogCallNameField) dogCallNameField.style.background = 'white';
        if (handlerNameField) handlerNameField.style.background = 'white';
        
        console.log('⚠️ Registration number not found:', regNumber);
    }
}

// Show auto-fill status message
function showAutoFillStatus(message) {
    const statusElement = document.getElementById('autoFillStatus');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.display = 'block';
    }
}

// Hide auto-fill status message
function hideAutoFillStatus() {
    const statusElement = document.getElementById('autoFillStatus');
    if (statusElement) {
        statusElement.style.display = 'none';
    }
}

// Enhanced form submission
function setupEnhancedFormSubmission() {
    const form = document.getElementById('enhancedTrialEntryForm');
    if (!form) return;
    
    form.onsubmit = function(e) {
        e.preventDefault();
        
        // Get form data
        const regNumber = document.getElementById('dogRegNumber').value.trim();
        const callName = document.getElementById('dogCallName').value.trim();
        const handler = document.getElementById('handlerName').value.trim();
        const email = document.getElementById('handlerEmail').value.trim();
        
        // Validate required fields
        if (!regNumber || !callName || !handler || !email) {
            alert('❌ Please fill in all required fields.');
            return false;
        }
        
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
            alert('❌ Please select at least one class to enter.');
            return false;
        }
        
        // Create entry object
        var newEntry = {
            regNumber: regNumber,
            callName: callName,
            handler: handler,
            email: email,
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
        
        alert('✅ Entry submitted successfully!\n\nRegistration: ' + regNumber + '\nHandler: ' + handler + '\nDog: ' + callName + '\nClasses entered:\n  ' + classListText + '\n\nConfirmation Number: ' + newEntry.confirmationNumber);
        
        // Clear form
        form.reset();
        document.getElementById('dogCallName').style.background = 'white';
        document.getElementById('handlerName').style.background = 'white';
        hideAutoFillStatus();
        
        // Close modal
        var modal = document.querySelector('div[style*="position: fixed"]');
        if (modal) modal.remove();
        
        // Update displays
        if (typeof updateAllDisplays === 'function') updateAllDisplays();
        
        console.log('✅ Enhanced entry submitted:', newEntry);
        return false;
    };
}

// Enhanced cancel function
function cancelEntryForm() {
    var modals = document.querySelectorAll('div[style*="position: fixed"]');
    modals.forEach(function(modal) {
        modal.remove();
    });
    
    // Return to trials tab
    if (typeof showTab === 'function') {
        var trialsTab = document.querySelector('.nav-tab[onclick*="trials"]');
        if (trialsTab) {
            showTab('trials', trialsTab);
        }
    }
    
    console.log('✅ Entry form cancelled');
}

// Override existing entry form functions to use enhanced version
function showJuneLeagueEntryForm() {
    showEnhancedTrialEntryForm(currentTrialId);
}

function showTrialEntryForm(trialId) {
    showEnhancedTrialEntryForm(trialId);
}

console.log('✅ Enhanced entry form functions loaded permanently');
