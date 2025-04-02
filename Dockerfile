# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and Prisma schema first for caching
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy all files and build
COPY . .
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Run migrations, seeding, then start app
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main.js"]