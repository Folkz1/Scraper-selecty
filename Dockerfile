# Usar imagem oficial do Puppeteer (já vem com Chrome instalado)
FROM ghcr.io/puppeteer/puppeteer:21.5.0

# Definir usuário root temporariamente para instalar dependências
USER root

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração
COPY package.json package-lock.json ./

# Instalar dependências (sem baixar Chrome pois já existe na imagem)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm ci --omit=dev

# Copiar código da aplicação
COPY . .

# Mudar ownership para o usuário pptruser
RUN chown -R pptruser:pptruser /app

# Voltar para usuário não-root
USER pptruser

# Configurar caminho do Chrome da imagem oficial
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "api/server.js"]
