FROM node:20-slim AS builder

WORKDIR /app

COPY package.json ./
RUN rm -f package-lock.json && npm install
COPY . .
RUN npm run build

# --- Production ---
FROM node:20-alpine

WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
