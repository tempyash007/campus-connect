# ============================================================
# Dockerfile – CampusConnect Root Application
# DA-IICT Web Services & SOA – Lab 6 Microservices
# ============================================================

# Use Node.js 20 Alpine base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests if available at root level
COPY package*.json ./

# Install node dependencies
RUN if [ -f package.json ]; then npm install --production; fi

# Copy application files
COPY . .

# Expose default port
EXPOSE 3000

# Default entry point
CMD ["npm", "start"]
