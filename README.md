# YouTube Audio Extractor

A beautiful, minimalist web application to download YouTube videos or extract audio, built with shadcn-inspired design.

**This is used for study and educational purpose only. Do not use on Copyrighted Content. I'm not responsible for what you use this for**

## Features

- Clean, minimalist UI with shadcn design system
- Dark mode toggle
- Paste any YouTube URL and instantly preview the video
- Support for YouTube Shorts
- Download full video in best quality
- **Audio waveform visualization** with WaveSurfer.js
- **Select specific audio segments** by dragging on the waveform
- **Preview audio selections** with play/pause controls
- **Download full audio** or **only selected segments**
- Extract audio to MP3 format
- Real-time progress indicators
- Automatic file cleanup
- Docker support for easy deployment

## Prerequisites

### For Docker Installation (Recommended)

1. **Docker** and **Docker Compose**
   - **macOS**: Install [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
   - **Windows**: Install [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
   - **Linux (Ubuntu/Debian)**:
     ```bash
     # Install Docker
     curl -fsSL https://get.docker.com -o get-docker.sh
     sudo sh get-docker.sh

     # Add your user to docker group (optional)
     sudo usermod -aG docker $USER

     # Start Docker
     sudo systemctl start docker
     sudo systemctl enable docker
     ```

### For Local Installation

You need to have the following installed on your system:

1. **Node.js** (v18 or higher)
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

### Option 1: Docker (Recommended)

Docker provides a consistent environment with all dependencies pre-installed.

#### Quick Start

```bash
# Clone the repository (or download files)
git clone <your-repo-url>
cd yt-audio-extractor

# Build and start the container
docker compose up -d

# The application will be available at http://localhost:3000
```

#### Detailed Docker Commands

**Build the Docker image:**
```bash
docker compose build
```

**Start the container (detached mode):**
```bash
docker compose up -d
```

**Start the container (with logs):**
```bash
docker compose up
```

**View logs:**
```bash
# Follow logs in real-time
docker compose logs -f

# View last 100 lines
docker compose logs --tail=100
```

**Check container status:**
```bash
docker compose ps
```

**Stop the container:**
```bash
docker compose down
```

**Restart the container:**
```bash
docker compose restart
```

**Rebuild and restart (after code changes):**
```bash
docker compose up -d --build
```

**Access container shell:**
```bash
docker compose exec yt-extractor sh
```

**View resource usage:**
```bash
docker stats
```

#### Using Docker Commands Directly

If you prefer using `docker` instead of `docker compose`:

```bash
# Build image
docker build -t yt-audio-extractor .

# Run container
docker run -d -p 3000:3000 --name yt-extractor yt-audio-extractor

# View logs
docker logs -f yt-extractor

# Stop container
docker stop yt-extractor

# Remove container
docker rm yt-extractor
```

#### Docker Troubleshooting

**Container won't start:**
```bash
# Check logs
docker compose logs

# Check if port 3000 is already in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

**Rebuild from scratch:**
```bash
# Remove everything and rebuild
docker compose down
docker compose build --no-cache
docker compose up -d
```

**Clean up Docker resources:**
```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove all unused resources
docker system prune -a
```

### Option 2: Local Installation

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

### Basic Usage

1. Paste a YouTube URL into the input field
2. The video will automatically embed and display
3. Click "Download Video" to download the full video
4. Toggle dark mode with the button in the top-right corner

### Audio Extraction with Waveform

1. Click "Extract Audio" - The app will extract the audio and display an interactive waveform
2. **Select a region**: Click and drag on the waveform to highlight a specific portion
3. **Preview your selection**: Click the "Preview" button to listen to the selected portion
   - Click "Pause" to pause playback
   - Playback automatically stops at the end of your selection
4. **Download options**:
   - Click "Full Audio" to download the complete audio as MP3
   - Click "Selection" to download only your selected portion as MP3
5. The waveform shows:
   - Start time, end time, and duration of your selection
   - Visual representation of the audio for easy navigation

### Supported URL Formats

- Regular videos: `https://www.youtube.com/watch?v=VIDEO_ID`
- Short URLs: `https://youtu.be/VIDEO_ID`
- Shorts: `https://www.youtube.com/shorts/VIDEO_ID`
- Embed URLs: `https://www.youtube.com/embed/VIDEO_ID`
- Direct video IDs: `VIDEO_ID`

## How It Works

- **Frontend**: Pure HTML, CSS, and JavaScript with shadcn-inspired styling
- **Waveform Visualization**: WaveSurfer.js for interactive audio waveform display
- **Backend**: Express.js server that interfaces with yt-dlp and ffmpeg
- **Video Download**: Uses yt-dlp to fetch the best quality video
- **Audio Extraction**: Uses yt-dlp with ffmpeg to extract and convert audio to MP3
- **Audio Segmentation**: Uses ffmpeg to trim and extract specific audio segments based on timestamps

## Technologies Used

### Frontend
- **HTML5/CSS3/JavaScript** - Core web technologies
- **WaveSurfer.js** - Audio waveform visualization and interaction
- **Custom CSS** - shadcn-inspired design system with CSS variables for theming

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web server framework
- **yt-dlp** - YouTube video/audio downloader
- **FFmpeg** - Audio/video processing and conversion

## API Endpoints

The application provides the following REST API endpoints:

- `GET /api/health` - Health check endpoint, returns status of yt-dlp and ffmpeg
- `GET /api/info?videoId=VIDEO_ID` - Get video information (title, duration, uploader, thumbnail)
- `POST /api/download-video` - Download full video (body: `{videoId: "VIDEO_ID"}`)
- `POST /api/download-audio` - Download full audio as MP3 (body: `{videoId: "VIDEO_ID"}`)
- `POST /api/get-audio` - Extract audio and return path for waveform visualization (body: `{videoId: "VIDEO_ID"}`)
- `POST /api/download-audio-segment` - Download specific audio segment (body: `{videoId: "VIDEO_ID", startTime: 10, endTime: 30}`)
- `GET /temp/:filename` - Serve temporary audio files for waveform display

## Project Structure

```
yt-audio-extractor/
├── index.html             # Frontend UI
├── server.js              # Express server entry point
├── package.json           # Node.js dependencies
├── Dockerfile             # Docker image definition
├── docker-compose.yml     # Docker Compose configuration
├── .dockerignore          # Docker ignore rules
├── yt-extractor.service   # Systemd service file
├── DEPLOYMENT.md          # Production deployment guide
├── README.md              # This file
├── src/                   # Backend source code
│   ├── controllers/       # Business logic handlers
│   │   ├── audioController.js
│   │   ├── videoController.js
│   │   └── healthController.js
│   ├── routes/            # API route definitions
│   │   ├── audio.js
│   │   ├── video.js
│   │   ├── health.js
│   │   └── index.js
│   ├── utils/             # Utility functions
│   │   ├── dependencies.js
│   │   └── cleanup.js
│   └── README.md          # Source code documentation
└── temp/                  # Temporary download directory (auto-created)
```

The application follows a modular architecture:
- **Controllers**: Handle business logic for different features
- **Routes**: Define API endpoints and map to controllers
- **Utils**: Shared utility functions (dependency checks, file cleanup)
- **Server.js**: Main entry point that initializes the Express app

See [src/README.md](src/README.md) for detailed documentation on the backend architecture.

## Production Deployment

For deploying to an Ubuntu server as a systemd service, see the detailed **[DEPLOYMENT.md](DEPLOYMENT.md)** guide.

The deployment guide covers:
- Installing Docker on Ubuntu Server
- Setting up the application as a systemd service
- Configuring Nginx reverse proxy
- Setting up SSL with Let's Encrypt
- Monitoring and maintenance
- Troubleshooting

Quick deployment steps:
```bash
# On your Ubuntu server
sudo mkdir -p /opt/yt-audio-extractor
cd /opt/yt-audio-extractor

# Copy files to server (via SCP or Git)

# Install and start service
sudo cp yt-extractor.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable yt-extractor.service
sudo systemctl start yt-extractor.service
```

## Notes

- Downloaded files are temporarily stored in the `temp/` directory
- Files are automatically cleaned up after download
- Old temporary files are removed every 10 minutes
- The server will check for yt-dlp and ffmpeg on startup
- Waveform visualization requires the audio to be extracted first
- Audio segments are trimmed on the server using ffmpeg for precise timing
- Preview playback stops automatically at the end of selected regions

## Troubleshooting

### Docker Issues

**Container won't start:**
```bash
# Check detailed logs
docker compose logs

# Check if port 3000 is in use
docker ps -a
lsof -i :3000
```

**yt-dlp errors in Docker:**
```bash
# Rebuild with latest yt-dlp
docker compose build --no-cache
docker compose up -d
```

**Permission errors:**
```bash
# Ensure temp directory is writable
docker compose exec yt-extractor ls -la /app/temp
```

### Local Installation Issues

**"yt-dlp is not installed" error:**
- Make sure yt-dlp is installed and available in your PATH
- Run `yt-dlp --version` to verify installation
- Update with: `pip install --upgrade yt-dlp`

**"ffmpeg is not installed" error:**
- Make sure ffmpeg is installed and available in your PATH
- Run `ffmpeg -version` to verify installation

**Download fails:**
- Check your internet connection
- Some videos may be age-restricted or region-locked
- Make sure you're using a valid YouTube URL
- Update yt-dlp to the latest version

**Port already in use:**
```bash
# Find what's using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change the PORT in server.js
```

## License

MIT
