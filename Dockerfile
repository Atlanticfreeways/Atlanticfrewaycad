FROM node:20-alpine

WORKDIR /app

# Install system dependencies if needed (e.g. for potential native modules)
RUN apk add --no-cache dumb-init python3 make g++

# Copy all source files first
COPY . .

# Run the project build script
# This script (in root package.json) installs dependencies for both backend and frontend,
# then builds the Next.js frontend to 'frontend/out'
RUN npm run build

# Ensure logs directory exists and permissions are correct
RUN mkdir -p logs && chown -R node:node logs

# Switch to non-root user
USER node

# Expose the port (Render will override PORT env var, but this documents intent)
EXPOSE 3000

# Start the monolithic server
CMD ["dumb-init", "node", "server.js"]
