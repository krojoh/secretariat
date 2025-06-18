// Utility Functions for Dog Trial Management System

// Enhanced search and access functions
function searchTrials(searchTerm) {
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var results = [];
    
    Object.keys(publicTrials).forEach(function(trialId) {
        var trial = publicTrials[trialId];
        if (trial.name && trial.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push({
                id: trialId,
                trial: trial
            });
        }
    });
    
    return results;
}

// Quick access menu
function showQuickAccessMenu() {
    var modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.8); z-index: 10000; 
        display: flex; justify-content: center; align-items: center; padding: 20px;
    `;
    
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var trialOptions = '';
    
    Object.keys(publicTrials).forEach(function(trialId) {
        var trial = publicTrials[trialId];
        var entryCount = trial.results ? trial.results.length : 0;
        trialOptions += `
            <div style="background: #f8f9fa; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; cursor: pointer;" onclick="quickSelectTrial('${trialId}')">
                <h4 style="margin: 0; color: #2c5aa0;">${trial.name || 'Unnamed Trial'}</h4>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                    ${entryCount} entries | ${trial.config ? trial.config.length : 0} classes | Owner: ${trial.owner}
                </p>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;">
            <div style="padding: 20px; border-bottom: 2px solid #eee; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 15px 15px 0 0;">
                <h2 style="margin: 0;">🚀 Quick Access - Select Trial</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Choose a trial to add entries or manage</p>
            </div>
            <div style="padding: 30px;">
                ${trialOptions || '<p style="text-align: center; color: #666;">No trials found.</p>'}
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function quickSelectTrial(trialId) {
    // Close modal
    var modal = document.querySelector('div[style*="position: fixed"]');
    if (modal) modal.remove();
    
    // Set trial and show entry form
    currentTrialId = trialId;
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var trial = publicTrials[trialId];
    trialConfig = trial.config || [];
    entryResults = trial.results || [];
    
    // Show entry form
    showJuneLeagueEntryForm();
}

// Add quick access button to user bar
function addQuickAccessButton() {
    var userBar = document.querySelector('.user-bar');
    if (userBar && !document.getElementById('quickAccessBtn')) {
        var quickAccessBtn = document.createElement('button');
        quickAccessBtn.id = 'quickAccessBtn';
        quickAccessBtn.textContent = '⚡ Quick Entry';
        quickAccessBtn.style.cssText = `
            background: #28a745; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 5px; 
            cursor: pointer; 
            font-weight: bold;
            margin-left: 10px;
        `;
        quickAccessBtn.onclick = showQuickAccessMenu;
        
        var logoutBtn = userBar.querySelector('.logout-btn');
        if (logoutBtn) {
            userBar.insertBefore(quickAccessBtn, logoutBtn);
        }
    }
}

// Enhanced trial statistics
function getTrialStatistics() {
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var allUsers = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    
    var stats = {
        totalTrials: 0,
        totalEntries: 0,
        totalUsers: Object.keys(allUsers).length,
        activeTrials: 0,
        trialsByMonth: {},
        entriesByTrial: {}
    };
    
    Object.keys(publicTrials).forEach(function(trialId) {
        var trial = publicTrials[trialId];
        stats.totalTrials++;
        
        if (trial.results && trial.results.length > 0) {
            stats.activeTrials++;
            stats.totalEntries += trial.results.length;
            stats.entriesByTrial[trial.name || 'Unnamed'] = trial.results.length;
        }
        
        if (trial.created) {
            var month = new Date(trial.created).toISOString().substring(0, 7); // YYYY-MM
            stats.trialsByMonth[month] = (stats.trialsByMonth[month] || 0) + 1;
        }
    });
    
    return stats;
}

// Data export functions
function exportAllData() {
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    var allUsers = JSON.parse(localStorage.getItem('trialUsers') || '{}');
    
    var exportData = {
        exportDate: new Date().toISOString(),
        trials: publicTrials,
        users: allUsers,
        statistics: getTrialStatistics()
    };
    
    var blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'dog_trial_system_backup_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    
    alert('✅ System backup exported successfully!');
}

// Initialize utility functions
function initializeUtilities() {
    addQuickAccessButton();
    
    // Add export button if user is admin
    if (currentUser && currentUser.username === 'admin') {
        addExportButton();
    }
}

function addExportButton() {
    var userBar = document.querySelector('.user-bar');
    if (userBar && !document.getElementById('exportBtn')) {
        var exportBtn = document.createElement('button');
        exportBtn.id = 'exportBtn';
        exportBtn.textContent = '💾 Export All';
        exportBtn.style.cssText = `
            background: #6c757d; 
            color: white; 
            border: none; 
            padding: 8px 16px; 
            border-radius: 5px; 
            cursor: pointer; 
            font-weight: bold;
            margin-left: 10px;
            font-size: 12px;
        `;
        exportBtn.onclick = exportAllData;
        
        var logoutBtn = userBar.querySelector('.logout-btn');
        if (logoutBtn) {
            userBar.insertBefore(exportBtn, logoutBtn);
        }
    }
}

// Console helpers for debugging
function debugTrials() {
    var publicTrials = JSON.parse(localStorage.getItem('publicTrials') || '{}');
    console.log('=== TRIAL DEBUG INFO ===');
    console.log('Total trials:', Object.keys(publicTrials).length);
    
    Object.keys(publicTrials).forEach(function(trialId) {
        var trial = publicTrials[trialId];
        console.log('Trial:', trial.name || 'Unnamed');
        console.log('  ID:', trialId);
        console.log('  Owner:', trial.owner);
        console.log('  Entries:', trial.results ? trial.results.length : 0);
        console.log('  Classes:', trial.config ? trial.config.length : 0);
        console.log('  ---');
    });
}

// Quick console commands
window.findJuneLeague = function() { return findTrialByName('june league'); };
window.quickJuneLeague = function() { quickAccessJuneLeague(); };
window.debugTrials = debugTrials;
window.exportAll = exportAllData;
