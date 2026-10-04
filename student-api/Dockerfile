# ============================================================
# Dockerfile – Student REST API
# DA-IICT Web Services & SOA – Lab 5 Assignment
# ============================================================

# Use the official Node.js 20 LTS image as the base
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy only the dependency manifests first (for better layer caching)
# If package.json hasn't changed, Docker reuses the cached npm install layer
COPY package*.json ./

# Install production dependencies
RUN npm install

# Copy the rest of the application source code into the container
COPY . .

# Expose the port the API listens on (must match PORT env variable)
EXPOSE 3000

# Define the command to start the application
CMD ["npm", "start"]
