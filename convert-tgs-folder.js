const express = require('express');
const fs = require('fs');
const path = require('path');
const renderLottie = require('puppeteer-lottie');
const zlib = require('zlib');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const port = process.env.PORT || 3000;

// Temporary directory for output files - using absolute path
const outputDir = path.join(__dirname, 'temp');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

function maybeDecompressTGS(buffer) {
    try {
        return JSON.parse(zlib.gunzipSync(buffer).toString());
    } catch (e) {
        // if not compressed, treat as normal JSON
        return JSON.parse(buffer.toString());
    }
}

async function convertTGStoPNG(buffer) {
    const animationData = maybeDecompressTGS(buffer);
    const outputPath = path.join(outputDir, `${uuidv4()}.png`);
    
    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
        try {
            await renderLottie({
                animationData,
                output: outputPath,
                width: 512,
                height: 512,
                frame: 0, // render only the first frame
                puppeteerOptions: {
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu'
                    ],
                    headless: 'new'
                }
            });
            success = true;
            return outputPath;
        } catch (error) {
            attempt++;
            console.error('Conversion attempt failed:', error);
            if (attempt === maxRetries) {
                throw new Error(`Failed to convert TGS to PNG after ${maxRetries} attempts`);
            }
        }
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Conversion endpoint
app.post('/convert', upload.single('tgs'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No TGS file provided' });
        }

        const outputPath = await convertTGStoPNG(req.file.buffer);
        
        // Send the PNG file using absolute path
        res.sendFile(outputPath, { root: '/' }, (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            // Clean up: delete the temporary file
            fs.unlink(outputPath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting temporary file:', unlinkErr);
            });
        });
    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`TGS to PNG conversion service listening at http://localhost:${port}`);
});
