# AI Video Generator Agent

An automated system that generates daily videos using AI and posts them to YouTube.

## Features

- **Automated Video Generation**: Uses OpenAI GPT-4 to create engaging video scripts
- **AI-Powered Visuals**: Generates images using Stable Diffusion via Replicate
- **Text-to-Speech**: Converts scripts to natural-sounding narration
- **YouTube Integration**: Automatically uploads videos to your YouTube channel
- **Scheduled Automation**: Daily video posting with configurable cron schedule
- **Web Dashboard**: Monitor video generation status and manage settings

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required API keys:

- **OPENAI_API_KEY**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **REPLICATE_API_TOKEN**: Get from [Replicate](https://replicate.com/account/api-tokens)
- **YOUTUBE_CLIENT_ID & YOUTUBE_CLIENT_SECRET**:
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create a new project
  3. Enable YouTube Data API v3
  4. Create OAuth 2.0 credentials
  5. Add authorized redirect URI: `http://localhost:3000/api/auth/youtube/callback`

### 3. Run the Application

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

### 4. Authenticate with YouTube

1. Open the application in your browser
2. Click "Connect YouTube Account"
3. Authorize the application

### 5. Configure Video Settings

Edit `.env` to customize:
- `VIDEO_NICHE`: Your content niche (e.g., "technology tips and tutorials")
- `CRON_SCHEDULE`: When to post videos (default: "0 9 * * *" = 9 AM daily)

## Usage

### Manual Video Generation

1. Go to the dashboard
2. Enter a custom topic (optional)
3. Click "Generate Video"
4. Monitor progress in the history section

### Automated Daily Videos

1. Enable "Daily Automation" in the dashboard
2. Videos will be generated and posted according to your cron schedule

## Tech Stack

- **Next.js 14**: React framework
- **TypeScript**: Type-safe code
- **OpenAI GPT-4**: Script generation
- **OpenAI TTS**: Text-to-speech
- **Replicate (Stable Diffusion)**: Image generation
- **Google YouTube API**: Video uploads
- **Node Canvas**: Video composition
- **node-cron**: Task scheduling

## License

MIT
