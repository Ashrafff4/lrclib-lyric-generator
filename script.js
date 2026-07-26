// Theme Switcher Logic
const themeToggleBtn = document.getElementById('themeToggleBtn');
const savedTheme = localStorage.getItem('theme');

function updateThemeBtnUI(isLight) {
    const iconSpan = themeToggleBtn.querySelector('.btn-icon');
    const textSpan = themeToggleBtn.querySelector('.btn-text');
    
    if (isLight) {
        iconSpan.textContent = '🌙';
        textSpan.textContent = 'Dark Theme';
    } else {
        iconSpan.textContent = '☀️';
        textSpan.textContent = 'White Theme';
    }
}

if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    updateThemeBtnUI(true);
}

themeToggleBtn.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        updateThemeBtnUI(false);
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        updateThemeBtnUI(true);
    }
});

let lines = [];
let currentLineIndex = 0;
let syncedLrcLines = [];
let lineStartTimes = []; 

// File name update
document.getElementById('audioFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('audioPlayer').src = URL.createObjectURL(file);
        document.getElementById('fileNameDisplay').innerText = file.name;
    }
});

// Format Seconds to [mm:ss.xx]
function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = (seconds % 60).toFixed(2);
    return `[${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}]`;
}

// UI Update Function (FIXED)
function updateLrcDisplay() {
    // SIRF unhi lines ko jodna jo timestamp ho chuki hain
    let outputText = syncedLrcLines.join('\n');
    
    if (lines.length > 0 && currentLineIndex < lines.length) {
        outputText += `\n\nStart`;
    } else if (lines.length > 0 && currentLineIndex >= lines.length) {
        outputText += `\n\n🎉 ALL LINES SYNCED PERFECTLY!`;
        document.getElementById('downloadBtn').style.display = 'block';
    }

    const lrcOutput = document.getElementById('lrcOutput');
    lrcOutput.value = outputText;

    // Auto-scroll to bottom
    lrcOutput.scrollTop = lrcOutput.scrollHeight;

    if (currentLineIndex > 0) {
        document.getElementById('undoBtn').style.display = 'block';
    } else {
        document.getElementById('undoBtn').style.display = 'none';
    }
}

// Start Live Sync Mode (FIXED)
document.getElementById('startSyncBtn').addEventListener('click', function() {
    const rawText = document.getElementById('rawLyrics').value.trim();
    if (!rawText) { 
        alert("Pehle Lyrics Text daalo!"); 
        return; 
    }

    // Unfocus textarea so arrow keys don't scroll textarea
    document.getElementById('rawLyrics').blur();

    // Raw text ko lines me divide karna
    lines = rawText.split('\n').map(l => l.trim()).filter(l => l !== '');
    currentLineIndex = 0;
    
    // Header Info
    syncedLrcLines = ["[ar: Custom Studio]", "[ti: Precise Synced LRC]"];
    lineStartTimes = [];
    
    document.getElementById('downloadBtn').style.display = 'none';
    
    updateLrcDisplay();
    
    const player = document.getElementById('audioPlayer');
    player.currentTime = 0;
    player.play();
});

// UNDO Functionality
function undoLastSync() {
    if (currentLineIndex > 0) {
        currentLineIndex--;
        syncedLrcLines.pop();
        
        const player = document.getElementById('audioPlayer');
        let lastRecordedTime = lineStartTimes.pop() || player.currentTime;
        let rewindTime = Math.max(0, lastRecordedTime - 2.5);
        
        player.currentTime = rewindTime;
        if (player.paused) { player.play(); }

        document.getElementById('downloadBtn').style.display = 'none';
        updateLrcDisplay();
    }
}

document.getElementById('undoBtn').addEventListener('click', undoLastSync);

// Keyboard Listener
document.addEventListener('keydown', function(e) {
    if (document.activeElement.tagName === 'TEXTAREA' && document.activeElement.id === 'rawLyrics') {
        return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
    }

    if (e.key === 'ArrowDown') {
        const player = document.getElementById('audioPlayer');
        if (lines.length > 0 && currentLineIndex < lines.length) {
            let currentTime = player.currentTime;
            lineStartTimes.push(currentTime);
            // Dynamic timestamp tag add karna
            syncedLrcLines.push(`${formatTime(currentTime)} ${lines[currentLineIndex]}`);
            currentLineIndex++;
            updateLrcDisplay();
        }
    } 
    
    if (e.key === 'ArrowUp') {
        undoLastSync();
    }
});

// Download .lrc File
document.getElementById('downloadBtn').addEventListener('click', function() {
    const blob = new Blob([syncedLrcLines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "synced_lyrics.lrc";
    a.click();
});