# TGS to PNG Conversion Service

A microservice that converts Telegram animated stickers (`.tgs` files) to PNG images. This service provides a simple REST API endpoint that accepts TGS files and returns their first frame as a PNG image.

## Features

- Convert TGS files to PNG images
- RESTful API interface
- Docker support
- Error handling and retries
- Automatic cleanup of temporary files

## Prerequisites

- Node.js 18+ or Docker
- If running without Docker:
  - Chromium browser
  - Required system libraries for Puppeteer

## Installation

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone git@github.com:sijokun/tgs-to-png.git
cd tgs-to-png
```

2. Build and run the Docker container:
```bash
docker build -t tgs-to-png-service .
docker run -p 3000:3000 tgs-to-png-service
```

### Manual Installation

1. Clone the repository:
```bash
git clone git@github.com:sijokun/tgs-to-png.git
cd tgs-to-png
```

2. Install dependencies:
```bash
npm install
```

3. Start the service:
```bash
npm start
```

## API Usage

### Convert TGS to PNG

**Endpoint:** `POST /convert`

**Content-Type:** `multipart/form-data`

**Form Parameters:**
- `tgs`: The TGS file to convert (required)

**Response:**
- Success: PNG file (image/png)
- Error: JSON object with error message

**Example using curl:**
```bash
curl -X POST -F "tgs=@/path/to/sticker.tgs" http://localhost:3000/convert -o output.png
```

**Example using JavaScript fetch:**
```javascript
const form = new FormData();
form.append('tgs', tgsFile);

fetch('http://localhost:3000/convert', {
  method: 'POST',
  body: form
})
.then(response => response.blob())
.then(blob => {
  // Handle the PNG blob
});
```

### Health Check

**Endpoint:** `GET /health`

**Response:** JSON object with service status
```json
{
  "status": "ok"
}
```

## Configuration

The service can be configured using environment variables:

- `PORT`: Server port (default: 3000)
- `PUPPETEER_EXECUTABLE_PATH`: Path to Chromium executable (default: /usr/bin/chromium)

## Error Handling

The service includes several error handling mechanisms:

- Automatic retries for conversion failures (up to 3 attempts)
- Detailed error messages in the response
- Automatic cleanup of temporary files
- Validation of input files

## Docker Support

The included Dockerfile sets up all necessary dependencies and configurations. The container:

- Uses Node.js 18 slim image
- Installs Chromium and required dependencies
- Sets up virtual display using Xvfb
- Configures Puppeteer for containerized environment

## Development

### Project Structure

```
.
├── Dockerfile
├── README.md
├── convert-tgs-folder.js
├── package.json
└── temp/
```

### Adding New Features

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 