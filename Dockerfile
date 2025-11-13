# Use Node.js 18 Alpine
FROM node:18-alpine

# Instalar Chromium e dependências necessárias
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar Puppeteer ANTES de instalar dependências
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV npm_config_puppeteer_skip_chromium_download=true

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração e dependências
COPY package.json package-lock.json .npmrc ./

# Instalar dependências com configurações otimizadas
RUN npm config set fetch-retry-maxtimeout 60000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm install --omit=dev --prefer-offline && \
    npm cache clean --force

# Copiar código da aplicação
COPY . .

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "api/server.js"]