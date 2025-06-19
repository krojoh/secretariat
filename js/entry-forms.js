// ENHANCED ENTRY FORM WITH WAIVER AND AUTO-FILL
// Replace the entry form functions in js/entry-forms.js

// Load and parse registration data from CSV
function loadRegistrationData() {
    console.log('📊 Loading registration data from CSV...');
    
    if (typeof csvData !== 'undefined' && csvData.length > 0) {
        // CSV data already loaded - parse registration info
        window.registrationData = {};
        
        csvData.forEach(function(record) {
            if (record.length >= 3) {
                var regNumber = record[0] ? record[0].toString().trim() : '';
                var callName = record[1] ? record[1].toString().trim() : '';
                var handlerName = record[2] ? record[2].toString().trim() : '';
                
                if (regNumber && callName && handlerName) {
                    window.registrationData[regNumber] = {
                        callName: callName,
                        handlerName: handlerName
                    };
                }
            }
        });
        
        console.log('✅ Loaded registration data for', Object.keys(window.registrationData).length, 'dogs');
        return true;
    } else {
        console.log('❌ CSV data not available - will load manually');
        return false;
    }
}

// Auto-fill dog and handler info based on registration number
function autoFillFromRegistration() {
    var regNumber = document.getElementById('regNumber').value.trim();
    var dogNameField = document.getElementById('dogName');
    var handlerNameField = document.getElementById('handlerName');
    
    if (!regNumber) {
        dogNameField.value = '';
        handlerNameField.value = '';
        dogNameField.style.backgroundColor = '';
        handlerNameField.style.backgroundColor = '';
        return;
    }
    
    // Ensure registration data is loaded
    if (!window.registrationData) {
        loadRegistrationData();
    }
    
    if (window.registrationData && window.registrationData[regNumber]) {
        var data = window.registrationData[regNumber];
        dogNameField.value = data.callName;
        handlerNameField.value = data.handlerName;
        dogNameField.style.backgroundColor = '#d4edda'; // Light green
        handlerNameField.style.backgroundColor = '#d4edda';
        console.log('✅ Auto-filled:', regNumber, '->', data.callName, '/', data.handlerName);
    } else {
        dogNameField.value = '';
        handlerNameField.value = '';
        dogNameField.style.backgroundColor = '#f8d7da'; // Light red
        handlerNameField.style.backgroundColor = '#f8d7da';
        console.log('❌ Registration number not found:', regNumber);
    }
}

// Generate class options grouped by day, class, judge, round
function generateClassOptionsHTML(trialId) {
    console.log('🏆 Generating class options for trial:', trialId);
    
    // Get trial configuration
    var trialConfig = null;
    if (trialId && typeof localStorage !== 'undefined') {
        var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
        trialConfig = publicTrials[trialId];
    }
    
    if (!trialConfig || !trialConfig.config) {
        console.log('❌ No trial configuration found, using sample data');
        return generateSampleClassOptions();
    }
    
    var html = '<div class="class-options-container">';
    html += '<h4 style="color: #2c5aa0; margin-bottom: 20px;">📅 Select Classes to Enter:</h4>';
    
    // Group by day
    var dayGroups = {};
    trialConfig.config.forEach(function(item) {
        if (!dayGroups[item.day]) {
            dayGroups[item.day] = {};
        }
        if (!dayGroups[item.day][item.className]) {
            dayGroups[item.day][item.className] = {};
        }
        if (!dayGroups[item.day][item.className][item.judge]) {
            dayGroups[item.day][item.className][item.judge] = [];
        }
        dayGroups[item.day][item.className][item.judge].push(item);
    });
    
    // Generate HTML for each day
    Object.keys(dayGroups).sort().forEach(function(day) {
        html += `<div class="day-group" style="background: #f8f9fa; padding: 20px; margin-bottom: 20px; border-radius: 10px; border: 2px solid #2c5aa0;">`;
        html += `<h5 style="color: #2c5aa0; margin: 0 0 15px 0;">📅 Day ${day}</h5>`;
        
        // Generate HTML for each class
        Object.keys(dayGroups[day]).sort().forEach(function(className) {
            html += `<div class="class-group" style="background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">`;
            html += `<h6 style="color: #856404; margin: 0 0 10px 0;">🏆 ${className}</h6>`;
            
            // Generate HTML for each judge
            Object.keys(dayGroups[day][className]).forEach(function(judge) {
                html += `<div class="judge-group" style="margin-bottom: 10px;">`;
                html += `<p style="margin: 0 0 8px 0; font-weight: bold; color: #333;">👨‍⚖️ Judge: ${judge}</p>`;
                
                // Generate checkboxes for each round
                dayGroups[day][className][judge].forEach(function(item) {
                    var entryId = `day${item.day}_class${item.classNum}_judge_${item.judge.replace(/\s+/g, '_')}_round${item.round}`;
                    var feoText = item.feoOffered ? ' (FEO)' : '';
                    
                    html += `
                        <label style="display: flex; align-items: center; margin-bottom: 5px; cursor: pointer;">
                            <input type="checkbox" 
                                   name="classEntries" 
                                   value="${entryId}"
                                   data-day="${item.day}"
                                   data-class="${item.className}"
                                   data-judge="${item.judge}"
                                   data-round="${item.round}"
                                   data-feo="${item.feoOffered}"
                                   style="margin-right: 10px; transform: scale(1.2);">
                            <span style="color: #666;">Round ${item.round}${feoText}</span>
                        </label>
                    `;
                });
                
                html += `</div>`;
            });
            
            html += `</div>`;
        });
        
        html += `</div>`;
    });
    
    html += '</div>';
    
    console.log('✅ Generated class options HTML');
    return html;
}

