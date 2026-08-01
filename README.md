# 🎵 Lrclib Lyric Generator (Studio LRC Precision Generator)

[![MusicBrainz API](https://img.shields.io/badge/API-MusicBrainz-orange.svg)](https://musicbrainz.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A modern, fast, and sleek browser-based web application built to generate synchronized `.lrc` (lyric) files in real time. Featuring a glassmorphic UI, local ID3 audio tag reading, MusicBrainz API lookup, line-by-line live timestamping, dot-marker insertions, and instant audio rewind controls.

<p align="center">
  <img src="https://github.com/user-attachments/assets/801352a1-b75c-4d6d-a536-392f3d3b3379" alt="Lrclib Lyric Generator Screenshot" width="100%" />
</p>

---

## ✨ Features

* **AI & Metadata Auto-Fetch:** Reads local ID3 metadata (`Title`, `Artist`, `Album`) using `jsmediatags` and automatically enriches it with track details via the **MusicBrainz API**.
* **Real-Time Live Timestamp Sync:** Tag raw lyrics line-by-line in real time as the song plays with a single keypress.
* **Instant Undo & Smart Rewind:** Undo the last tagged line with <kbd>↑</kbd> (UP Arrow) and automatically rewind the audio by **2.5 seconds** for instant timing corrections.
* **Inline Dot-Marker Insertion (`.....`):** Press <kbd>←</kbd> (LEFT Arrow) to insert timestamps with trailing `.....` markers for instrumental solos or vocal pauses.
* **Glassmorphic Dual Themes:** Seamlessly switch between a dark glowing glassmorphic theme and a clean White Theme with persistent `localStorage` memory.
* **Exact Audio Analytics:** Displays total audio duration down to exact decimal seconds upon uploading local audio files (`.mp3`, `.wav`, `.ogg`, etc.).
* **One-Click `.lrc` Export:** Download clean, properly formatted `.lrc` files ready to be uploaded to LRCLIB or used in custom media players.
* **100% Client-Side Privacy:** All audio processing and timestamp generation happen directly in your browser—no files are uploaded to any external server.

---

## 🛠️ Tech Stack & APIs

* **Frontend:** HTML5, Modern CSS3 (Glassmorphism, CSS Custom Variables, Responsive Grid), JavaScript (ES6+)
* **Typography:** [Inter](https://fonts.google.com/specimen/Inter) & [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
* **Audio Tag Reader:** [jsmediatags](https://github.com/aadsm/jsmediatags) (v3.9.5 via CDN)
* **Metadata API:** [MusicBrainz Web Service API](https://musicbrainz.org/doc/Development/XML_Web_Service/Version_2)
* **Audio Engine:** HTML5 Web Audio API

---

## ⌨️ Keyboard Shortcuts

| Key | Context / Scope | Action |
| :--- | :--- | :--- |
| <kbd>↓</kbd> **DOWN ARROW** | Global (during sync) | Tag timestamp for the current active lyric line |
| <kbd>↑</kbd> **UP ARROW** | Global (during sync) | Undo last tagged line and rewind audio by **2.5 seconds** |
| <kbd>←</kbd> **LEFT ARROW** | Global (during sync) | Insert current timestamp + `.....` pause marker |

> 💡 **Note:** Shortcuts are automatically ignored when typing directly inside the **Original Lyrics Text** box to avoid unwanted accidental triggers.

---

## 🚀 Workflow Guide

1. **Upload Audio File:** Click **📁 Select Song / Audio File** to load an `.mp3` or `.wav` track.
2. **Fetch Track Info:** Click **✨ AI Info Fetch** to pull ID3 metadata and fetch accurate track info from MusicBrainz.
3. **Paste Lyrics:** Paste your un-synced text line-by-line into the **Original Lyrics Text** textarea.
4. **Start Live Sync:** Click **Start Live Sync Mode** to start playback.
5. **Tag Timestamps:**
   * Press <kbd>↓</kbd> as each line is vocalized.
   * Press <kbd>←</kbd> during instrumental gaps to mark a pause (`[mm:ss.xx] .....`).
   * Press <kbd>↑</kbd> to undo a mistake and rewind the song by 2.5 seconds.
6. **Export `.lrc`:** Click **Download .lrc File** to save your formatted lyric file locally.

---

## 📦 Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/ashrafff4/lrclib-lyric-generator.git](https://github.com/ashrafff4/lrclib-lyric-generator.git) 
