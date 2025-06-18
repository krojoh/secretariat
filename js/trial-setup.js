// Trial Setup Functions

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
            <div class="day-container">
                <div class="day-header">Day ${i}</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                    <div class="form-group">
                        <label>Date:</label>
                        <input type="date" id="day${i}_date">
                    </div>
                    <div class="form-group">
                        <label>Number of Classes:</label>
                        <input type="number" id="day${i}_numClasses" min="1" max="10" value="2" onchange="generateClassesForDay(${i})">
                    </div>
                </div>
                <div id="day${i}_classes">
                    <!-- Classes will be generated here -->
                </div>
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
    var numClasses = parseInt(document.getElementById('day' + dayNum + '_numClasses').value) || 1;
    var container = document.getElementById('day' + dayNum + '_classes');
    
    if (!container) return;
    
    var html = '<h4 style="color: #2c5aa0; margin-bottom: 15px;">Classes for Day ' + dayNum + ':</h4>';
    
    for (var c = 1; c <= numClasses; c++) {
        html += `
            <div style="background: #fff3cd; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #ffc107;">
                <h5 style="margin: 0 0 15px 0; color: #856404;">Class ${c}</h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div class="form-group">
                        <label>Class Name:</label>
                        <input type="text" id="day${dayNum}_class${c}_name" placeholder="e.g., Novice A" onchange="updateTrialConfig()">
                    </div>
                    <div class="form-group">
                        <label>Judge:</label>
                        <input type="text" id="day${dayNum}_class${c}_judge" placeholder="Judge name" onchange="updateTrialConfig()">
                    </div>
                    <div class="form-group">
                        <label>Round:</label>
                        <select id="day${dayNum}_class${c}_round" onchange="updateTrialConfig()">
                            <option value="1">Round 1</option>
                            <option value="2">Round 2</option>
                            <option value="3">Round 3</option>
                        </select>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" id="day${dayNum}_class${c}_feo" onchange="updateTrialConfig()" style="margin-right: 8px;">
                        <span>Offer FEO (For Exhibition Only)</span>
                    </label>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
    updateTrialConfig();
}

function updateTrialConfig() {
    trialConfig = [];
    
    var days = parseInt(document.getElementById('trialDays').value) || 1;
    
    for (var d = 1; d <= days; d++) {
        var dayDate = document.getElementById('day' + d + '_date') ? document.getElementById('day' + d + '_date').value : '';
        var numClasses = parseInt(document.getElementById('day' + d + '_numClasses').value) || 1;
        
        for (var c = 1; c <= numClasses; c++) {
            var className = document.getElementById('day' + d + '_class' + c + '_name');
            var judge = document.getElementById('day' + d + '_class' + c + '_judge');
            var round = document.getElementById('day' + d + '_class' + c + '_round');
            var feo = document.getElementById('day' + d + '_class' + c + '_feo');
            
            if (className && className.value.trim()) {
                var config = {
                    day: d,
                    date: dayDate,
                    classNum: c,
                    className: className.value.trim(),
                    judge: judge ? judge.value.trim() : '',
                    round: round ? round.value : '1',
                    feoOffered: feo ? feo.checked : false
                };
                
                trialConfig.push(config);
            }
        }
    }
    
    console.log('Trial config updated:', trialConfig.length, 'classes');
}

function validateTrialConfiguration() {
    updateTrialConfig();
    
    if (trialConfig.length === 0) {
        alert('No trial configuration found. Please add some classes.');
        return false;
    }
    
    var errors = [];
    var trialName = document.getElementById('trialName').value.trim();
    
    if (!trialName) {
        errors.push('Trial name is required');
    }
    
    trialConfig.forEach(function(config, index) {
        if (!config.className) {
            errors.push('Missing class name for Day ' + config.day + ', Class ' + config.classNum);
        }
        if (!config.judge) {
            errors.push('Missing judge for ' + config.className + ' (Day ' + config.day + ')');
        }
        if (!config.date) {
            errors.push('Missing date for Day ' + config.day);
        }
    });
    
    if (errors.length > 0) {
        alert('Validation Errors:\n\n' + errors.join('\n'));
        return false;
    }
    
    alert('✅ Trial configuration is valid!\n\nTrial: ' + trialName + '\nClasses: ' + trialConfig.length + '\nDays: ' + Math.max(...trialConfig.map(c => c.day)));
    return true;
}

function exportTrialConfig() {
    updateTrialConfig();
    
    if (trialConfig.length === 0) {
        alert('No trial configuration to export');
        return;
    }
    
    var trialName = document.getElementById('trialName').value || 'Trial_Config';
    var exportData = {
        name: trialName,
        clubName: document.getElementById('clubName').value,
        location: document.getElementById('trialLocation').value,
        config: trialConfig,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    var exportJson = JSON.stringify(exportData, null, 2);
    var filename = trialName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_config.json';
    
    var blob = new Blob([exportJson], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Trial configuration exported as: ' + filename);
}

function importTrialConfig(input) {
    var file = input.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var importedData = JSON.parse(e.target.result);
            
            if (importedData.config && Array.isArray(importedData.config)) {
                if (confirm('This will replace the current trial configuration. Continue?')) {
                    // Load imported data
                    trialConfig = importedData.config;
                    
                    // Update form fields
                    if (importedData.name) {
                        document.getElementById('trialName').value = importedData.name;
                    }
                    if (importedData.clubName) {
                        document.getElementById('clubName').value = importedData.clubName;
                    }
                    if (importedData.location) {
                        document.getElementById('trialLocation').value = importedData.location;
                    }
                    
                    // Determine number of days
                    var maxDay = Math.max(...trialConfig.map(c => c.day));
                    document.getElementById('trialDays').value = maxDay;
                    
                    // Regenerate form
                    generateDays();
                    
                    // Populate with imported data
                    setTimeout(function() {
                        populateImportedData();
                    }, 100);
                    
                    alert('✅ Trial configuration imported successfully!\n\nTrial: ' + importedData.name + '\nClasses: ' + trialConfig.length);
                }
            } else {
                throw new Error('Invalid trial configuration format');
            }
        } catch (error) {
            alert('Error importing trial configuration: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // Clear the input
    input.value = '';
}

function populateImportedData() {
    trialConfig.forEach(function(config) {
        // Set date
        var dateField = document.getElementById('day' + config.day + '_date');
        if (dateField && config.date) {
            dateField.value = config.date;
        }
        
        // Set class data
        var classNameField = document.getElementById('day' + config.day + '_class' + config.classNum + '_name');
        if (classNameField) {
            classNameField.value = config.className;
        }
        
        var judgeField = document.getElementById('day' + config.day + '_class' + config.classNum + '_judge');
        if (judgeField) {
            judgeField.value = config.judge;
        }
        
        var roundField = document.getElementById('day' + config.day + '_class' + config.classNum + '_round');
        if (roundField) {
            roundField.value = config.round;
        }
        
        var feoField = document.getElementById('day' + config.day + '_class' + config.classNum + '_feo');
        if (feoField) {
            feoField.checked = config.feoOffered;
        }
    });
}

// Quick setup functions for common trial types
function setupNoviceOpenUtilityTrial() {
    document.getElementById('trialDays').value = 2;
    generateDays();
    
    setTimeout(function() {
        // Day 1
        document.getElementById('day1_numClasses').value = 3;
        generateClassesForDay(1);
        
        setTimeout(function() {
            document.getElementById('day1_class1_name').value = 'Novice A';
            document.getElementById('day1_class2_name').value = 'Open A';
            document.getElementById('day1_class3_name').value = 'Utility A';
            
            // Day 2
            document.getElementById('day2_numClasses').value = 3;
            generateClassesForDay(2);
            
            setTimeout(function() {
                document.getElementById('day2_class1_name').value = 'Novice B';
                document.getElementById('day2_class2_name').value = 'Open B';
                document.getElementById('day2_class3_name').value = 'Utility B';
                
                updateTrialConfig();
                alert('✅ Novice/Open/Utility trial template loaded!\nRemember to set dates and judges.');
            }, 100);
        }, 100);
    }, 100);
}

function setupScentWorkTrial() {
    document.getElementById('trialDays').value = 1;
    generateDays();
    
    setTimeout(function() {
        document.getElementById('day1_numClasses').value = 4;
        generateClassesForDay(1);
        
        setTimeout(function() {
            document.getElementById('day1_class1_name').value = 'Scent Work Novice';
            document.getElementById('day1_class2_name').value = 'Scent Work Advanced';
            document.getElementById('day1_class3_name').value = 'Scent Work Excellent';
            document.getElementById('day1_class4_name').value = 'Scent Work Master';
            
            updateTrialConfig();
            alert('✅ Scent Work trial template loaded!\nRemember to set date and judges.');
        }, 100);
    }, 100);
}

// Add template buttons to setup form
function addTrialTemplates() {
    var setupContainer = document.getElementById('setup');
    if (!setupContainer) return;
    
    var existingTemplates = document.getElementById('trialTemplates');
    if (existingTemplates) return; // Already added
    
    var templatesHTML = `
        <div id="trialTemplates" style="background: #e8f4f8; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #2c5aa0;">🚀 Quick Trial Templates</h3>
            <p style="color: #666; margin-bottom: 15px;">Start with a common trial format:</p>
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                <button type="button" onclick="setupScentWorkTrial()" style="background: #17a2b8; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">🐕 Scent Work</button>
                <button type="button" onclick="setupCustomTrial()" style="background: #ffc107; color: black; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">⚙️ Custom Setup</button>
            </div>
        </div>
    `;
    
    // Insert after the main form fields
    var trialDaysGroup = setupContainer.querySelector('input[id="trialDays"]').closest('.form-group');
    if (trialDaysGroup) {
        trialDaysGroup.insertAdjacentHTML('afterend', templatesHTML);
    }
}

function setupCustomTrial() {
    var days = prompt('How many days will your trial run?', '2');
    if (days && !isNaN(days) && days > 0) {
        document.getElementById('trialDays').value = parseInt(days);
        generateDays();
        alert('✅ Custom trial setup started!\nConfigure each day and class as needed.');
    }
}

// Initialize templates when the page loads
function initializeTrialSetup() {
    // Add templates if not already present
    setTimeout(function() {
        addTrialTemplates();
    }, 500);
}

// Auto-save functionality
var autoSaveTimeout;
function autoSaveTrialConfig() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(function() {
        if (currentTrialId && document.getElementById('trialName').value.trim()) {
            updateTrialConfig();
            saveTrialUpdates();
            console.log('Auto-saved trial configuration');
        }
    }, 2000); // Auto-save after 2 seconds of inactivity
}

// Add auto-save listeners to form fields
function addAutoSaveListeners() {
    var formFields = document.querySelectorAll('#setup input, #setup select');
    formFields.forEach(function(field) {
        field.addEventListener('input', autoSaveTrialConfig);
        field.addEventListener('change', autoSaveTrialConfig);
    });
}="setupNoviceOpenUtilityTrial()" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">📚 Novice/Open/Utility</button>
                <button type="button" onclick
