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
}
