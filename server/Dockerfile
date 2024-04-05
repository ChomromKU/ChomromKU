ARG DATABASE_URL
# Use the official Node.js 18 image
FROM node:18

# Set the working directory in the container
WORKDIR /app/server

# Copy the dependencies file to the working directory
COPY package.json .

# Install nodemon globally
RUN npm install -g nodemon

# Install Prisma CLI (prisma)
RUN npm install prisma --save-dev

# Install dependencies
RUN npm install

# Copy the rest of the application to the working directory
COPY . .

# Initialize and apply migrations
RUN npx prisma migrate dev

# Generate Prisma client
RUN npx prisma generate

# Start the server
CMD ["nodemon", "server.js"]
