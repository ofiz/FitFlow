FROM node:23-alpine3.21

# Update Alpine packages for security fixes
RUN apk update && apk upgrade --no-cache libcrypto3 libssl3
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy source code
COPY . .

# Create uploads directory with correct permissions
RUN mkdir -p uploads/progress-photos && \
    chown -R node:node uploads

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/test', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

USER node

CMD ["node", "server.js"]
