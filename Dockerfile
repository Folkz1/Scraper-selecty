# Usar imagem oficial do Puppeteer (mais estável que Alpine)
FROM ghcr.io/puppeteer/puppeteer:21.5.0

# Definir usuário root temporariamente para instalar dependências
USER root

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração
COPY package.json package-lock.json ./

# Instalar dependências
RUN npm ci --omit=dev

# Copiar código da aplicação
COPY . .

# Mudar ownership para o usuário pptruser
RUN chown -R pptruser:pptruser /app

# Voltar para usuário não-root
USER pptruser

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "api/server.js"]
