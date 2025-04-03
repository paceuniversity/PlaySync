# 1. Use official Node image
FROM node:18

# 2. Set working directory
WORKDIR /app

# 3. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 4. Copy rest of the app
COPY . .

# 5. Build TypeScript
RUN npm run build

# 6. Set environment variables
ENV PORT=3000

# 7. Expose the port (should match the one used in Express)
EXPOSE 3000

# 8. Start the app
CMD ["npm", "start"]
