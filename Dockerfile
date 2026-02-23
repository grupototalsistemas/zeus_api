# Backend Dockerfile - NestJS com Prisma
# Multi-stage build para imagem menor

# ========== STAGE 1: Build ==========
FROM node:20.18.1-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Instala TODAS as dependências (incluindo devDependencies para build)
RUN npm ci --ignore-scripts

# Gera o Prisma Client
RUN npx prisma generate

COPY . .

# Compila o projeto
RUN npm run build

# ========== STAGE 2: Production ==========
FROM node:20.18.1-slim AS production

# Define timezone e NODE_ENV
ENV TZ=America/Sao_Paulo
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Instala dependências do sistema para Puppeteer/Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    tzdata \
    openssl \
    && rm -rf /var/lib/apt/lists/* \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Instala apenas dependências de produção
RUN npm ci --only=production --ignore-scripts

# Gera o Prisma Client
RUN npx prisma generate

# Copia os arquivos compilados do stage de build
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
