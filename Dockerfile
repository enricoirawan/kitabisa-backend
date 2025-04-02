# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# 1. Copy package files dan Prisma schema (untuk layer caching)
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# 2. Install dependencies (termasuk devDependencies untuk build)
RUN npm install --legacy-peer-deps

# 3. Copy seluruh kode dan build
COPY . .
RUN npm run build

# 4. Generate Prisma Client (penting!)
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# 1. Install HANYA production dependencies + Prisma
COPY package.json package-lock.json ./
RUN npm install --omit=dev --legacy-peer-deps && \
  npm install @prisma/client --legacy-peer-deps

# 2. Copy dari builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma  # Kritis untuk Prisma!
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# 4. Jalankan dengan error handling dan memory limit
CMD ["sh", "-c", "npx prisma migrate deploy || echo 'Migration failed but continuing...' && node --max_old_space_size=1024 dist/main.js"]