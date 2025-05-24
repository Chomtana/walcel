# Use an official Node.js image as the base
FROM node:18-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

# Copy package files and install dependencies
COPY package.json ./
RUN pnpm install

# Copy source code and build the app
COPY . .
RUN pnpm run build

# Use lightweight image for production
FROM node:18-alpine AS runner

WORKDIR /app
COPY --from=builder /app ./

# Expose port for Next.js
EXPOSE 3000

CMD ["npm", "start"]