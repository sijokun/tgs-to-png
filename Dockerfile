# Use Node.js 18 as base image
FROM node:18-slim

# Install dependencies for Puppeteer
RUN apt-get update \
    && apt-get install -y \
    chromium \
    chromium-sandbox \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    dbus-x11 \
    xvfb \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Create temp directory for output files
RUN mkdir -p temp

# Expose the port the app runs on
EXPOSE 3000

# Add Chromium flags and Xvfb configuration
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    DISPLAY=:99

# Start Xvfb and the application
CMD Xvfb :99 -screen 0 1024x768x16 & npm start 