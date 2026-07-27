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
let totalDurationInSeconds = 0;

const audioPlayer = document.getElementById('audioPlayer');
const lrcOutput = document.getElementById('lrcOutput');

document.getElementById('audioFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        audioPlayer.src = URL.createObjectURL(file);
        document.getElementById('fileNameDisplay').innerText = file.name;
    }
});

audioPlayer.addEventListener('loadedmetadata', function() {
    const totalSeconds = audioPlayer.duration;
    totalDurationInSeconds = Math.round(totalSeconds);
    
    const durationDisplay = document.getElementById('durationDisplay');
    if (durationDisplay) {
        durationDisplay.innerText = `⏱️ Duration: ${totalDurationInSeconds} Seconds (${totalSeconds.toFixed(2)}s exact)`;
    }
});

function formatTime(seconds) {
    let mins = Math.floor(seconds / 60);
    let secs = (seconds % 60).toFixed(2);
    return `[${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}]`;
}

function cleanStatusText(text) {
    return text.replace(/\n\nStart|\n\n🎉 ALL LINES SYNCED PERFECTLY!/g, '').trim();
}

function updateLrcDisplay() {
    let baseText = syncedLrcLines.join('\n');
    let outputText = baseText;
    
    if (lines.length > 0 && currentLineIndex < lines.length) {
        outputText += `\n\nStart`;
    } else if (lines.length > 0 && currentLineIndex >= lines.length) {
        outputText += `\n\n🎉 ALL LINES SYNCED PERFECTLY!`;
        document.getElementById('downloadBtn').style.display = 'block';
    }

    lrcOutput.value = outputText;
    lrcOutput.scrollTop = lrcOutput.scrollHeight;

    if (syncedLrcLines.length > 3) {
        document.getElementById('undoBtn').style.display = 'block';
    } else {
        document.getElementById('undoBtn').style.display = 'none';
    }
}

document.getElementById('startSyncBtn').addEventListener('click', function() {
    const rawText = document.getElementById('rawLyrics').value.trim();
    if (!rawText) { 
        alert("Pehle Lyrics Text daalo!"); 
        return; 
    }

    document.getElementById('rawLyrics').blur();

    lines = rawText.split('\n').map(l => l.trim()).filter(l => l !== '');
    currentLineIndex = 0;

    syncedLrcLines = [
        "[ar: Custom Studio]", 
        "[ti: Precise Synced LRC]",
        `[length: ${totalDurationInSeconds}s]`
    ];
    lineStartTimes = [];
    
    document.getElementById('downloadBtn').style.display = 'none';
    
    updateLrcDisplay();
    
    audioPlayer.currentTime = 0;
    audioPlayer.play();
});

function undoLastSync() {

    if (syncedLrcLines.length > 3) {
        let removedLine = syncedLrcLines.pop();
        

        if (!removedLine.includes('.....') && currentLineIndex > 0) {
            currentLineIndex--;
        }

        let lastRecordedTime = lineStartTimes.pop() || audioPlayer.currentTime;
        let rewindTime = Math.max(0, lastRecordedTime - 2.5);
        
        audioPlayer.currentTime = rewindTime;
        if (audioPlayer.paused) { audioPlayer.play(); }

        document.getElementById('downloadBtn').style.display = 'none';
        updateLrcDisplay();
    }
}

document.getElementById('undoBtn').addEventListener('click', undoLastSync);


function insertDotMarker() {
    let currentTime = audioPlayer.currentTime;
    lineStartTimes.push(currentTime);
    syncedLrcLines.push(`${formatTime(currentTime)} .....`);
    updateLrcDisplay();
}


document.addEventListener('keydown', function(e) {

    if (document.activeElement.id === 'rawLyrics') {
        return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
    }


    if (e.key === 'ArrowDown') {
        if (lines.length > 0 && currentLineIndex < lines.length) {
            let currentTime = audioPlayer.currentTime;
            lineStartTimes.push(currentTime);
            syncedLrcLines.push(`${formatTime(currentTime)} ${lines[currentLineIndex]}`);
            currentLineIndex++;
            updateLrcDisplay();
        }
    } 
    

    if (e.key === 'ArrowUp') {
        undoLastSync();
    }


    if (e.key === 'ArrowLeft') {
        insertDotMarker();
    }
});


lrcOutput.addEventListener('input', function() {
    let cleanedContent = cleanStatusText(this.value);
    syncedLrcLines = cleanedContent.split('\n');
});


document.getElementById('downloadBtn').addEventListener('click', function() {
    const finalLrcContent = cleanStatusText(lrcOutput.value);
    const blob = new Blob([finalLrcContent], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "synced_lyrics.lrc";
    a.click();
});
