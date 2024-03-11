# Use the official Node.js 18 image
FROM node:18

# Set the working directory in the container
WORKDIR /app/client

# Copy the dependencies file to the working directory
COPY package.json .

# Install dependencies
RUN npm install

# Copy the rest of the application to the working directory
COPY . .

# Start the client
CMD ["npm", "start"]
