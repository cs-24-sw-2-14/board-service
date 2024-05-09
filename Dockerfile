# Use the official Node.js 18 image.
# If you need a different version of Node.js, adjust this line accordingly.
FROM node:18

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock if you use yarn)
COPY package*.json ./

# Install dependencies
# If you use yarn, you might want to run `yarn install --frozen-lockfile`
RUN npm install

# Copy the rest of your application's code
COPY . .

# Your app binds to port 5123 so you'll use the EXPOSE instruction to have it mapped by the docker daemon
EXPOSE 5123 6123

# Define the command to run your app using ts-node
CMD ["npx", "ts-node", "src/server.ts"]
