# Use a imagem oficial como imagem principal.
FROM node:14-slim
#FROM node:current
#FROM ubuntu:18.04
#FROM ubuntu:20.04

RUN mkdir -p /usr/src/mywhats-api

# apt-get install --no-install-recommends --no-install-suggests -y \
RUN apt-get update && apt-get install -y \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget \
    build-essential \
    apt-transport-https \
    libgbm-dev \
    && apt-get install curl -y \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y \
    git \
    nodejs \
    yarn \
    npm \
    gcc \
    g++ \
    make

# Defina o diretório de trabalho.
WORKDIR /usr/src/mywhats-api

# Copie o arquivo do seu host para o local atual.
COPY package*.json ./

# Execute o comando dentro do seu sistema de arquivos de imagem.
RUN npm install

# Copie o restante do código-fonte do seu aplicativo do host para o sistema de arquivos de imagem.
COPY . .

EXPOSE 9000
# EXPOSE 80 443

# Execute o comando especificado dentro do contêiner.
CMD [ "npm", "start" ]

### LEIA-ME ###
## Processando o arquivo Dockerfile
# docker build -t alanmartines/nodejs-mywhats-api:1.0 .

## Criar um contêiner
# docker container run --name mywhats-api -p 9000:9000 -d alanmartines/nodejs-mywhats-api:1.0

## Acessar bash do container
# docker exec -it <container id> /bin/sh
# docker exec -it <container id> /bin/bash

## Removendo todos os containers e imagens de uma só vez
# docker rm $(docker ps -qa)

## Removendo todas as imagens de uma só vez
# docker rmi $(docker images -aq)

## Removendo imagens
# docker rmi <REPOSITORY>
# docker rmi <IMAGE ID>

## Como obter o endereço IP de um contêiner Docker do host
# https://stack.desenvolvedor.expert/appendix/docker/rede.html
# docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <IMAGE ID>