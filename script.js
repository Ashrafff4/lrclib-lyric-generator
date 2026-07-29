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

// Metadata Store
let fetchedMetadata = {
    title: "Precise Synced LRC",
    artist: "Custom Studio",
    album: "Single"
};

const audioPlayer = document.getElementById('audioPlayer');
const lrcOutput = document.getElementById('lrcOutput');

// Clean filename to search terms
function cleanSearchQuery(filename) {
    return filename
        .replace(/\.[^/.]+$/, "")                       // Remove extension (.mp3)
        .replace(/\[.*?\]|\(.*?\)/g, "")               // Remove brackets content
        .replace(/^[0-9\s\-_]+/, "")                   // Remove track numbers
        .replace(/official|video|lyric|audio|hd|4k/gi, "") // Remove common keywords
        .trim();
}

// MusicBrainz Open API to fetch accurate Album & Song Details
async function fetchMusicBrainzDetails(searchTerm) {
    try {
        const url = `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(searchTerm)}&fmt=json&limit=1`;
        const response = await fetch(url);
        if (!response.ok) return null;
        
        const data = await response.json();
        if (data.recordings && data.recordings.length > 0) {
            const rec = data.recordings[0];
            
            const title = rec.title || searchTerm;
            const artist = rec['artist-credit'] ? rec['artist-credit'][0].name : "Unknown Artist";
            const album = (rec.releases && rec.releases.length > 0) ? rec.releases[0].title : "Single";

            return { title, artist, album };
        }
    } catch (err) {
        console.error("MusicBrainz API Error:", err);
    }
    return null;
}

// Process and display metadata
async function processSongMetadata(file) {
    const aiMetaDataCard = document.getElementById('aiMetaDataCard');
    const metaTitle = document.getElementById('metaTitle');
    const metaArtist = document.getElementById('metaArtist');
    const metaAlbum = document.getElementById('metaAlbum');

    if (metaTitle) metaTitle.innerText = "Searching AI API...";
    if (metaArtist) metaArtist.innerText = "Searching...";
    if (metaAlbum) metaAlbum.innerText = "Searching...";
    if (aiMetaDataCard) aiMetaDataCard.style.display = 'block';

    let localTitle = "", localArtist = "", localAlbum = "";
    
    if (window.jsmediatags) {
        await new Promise((resolve) => {
            jsmediatags.read(file, {
                onSuccess: function(tag) {
                    localTitle = tag.tags.title || "";
                    localArtist = tag.tags.artist || "";
                    localAlbum = tag.tags.album || "";
                    resolve();
                },
                onError: function() {
                    resolve();
                }
            });
        });
    }

    const cleanedQuery = cleanSearchQuery(file.name);
    const searchQuery = (localTitle && localArtist) ? `${localTitle} ${localArtist}` : cleanedQuery;

    const apiResult = await fetchMusicBrainzDetails(searchQuery);

    fetchedMetadata.title = localTitle || (apiResult ? apiResult.title : cleanedQuery);
    fetchedMetadata.artist = localArtist || (apiResult ? apiResult.artist : "Unknown Artist");
    fetchedMetadata.album = localAlbum || (apiResult ? apiResult.album : "Single");

    if (metaTitle) metaTitle.innerText = fetchedMetadata.title;
    if (metaArtist) metaArtist.innerText = fetchedMetadata.artist;
    if (metaAlbum) metaAlbum.innerText = fetchedMetadata.album;
}

// Audio File Selection Handler
document.getElementById('audioFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        audioPlayer.src = URL.createObjectURL(file);
        document.getElementById('fileNameDisplay').innerText = file.name;
        processSongMetadata(file);
    }
});

// Manual "AI Info Fetch" Button Handler
const aiFetchBtn = document.getElementById('aiFetchBtn');
if (aiFetchBtn) {
    aiFetchBtn.addEventListener('click', function() {
        const audioFileInput = document.getElementById('audioFile');
        if (!audioFileInput.files || audioFileInput.files.length === 0) {
            alert("Pehle ek Audio File select karein!");
            return;
        }
        processSongMetadata(audioFileInput.files[0]);
    });
}

// Audio metadata duration logic
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

// Only synced lyrics lines will be displayed (no extra text)
function updateLrcDisplay() {
    lrcOutput.value = syncedLrcLines.join('\n');
    lrcOutput.scrollTop = lrcOutput.scrollHeight;

    if (lines.length > 0 && currentLineIndex >= lines.length) {
        document.getElementById('downloadBtn').style.display = 'block';
    }
}

// Sync Start Event
document.getElementById('startSyncBtn').addEventListener('click', function() {
    const rawText = document.getElementById('rawLyrics').value.trim();
    if (!rawText) { 
        alert("Pehle Lyrics Text daalo!"); 
        return; 
    }

    document.getElementById('rawLyrics').blur();

    lines = rawText.split('\n').map(l => l.trim()).filter(l => l !== '');
    currentLineIndex = 0;

    // Direct plain list (No Header tags added here)
    syncedLrcLines = [];
    lineStartTimes = [];
    
    document.getElementById('downloadBtn').style.display = 'none';
    updateLrcDisplay();
    
    audioPlayer.currentTime = 0;
    audioPlayer.play();
});

// Undo Functionality
function undoLastSync() {
    if (syncedLrcLines.length > 0) {
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

function insertDotMarker() {
    let currentTime = audioPlayer.currentTime;
    lineStartTimes.push(currentTime);
    syncedLrcLines.push(`${formatTime(currentTime)} .....`);
    updateLrcDisplay();
}

// Global Shortcuts
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
    syncedLrcLines = this.value.split('\n');
});

// Download plain LRC file
document.getElementById('downloadBtn').addEventListener('click', function() {
    const finalLrcContent = lrcOutput.value.trim();
    const blob = new Blob([finalLrcContent], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${fetchedMetadata.title.toLowerCase().replace(/\s+/g, '_')}_synced.lrc`;
    a.click();
});
