# Bella by Lux

An interactive audio visualizer that responds to your voice and integrates with Lindy.ai for intelligent responses.

## Features

- Real-time audio visualization with dynamic effects
- Speech recognition and transcription
- Integration with Lindy.ai for intelligent responses
- Beautiful wave and ripple effects
- Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser to the URL shown in the terminal (usually http://localhost:8888)

## Deployment

This project is configured for deployment on Netlify. You can deploy it in two ways:

### Option 1: Git Integration (Recommended)
1. Push this repository to GitHub
2. Connect your GitHub repository to Netlify
3. Netlify will automatically deploy your site

### Option 2: Manual Deployment
1. Install the Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy the site:
```bash
netlify deploy --prod
```

## Development

The project structure is as follows:

- `index.html` - Main application file with visualization and audio processing
- `netlify/functions/` - Serverless functions for handling Lindy.ai webhooks
- `netlify.toml` - Netlify configuration
- `package.json` - Project dependencies and scripts

## Browser Support

This application requires:
- WebAudio API
- Web Speech API
- Modern CSS features (transforms, filters)

Best supported in Chrome/Edge/Safari on desktop and mobile. 