// Generate sample class options if no trial config
function generateSampleClassOptions() {
    var html = '<div class="class-options-container">';
    html += '<h4 style="color: #2c5aa0; margin-bottom: 20px;">📅 Select Classes to Enter:</h4>';
    html += '<p style="color: #666; font-style: italic;">Sample trial configuration - please configure a trial first</p>';
    
    var sampleClasses = ['Patrol 1', 'Detective 2', 'Investigator 3'];
    var sampleJudges = ['Linda Alberda', 'Ginger Alpine'];
    
    sampleClasses.forEach(function(className, classIndex) {
        html += `<div class="class-group" style="background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">`;
        html += `<h6 style="color: #856404; margin: 0 0 10px 0;">🏆 ${className}</h6>`;
        
        sampleJudges.forEach(function(judge) {
            html += `<div class="judge-group" style="margin-bottom: 10px;">`;
            html += `<p style="margin: 0 0 8px 0; font-weight: bold; color: #333;">👨‍⚖️ Judge: ${judge}</p>`;
            
            for (var round = 1; round <= 2; round++) {
                var entryId = `sample_${className.replace(/\s+/g, '_')}_${judge.replace(/\s+/g, '_')}_round${round}`;
                html += `
                    <label style="display: flex; align-items: center; margin-bottom: 5px; cursor: pointer;">
                        <input type="checkbox" 
                               name="classEntries" 
                               value="${entryId}"
                               style="margin-right: 10px; transform: scale(1.2);">
                        <span style="color: #666;">Round ${round}</span>
                    </label>
                `;
            }
            
            html += `</div>`;
        });
        
        html += `</div>`;
    });
    
    html += '</div>';
    return html;
}

