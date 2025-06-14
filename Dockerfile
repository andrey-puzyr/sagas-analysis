# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create data directory for mounting
RUN mkdir -p /app/data

# Make CLI script executable
RUN chmod +x ./src/index.js

# Create non-root user for security
RUN addgroup -g 1001 -S sagauser && \
    adduser -S sagauser -u 1001 -G sagauser

# Change ownership of app directory
RUN chown -R sagauser:sagauser /app

# Switch to non-root user
USER sagauser

# Set entrypoint to the CLI script
ENTRYPOINT ["node", "./src/index.js"]

# Default command shows help
CMD ["--help"]