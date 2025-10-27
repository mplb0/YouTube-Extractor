# YouTube Audio Extractor

A beautiful, minimalist web application to download YouTube videos or extract audio, built with shadcn-inspired design.

**This is used for study and educational purpose only. Do not use on Copyrighted Content. I'm not responsible to what you use this for**

## Features

- Clean, minimalist UI with shadcn design system
- Paste any YouTube URL and instantly preview the video
- Download full video in best quality
- Extract audio to MP3 format
- Real-time progress indicators
- Automatic file cleanup

## Prerequisites

You need to have the following installed on your system:

1. **Node.js** (v14 or higher)
   - Download from [nodejs.org](https://nodejs.org/)

2. **yt-dlp** - YouTube video downloader
   ```bash
   # macOS
   brew install yt-dlp

   # Or using pip
   pip install yt-dlp

   # Linux
   sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
   sudo chmod a+rx /usr/local/bin/yt-dlp
   ```

3. **ffmpeg** - Required for audio extraction
   ```bash
   # macOS
   brew install ffmpeg

   # Linux (Ubuntu/Debian)
   sudo apt update && sudo apt install ffmpeg

   # Linux (Fedora)
   sudo dnf install ffmpeg
   ```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. Paste a YouTube URL into the input field
2. The video will automatically embed and display
3. Click "Download Video" to download the full video
4. Click "Extract Audio" to download just the audio as MP3

## How It Works

- **Frontend**: Pure HTML, CSS, and JavaScript with shadcn-inspired styling
- **Backend**: Express.js server that interfaces with yt-dlp and ffmpeg
- **Video Download**: Uses yt-dlp to fetch the best quality video
- **Audio Extraction**: Uses yt-dlp with ffmpeg to extract and convert audio to MP3

## Project Structure

```
yt-audio-extractor/
├── index.html      # Frontend UI
├── server.js       # Express backend server
├── package.json    # Node.js dependencies
├── README.md       # This file
└── temp/          # Temporary download directory (auto-created)
```

## Notes

- Downloaded files are temporarily stored in the `temp/` directory
- Files are automatically cleaned up after download
- Old temporary files are removed every 10 minutes
- The server will check for yt-dlp and ffmpeg on startup

## Troubleshooting

**"yt-dlp is not installed" error:**
- Make sure yt-dlp is installed and available in your PATH
- Run `yt-dlp --version` to verify installation

**"ffmpeg is not installed" error:**
- Make sure ffmpeg is installed and available in your PATH
- Run `ffmpeg -version` to verify installation

**Download fails:**
- Check your internet connection
- Some videos may be age-restricted or region-locked
- Make sure you're using a valid YouTube URL

## License

MIT
