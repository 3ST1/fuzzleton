FROM node:18-alpine

WORKDIR /app

# Copy only package.json and package-lock.json first to install dependencies early
COPY package.json package-lock.json ./
RUN npm install

# Now copy the rest of the application code
COPY . .

# Command to run the app using Vite in development mode
CMD ["npm", "run", "dev"]
