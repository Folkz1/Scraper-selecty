# Use Node.js 18 Alpine
FROM node:18-alpine

# Instalar Chromium e TODAS as dependências necessárias
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji \
    dumb-init \
    udev \
    ttf-dejavu \
    fontconfig

# Configurar Puppeteer ANTES de instalar dependências
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV npm_config_puppeteer_skip_chromium_download=true

# Configurações adicionais para o Chromium funcionar corretamente
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/

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

# Usar dumb-init para gerenciar processos corretamente
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicialização
CMD ["node", "api/server.js"]
