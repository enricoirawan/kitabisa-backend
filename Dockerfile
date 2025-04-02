# Tahap pembangunan (builder stage)
FROM node:18-slim AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build
# Migrasi Prisma
RUN npx prisma migrate deploy
# Seeding Prisma
RUN npx prisma db seed

# Tahap produksi (production stage)
FROM node:18-slim AS production
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
CMD ["node", "dist/main.js"]