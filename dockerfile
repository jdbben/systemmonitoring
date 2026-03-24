# Use Node LTS
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Expose the port your app uses
EXPOSE 5000

# Run the app with ts-node
CMD ["npx", "ts-node", "index.ts"]

RUN apt-get update && apt-get install -y lm-sensors