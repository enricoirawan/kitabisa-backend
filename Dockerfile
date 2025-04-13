# Stage 1: Builder (Node 20)
FROM node:20-alpine AS builder
WORKDIR /app

# 1. Copy package files dan Prisma schema terlebih dahulu
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# 2. Install dependencies
RUN npm cache clean --force
RUN npm install --legacy-peer-deps

# 3. Copy seluruh kode dan build
COPY . .
RUN npm run build

# 4. Generate Prisma Client
RUN npx prisma generate

# Stage 2: Production (Node 20)
FROM node:20-alpine
WORKDIR /app

# 1. Hanya install production dependencies
COPY package.json package-lock.json ./
RUN npm cache clean --force
RUN npm install --legacy-peer-deps

# 2. Copy hasil build dan Prisma Client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 3. Copy Prisma schema untuk migrasi
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Jalankan migrasi lalu start aplikasi
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
