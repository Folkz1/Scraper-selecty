# Use Node.js 18 Alpine como base
FROM node:18-alpine

# Instalar dependências do sistema e Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    udev \
    && rm -rf /var/cache/apk/*

# Configurar Puppeteer para usar Chromium instalado
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/bin/chromium-browser

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Criar diretório da aplicação
WORKDIR /app

# Copiar package.json
COPY package.json ./

# Copiar package-lock.json se existir
COPY package-lock.json* ./

# Instalar dependências
RUN npm install --only=production && npm cache clean --force

# Copiar código da aplicação
COPY --chown=nextjs:nodejs . .

# Criar diretório para logs
RUN mkdir -p logs && chown -R nextjs:nodejs logs

# Mudar para usuário não-root
USER nextjs

# Expor porta 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => { process.exit(1) })"

# Comando para iniciar a aplicação
CMD ["node", "api/server.js"]