// Show enhanced entry form with waiver
function showJuneLeagueEntryForm(trialId) {
    console.log('📝 Showing enhanced entry form for trial:', trialId);
    
    // Load registration data
    loadRegistrationData();
    
    // Create modal overlay
    var overlay = document.createElement('div');
    overlay.id = 'entryFormOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    // Create form container
    var formContainer = document.createElement('div');
    formContainer.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        max-width: 800px;
        width: 95%;
        max-height: 90vh;
        overflow-y: auto;
    `;
    
    // Form HTML with waiver and auto-fill
    formContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="color: #2c5aa0; margin: 0;">📝 Trial Entry Form</h3>
            <button onclick="closeEntryForm()" style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">✕ Close</button>
        </div>
        
        <!-- WAIVER SECTION -->
        <div id="waiverSection" class="form-section">
            <div style="background: #fff3cd; padding: 20px; border-radius: 10px; border: 2px solid #ffc107; margin-bottom: 20px;">
                <h4 style="color: #856404; margin: 0 0 15px 0;">⚠️ Waiver and Terms of Agreement</h4>
                <div style="background: white; padding: 15px; border-radius: 8px; max-height: 200px; overflow-y: auto; font-size: 14px; line-height: 1.6;">
                    <p><strong>LIABILITY WAIVER AND RELEASE:</strong></p>
                    <p>By entering this trial, I acknowledge that dog training and competition activities involve inherent risks including, but not limited to, injury to myself, my dog, or others. I voluntarily assume all risks associated with participation.</p>
                    <p><strong>I agree to:</strong></p>
                    <ul>
                        <li>Hold harmless the trial-giving organization, its officers, directors, members, and volunteers</li>
                        <li>Follow all trial rules and regulations</li>
                        <li>Ensure my dog is properly vaccinated and in good health</li>
                        <li>Maintain control of my dog at all times</li>
                        <li>Accept responsibility for any damage caused by my dog</li>
                    </ul>
                    <p><strong>ENTRY FEES:</strong> Entry fees are non-refundable except in cases of trial cancellation.</p>
                    <p><strong>PHOTOGRAPHY:</strong> I consent to the use of photographs/videos taken during this event for promotional purposes.</p>
                </div>
                
                <label style="display: flex; align-items: center; margin-top: 15px; cursor: pointer;">
                    <input type="checkbox" id="waiverAccepted" required style="margin-right: 10px; transform: scale(1.3);">
                    <span style="font-weight: bold; color: #856404;">I have read, understood, and agree to the above waiver and terms</span>
                </label>
            </div>
        </div>
        
        <!-- ENTRY FORM SECTION -->
        <div id="entryFormSection" style="opacity: 0.5; pointer-events: none;">
            <form id="trialEntryForm" onsubmit="submitTrialEntry(event)">
                
                <!-- Registration and Auto-fill Section -->
                <div style="background: #e8f4f8; padding: 20px; border-radius: 10px; border: 2px solid #2c5aa0; margin-bottom: 20px;">
                    <h4 style="color: #2c5aa0; margin: 0 0 15px 0;">🐕 Dog Registration Information</h4>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Registration Number:</label>
                        <input type="text" id="regNumber" name="regNumber" required 
                               oninput="autoFillFromRegistration()"
                               placeholder="Enter registration number..."
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; box-sizing: border-box; font-size: 16px;">
                        <small style="color: #666; font-style: italic;">This will auto-fill dog name and handler information</small>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                        <div>
                            <label style="display: block; font-weight: bold; margin-bottom: 5px;">Dog Name (Call Name):</label>
                            <input type="text" id="dogName" name="dogName" required readonly
                                   placeholder="Will auto-fill from registration..."
                                   style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; box-sizing: border-box; background: #f8f9fa;">
                        </div>
                        <div>
                            <label style="display: block; font-weight: bold; margin-bottom: 5px;">Handler Name:</label>
                            <input type="text" id="handlerName" name="handlerName" required readonly
                                   placeholder="Will auto-fill from registration..."
                                   style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; box-sizing: border-box; background: #f8f9fa;">
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: bold; margin-bottom: 5px;">Email Address:</label>
                        <input type="email" id="handlerEmail" name="handlerEmail" required 
                               placeholder="your.email@example.com"
                               style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; box-sizing: border-box;">
                    </div>
                </div>
                
                <!-- Class Selection Section -->
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border: 2px solid #28a745; margin-bottom: 20px;">
                    <div id="classOptionsContainer">
                        ${generateClassOptionsHTML(trialId)}
                    </div>
                </div>
                
                <!-- Additional Information -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: bold; margin-bottom: 5px;">Special Requests/Notes:</label>
                    <textarea id="specialRequests" name="specialRequests" rows="3"
                              placeholder="Any special requests, dietary needs, accessibility requirements, etc."
                              style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; box-sizing: border-box; resize: vertical;"></textarea>
                </div>
                
                <!-- Submit Section -->
                <div style="text-align: center; padding-top: 20px; border-top: 2px solid #dee2e6;">
                    <button type="submit" id="submitEntryBtn" disabled
                            style="background: #28a745; color: white; padding: 15px 40px; border: none; border-radius: 10px; font-size: 18px; font-weight: bold; cursor: pointer; margin-right: 15px; opacity: 0.5;">
                        🎯 Submit Entry
                    </button>
                    <button type="button" onclick="closeEntryForm()"
                            style="background: #6c757d; color: white; padding: 15px 30px; border: none; border-radius: 10px; font-size: 16px; cursor: pointer;">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;
    
    overlay.appendChild(formContainer);
    document.body.appendChild(overlay);
    
    // Add waiver checkbox handler
    document.getElementById('waiverAccepted').addEventListener('change', function() {
        var entrySection = document.getElementById('entryFormSection');
        var submitBtn = document.getElementById('submitEntryBtn');
        
        if (this.checked) {
            entrySection.style.opacity = '1';
            entrySection.style.pointerEvents = 'auto';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        } else {
            entrySection.style.opacity = '0.5';
            entrySection.style.pointerEvents = 'none';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.5';
            submitBtn.style.cursor = 'not-allowed';
        }
    });
    
    console.log('✅ Enhanced entry form displayed');
}

// Enhanced submit function
function submitTrialEntry(event) {
    event.preventDefault();
    
    console.log('📝 Submitting enhanced trial entry...');
    
    // Get selected classes
    var selectedClasses = [];
    document.querySelectorAll('input[name="classEntries"]:checked').forEach(function(checkbox) {
        selectedClasses.push({
            entryId: checkbox.value,
            day: checkbox.dataset.day,
            className: checkbox.dataset.class,
            judge: checkbox.dataset.judge,
            round: checkbox.dataset.round,
            feo: checkbox.dataset.feo === 'true'
        });
    });
    
    if (selectedClasses.length === 0) {
        alert('Please select at least one class to enter.');
        return;
    }
    
    // Get form data
    var formData = {
        regNumber: document.getElementById('regNumber').value,
        dogName: document.getElementById('dogName').value,
        handlerName: document.getElementById('handlerName').value,
        handlerEmail: document.getElementById('handlerEmail').value,
        selectedClasses: selectedClasses,
        specialRequests: document.getElementById('specialRequests').value,
        waiverAccepted: document.getElementById('waiverAccepted').checked,
        submittedAt: new Date().toISOString(),
        trialId: currentTrialId || trialId || 'default'
    };
    
    // Validate required fields
    if (!formData.regNumber || !formData.dogName || !formData.handlerName || !formData.handlerEmail) {
        alert('Please fill in all required registration fields.');
        return;
    }
    
    if (!formData.waiverAccepted) {
        alert('Please accept the waiver to continue.');
        return;
    }
    
    // Save entry to localStorage
    var entries = JSON.parse(localStorage.getItem('trialEntries') || '[]');
    entries.push(formData);
    localStorage.setItem('trialEntries', JSON.stringify(entries));
    
    // Show success message
    var classCount = selectedClasses.length;
    var successMsg = '✅ Entry submitted successfully!\n\n' +
                    'Registration: ' + formData.regNumber + '\n' +
                    'Dog: ' + formData.dogName + '\n' +
                    'Handler: ' + formData.handlerName + '\n' +
                    'Classes entered: ' + classCount + '\n\n' +
                    'You will receive a confirmation email shortly.';
    
    alert(successMsg);
    
    // Close form
    closeEntryForm();
    
    console.log('✅ Enhanced trial entry submitted:', formData);
}

// Initialize enhanced entry system
function initializeEnhancedEntrySystem() {
    // Make functions globally available
    window.autoFillFromRegistration = autoFillFromRegistration;
    window.loadRegistrationData = loadRegistrationData;
    window.generateClassOptionsHTML = generateClassOptionsHTML;
    
    // Override the original function
    window.showJuneLeagueEntryForm = showJuneLeagueEntryForm;
    
    console.log('✅ Enhanced entry system initialized');
}

// Auto-initialize
initializeEnhancedEntrySystem();

console.log('✅ Enhanced entry form with waiver and auto-fill loaded!');
