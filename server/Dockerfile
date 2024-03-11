# Use the official Node.js 18 image
FROM node:18

# Set the working directory in the container
WORKDIR /app/server

# Copy the dependencies file to the working directory
COPY package.json .

# Install nodemon globally
RUN npm install -g nodemon

# Install dependencies
RUN npm install

# Copy the rest of the application to the working directory
COPY . .

# Start the server
CMD ["nodemon", "server.js"]
