<p align="center">
  <img src="./public/imagens/whatsapp-bot.png" width="150" alt="My Whats">
</p>

# API - My WhatsApp

Este projeto usa como base o [WPPConnect](https://github.com/wppconnect-team/wppconnect "WPPConnect"), um navegador virtual sem interface gráfica que abre o whatsapp web e executa todos os comandos via código possibilitando assim a automação de todas as funções.

## Nota

Esta Api, segue os mesmos termos de serviço do WhatsApp. É importante que você leia atentamente a estes termos. Você é responsável pelo uso da ferramenta e pelas conseqüências do mau uso. Reforçamos que a API não é destinada para prática de SPAM e que o envio de mensagens indesejadas, viola os termos de serviço do WhatsApp. A violação dos termos pode acarretar no bloqueio e banimento definitivo de sua conta no WhatsApp.

## Legenda

| Status | Descrição                                          |
| ------ | -------------------------------------------------- |
| ✔️     | Testado, funcionado normalmente                    |
| ❌     | Com erro no código                                 |
| ⚠️     | Funcionado de forma anormal                        |
| ✔️⚠️   | Testado, funcionado de forma anormal(TIMEOUT/LOOP) |
| ❌⚠️   | Testado, erro desconhecido(lib)                    |

## Rotas

| Router Started    |     | Router Profile   |     | Router Device      |     |
| ----------------- | --- | ---------------- | --- | ------------------ | --- |
| Start             | ✔️  | setProfileStatus | ✔️  | killServiceWorker  | ✔️  |
| Status            | ✔️  | setProfileName   | ✔️  | restartService     | ✔️  |
| Close             | ✔️  | setProfilePic    | ✔️  | getHostDevice      | ✔️  |
| Logout            | ✔️  |                  |     | getConnectionState | ✔️  |
| getHardware       | ✔️  |                  |     | getBatteryLevel    | ✔️  |
| QRCode            | ✔️  |                  |     | isConnected        | ✔️  |
| getSessions       | ✔️  |                  |     | getWAVersion       | ✔️  |
| getBase64Encoding | ✔️  |                  |     |                    |     |
| getBase64Decoding | ✔️  |                  |     |                    |     |

| Router Basic             |     | Router Retrieving      |     | Router Group                    |     |
| ------------------------ | --- | ---------------------- | --- | ------------------------------- | --- |
| sendVoice                | ✔️  | getAllContacts         | ✔️  | leaveGroup                      | ✔️  |
| sendVoiceBase64          | ✔️  | getSessionTokenBrowser | ✔️  | getGroupMembers                 | ✔️  |
| sendVoiceFileBase64      | ✔️  | getBlockList           | ✔️  | getGroupMembersIds              | ✔️  |
| sendContactVcard         | ✔️  | getStatus              | ✔️  | getGroupInviteLink              | ✔️  |
| sendContactVcardList     | ✔️  | getNumberProfile       | ✔️  | createGroup                     | ✔️  |
| sendText                 | ✔️  | checkNumberStatus      | ✔️  | createGroupSetAdminMembers      | ✔️  |
| sendTextMassa            | ✔️  | checkNumberStatusMassa | ✔️  | createCountGroupSetAdminMembers | ✔️  |
| sendTextGrupo            | ✔️  |                        |     | removeParticipant               | ✔️  |
| sendLocation             | ✔️  |                        |     | addParticipant                  | ✔️  |
| sendLocationGroup        | ✔️  |                        |     | promoteParticipant              | ✔️  |
| sendLinkPreview          | ✔️  |                        |     | demoteParticipant               | ✔️  |
| sendImage                | ✔️  |                        |     | getGroupInfoFromInviteLink      | ✔️  |
| sendImageMassa           | ✔️  |                        |     | joinGroup                       | ✔️  |
| sendMultImage            | ✔️  |                        |     |                                 |     |
| sendMultImageMassa       | ✔️  |                        |     |                                 |     |
| sendImageGrupo           | ✔️  |                        |     |                                 |     |
| sendFile                 | ✔️  |                        |     |                                 |     |
| sendFileBase64           | ✔️  |                        |     |                                 |     |
| sendFileToBase64         | ✔️  |                        |     |                                 |     |
| sendFileFromBase64       | ✔️  |                        |     |                                 |     |
| sendImageAsStickerGif    | ✔️  |                        |     |                                 |     |
| sendImageAsStickerGifUrl | ✔️  |                        |     |                                 |     |
| sendImageAsSticker       | ✔️  |                        |     |                                 |     |

#### Dependências Debian (e.g. Ubuntu) 64bits

```bash
  sudo apt-get update \
	&& apt-get upgrade -y \
	&& apt-get install -y \
	git \
	curl \
	yarn \
	gcc \
	g++ \
	make \
	libgbm-dev \
	wget \
	unzip \
	fontconfig \
	locales \
	gconf-service \
	libasound2 \
	libatk1.0-0 \
	libc6 \
	libcairo2 \
	libcups2 \
	libdbus-1-3 \
	libexpat1 \
	libfontconfig1 \
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
	libnss3 \
	lsb-release \
	xdg-utils \
	ca-certificates \
	fonts-liberation \
	libasound2 \
	libatk-bridge2.0-0 \
	libatk1.0-0 \
	libc6 \
	libcairo2 \
	libcups2 \
	libdbus-1-3 \
	libexpat1 \
	libfontconfig1 \
	libgbm1 \
	libgcc1 \
	libglib2.0-0 \
	libgtk-3-0 \
	libnspr4 \
	libnss3 \
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
	lsb-release \
	libu2f-udev \
	wget \
	xdg-utils
```

#### Dependências CentOS 7/8 64bits (Validar)

```bash
yum install -y \
alsa-lib.x86_64 \
atk.x86_64 \
cups-libs.x86_64 \
gtk3.x86_64 \
ipa-gothic-fonts \
libXcomposite.x86_64 \
libXcursor.x86_64 \
libXdamage.x86_64 \
libXext.x86_64 \
libXi.x86_64 \
libXrandr.x86_64 \
libXScrnSaver.x86_64 \
libXtst.x86_64 \
pango.x86_64 \
xorg-x11-fonts-100dpi \
xorg-x11-fonts-75dpi \
xorg-x11-fonts-cyrillic \
xorg-x11-fonts-misc \
xorg-x11-fonts-Type1 \
xorg-x11-utils
```

#### Dependências Alpine 64bits (Validar)

```bash
# replacing default repositories with edge ones
echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" > /etc/apk/repositories \
echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories \
echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories \
echo "http://dl-cdn.alpinelinux.org/alpine/v3.9/main" >> /etc/apk/repositories \
echo "http://dl-cdn.alpinelinux.org/alpine/v3.9/community" >> /etc/apk/repositories \
apk update \
apk upgrade \
# Add the packages
apk add --update --no-cache dumb-init curl make gcc g++ linux-headers binutils-gold gnupg libstdc++ nss chromium chromium-chromedriver git vim curl yarn nodejs nodejs-npm npm python python3 dpkg wget
```

#### Instale o Google Chrome Debian (e.g. Ubuntu) 64bits

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

sudo apt install ./google-chrome-stable_current_amd64.deb
```

#### Instale o Google Chrome CentOS 7/8 64bits

```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm

sudo yum install ./google-chrome-stable_current_*.rpm
```

#### Instale o Google Chrome Alpine 64bits

```bash
apk add chromium chromium-chromedriver
```

#### Instale o NodeJs Debian (e.g. Ubuntu)

###### Instalar

```bash
# Ir para seu diretório home
cd ~

# Recuperar o script de instalação para sua versão de preferência
curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh

# Execute o script
sudo bash nodesource_setup.sh

# Instalar o pacote Node.js
sudo apt install -y git nodejs yarn gcc g++ make python3

# Remover pacotes que não são mais necessários
sudo apt autoremove -y
```

#### Instale o NodeJs CentOS 7/8 64bits

###### Instalar

```bash
# Ir para seu diretório home
cd ~

# Recuperar o script de instalação para sua versão de preferência
curl -sL https://rpm.nodesource.com/setup_14.x | sudo bash -

# Execute o script
sudo yum install nodejs

# Instalar o pacote Node.js
sudo yum install -y git nodejs yarn gcc g++ make gcc-c++ tar

# Remover pacotes que não são mais necessários
sudo yum autoremove -y
```

#### Instale o NodeJs Alpine 64bits

###### Instalar

```bash
# Ir para seu diretório home
cd ~

# Instalar o pacote Node.js
apk add --update nodejs nodejs-npm
```

#### Instale o MySQL Debian (e.g. Ubuntu)

###### Instalar

```bash
#Atualize o índice de pacotes em seu servidor se ainda não tiver feito isso
sudo apt update

#Instale o pacote mysql-server
sudo apt install mysql-server -y

#Execute o script de segurança
sudo mysql_secure_installation
```

## Rodando a aplicação

```bash
# Ir para seu diretório home
cd ~

# Clone este repositório
git clone https://github.com/AlanMartines/mywhatsapp-api-node-wppconnect.git ApiWPPConnect

# Acesse a pasta do projeto no terminal/cmd
cd ApiWPPConnect

# Instale as dependências
npm install --allow-root --unsafe-perm=true

# Clone este repositório
git clone https://github.com/wppconnect-team/wppconnect.git

# Acesse a pasta do projeto no terminal/cmd
cd wppconnect

# Instale as dependências
npm install --allow-root --unsafe-perm=true

# Building WPPConnect
npm run build

# Ir para seu diretório anterior
cd ..

# Configuração inicial
cp .env-example .env

# Execute a aplicação
node server.js

# Manter os processos ativos a cada reinicialização do servidor
npm install pm2 -g

pm2 start server.js --name ApiWPPConnect --watch

pm2 save

pm2 startup

sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ${USER} --hp /home/${USER}

# Para remover do init script
pm2 unstartup systemd

# O servidor iniciará na porta:9001

# Pronto, escaneie o código QR-Code do Whatsapp e aproveite!
```

## Gerar TOKEN_SECRET para uso no jwt

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64').replace(/[^a-zA-Z0-9]/g, ''));"
```

## Criar pasta tokens (Linux)

```bash
sudo mkdir /usr/local/tokens

sudo chmod -R 755 /usr/local/tokens
```

## Criar pasta tokens (Windows)

```cmd
mkdir c:\tokens
```

## Configuração inicial do arquivo ".env-example"

```
NODE_EN=production
#
# Set host
HOST=0.0.0.0
#
# Set port
PORT=9001
#
# QRCode in terminal false or true
VIEW_QRCODE_TERMINAL=0
#
# Secret key
JWT_SECRET=09f26e402586e2faa8da4c98a35f1b20d6b033c60
#
TOKENSPATCH_LINUX=/usr/local/tokens
#
TOKENSPATCH_WIN=c:/tokens
#
# Validate in terminal false or true
VALIDATE_MYSQL=0
#
HOST_MYSQL=localhost
#
PORT_MYSQL=3306
#
USER_MYSQL=mywhatsappapi
#
PASSWORD_MYSQL=TuUep8KkjCtAA@
#
DATABASE_MYSQL=mywhatsapp-api
```

## Create MySQL DATABASE/TABLE

```sql
-- Copiando estrutura do banco de dados para mywhatsapp-api
CREATE DATABASE IF NOT EXISTS `mywhatsapp-api`;
USE `mywhatsapp-api`;

-- Copiando estrutura para tabela mywhatsapp-api.tokens
CREATE TABLE IF NOT EXISTS `tokens` (
  `ID` int unsigned NOT NULL AUTO_INCREMENT,
  `token` char(255) NOT NULL,
  `status` char(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'false',
  `state` char(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'false',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastactivit` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb3;
```

#### Json (POST)

```json
{
  "AuthorizationToken": "a56ad842-c707-4446-871c-e570240cd730",
  "SessionName": "teste"
	...
}
```

#### Iniciar sessão whatsapp (POST method)

```js
router.post("/Start", (req, res, next) => {
  const response = await fetch("http://localhost:9001/sistema/Start", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      AuthorizationToken: req.body.AuthorizationToken,
      sessionName: req.body.SessionName,
    }),
  });
  const content = await response.json();
  return content;
});
```

#### Exibir QR-Code no navegador (POST method)

```js
router.post("/QRCode", (req, res, next) => {
  const response = await fetch("http://localhost:9001/sistema/QRCode", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      AuthorizationToken: req.body.AuthorizationToken,
      sessionName: req.body.SessionName,
      View: "true",
    }),
  });
  const content = await response.json();
  return content;
});
```

#### Retorna json com (base64) do QR-Code (POST method)

```js
router.post("/QRCode", (req, res, next) => {
  const response = await fetch("http://localhost:9001/sistema/QRCode", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      AuthorizationToken: req.body.AuthorizationToken,
      sessionName: req.body.SessionName,
      View: "false",
    }),
  });
  const content = await response.json();
  return content;
});
```

#### Fecha sessão whatsapp (POST method)

```js
router.post("/Close", (req, res, next) => {
  const response = await fetch("http://localhost:9001/sistema/Close", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      AuthorizationToken: req.body.AuthorizationToken,
      sessionName: req.body.SessionName,
    }),
  });
  const content = await response.json();
  return content;
});
```

## Dockerfile

```bash
# Ir para seu diretório home
cd ~

# Clone este repositório
git clone https://github.com/AlanMartines/mywhatsapp-api-node-wppconnect.git

# Acesse a pasta do projeto no terminal/cmd
cd nodejs-mywhatsapp-api-node-wppconnect

# Processando o arquivo Dockerfile
docker build -t alanmartines/nodejs-mywhatsapp-api-node-wppconnect:1.0

# Criar um contêiner
docker container run --name mywhatsapp-api-node-wppconnect -p 9000:9000 -d alanmartines/nodejs-mywhatsapp-api-node-wppconnect:1.0
```

## Para instalar o certbot e criar o certificado SSL para domínios https

```barsh
sudo apt-get update  \ sudo apt-get install -y software-properties-common
```

```barsh
sudo add-apt-repository universe  \ sudo add-apt-repository ppa:certbot/certbot
```

```barsh
sudo apt-get update  \ sudo apt-get install -y certbot
```

```barsh
sudo apt-get update  \ sudo apt-get install -y software-properties-common
```

```barsh
sudo add-apt-repository universe  \ sudo add-apt-repository ppa:certbot/certbot
```

```barsh
sudo apt-get update  \ sudo apt-get install -y certbot
```

```barsh
sudo certbot certonly --manual --force-renewal -d *.yourdomain.net -d yourdomain.net --agree-tos --no-bootstrap --manual-public-ip-logging-ok --preferred-challenges dns-01 --server https://acme-v02.api.letsencrypt.org/directory
```

## Em desenvolvimento

Este projeto se encontra em desenvolvimento, então pode conter erros.

## Ban Whatsapp

<blockquote>
Existem dois tipos diferentes de banimento.

**BANIMENTO TEMPORÁRIO**
Uma técnica para banir temporariamente uma conta. Eu sei que eles não estão mais acostumados a aplicar banimento temporário, ou eles são tão raros hoje em dia, exceto pelo uso de versões não autorizadas do WhatsApp.

- O WhatsApp pode banir temporariamente sua conta se você estiver usando uma versão não autorizada do WhatsApp.
- Versões não autorizadas do WhatsApp, também conhecidas como “Mods do WhatsApp” no Android, costumam oferecer vários novos recursos, mas sua privacidade pode ser comprometida: esses aplicativos editam o WhatsApp, injetando um código diferente, e não podemos saber se esse código é perigoso para sua privacidade e segurança.

- Usar uma versão modificada do WhatsApp viola os Termos de Serviço, então o WhatsApp pode banir sua conta quando iniciar uma nova onda de banimento. Se o usuário não mudar para a versão oficial do WhatsApp da App Store e Google Play Store dentro de um determinado tempo, ele definitivamente banirá sua conta.

- O WhatsApp deve proteger seus produtos e usuários, portanto, sua ação de banir as versões modificadas é absolutamente correta. Talvez eles pudessem agir de forma diferente, por exemplo, impedindo o acesso a versões modificadas do WhatsApp sem banir o usuário, mas é compreensível. Há alguns anos o WhatsApp está tentando convencer as pessoas a parar de usar versões modificadas do WhatsApp, implementando alguns recursos incluídos nessas versões.
- O WhatsApp pode banir temporariamente sua conta se você criar muitos grupos com pessoas que não têm seu número de telefone salvo em suas listas de endereços.
- O WhatsApp pode banir temporariamente sua conta se você enviar muitas mensagens para pessoas que não têm seu número de telefone salvo em suas listas de endereços.
- O WhatsApp pode banir temporariamente sua conta se você enviar muitas mensagens para uma lista de difusão.
- O WhatsApp poderia anteriormente banir sua conta se você enviar a mesma mensagem para muitas pessoas. O WhatsApp não consegue ler o conteúdo da mensagem, mas se o aplicativo WhatsApp entender que você está encaminhando a mesma mensagem para muitos contatos, você pode ser banido temporariamente. Não deveria estar ativo hoje em dia ou é muito raro, pois o WhatsApp permite encaminhar uma mensagem para no máximo 5 contatos, a fim de evitar a divulgação de notícias falsas.
- O WhatsApp pode banir temporariamente sua conta se muitas pessoas bloquearem você em um determinado tempo.
  Se o usuário foi banido temporariamente várias vezes, ele pode ser banido permanentemente de usar o WhatsApp.

**BANIMENTO PERMANENTE**
Principais razões pelas quais o WhatsApp pode banir sua conta:

- O WhatsApp proíbe permanentemente contas que executam ações em massa ou automatizadas: elas violam totalmente seus Termos de Serviço porque essas ações usam os serviços do WhatsApp sem qualquer autorização. O WhatsApp proíbe mais de 2,5 milhões de contas por mês devido a mensagens em massa e automatizadas.
- O WhatsApp pode banir permanentemente sua conta se o número de telefone associado tiver sido usado para ações suspeitas. Essa verificação acontece durante o registro da conta.
- O WhatsApp proíbe contas que usam seu serviço intensamente, por exemplo, se a conta enviar muitas mensagens em um determinado período. Não se preocupe, o WhatsApp introduziu um limite que é realmente inalcançável para uma pessoa. Se uma conta atingiu o limite, significa que não é humana, mas é um sistema automatizado.
- O WhatsApp bane todas as contas que recebem vários relatórios de outros usuários.
O WhatsApp avisa que eles não podem emitir um aviso antes de banir qualquer conta (de acordo com seus Termos de Serviço, eles podem reter o direito de bani-lo sem qualquer comunicação), mas, se o usuário pensa que sua conta foi banida por engano, ele pode enviar um e-mail para que eles vai examinar o caso dele.
O WhatsApp também proíbe contas com nomes suspeitos em seus nomes de grupo.
Conforme mencionado no artigo sobre os rótulos de privacidade da Apple para WhatsApp, o WhatsApp pode visualizar todos os nomes e descrições de grupos, a fim de banir automaticamente todas as contas que violam as leis (mas não são coletadas para fins publicitários e esses detalhes não são compartilhados com seus pais empresa, Facebook). Isso é para ajudar o WhatsApp a combater a exploração infantil.
Infelizmente, o WhatsApp também pode banir sua conta por engano. Deixe-nos mostrar alguns exemplos.
Algumas semanas atrás, recebi um relatório de um usuário do WhatsApp: ele estava em um grupo com outros 12 membros. Um membro deu seu código de 6 dígitos para outra pessoa e ele perdeu sua conta do WhatsApp (o que são contas do WhatsApp roubadas e por que isso acontece?). Este “novo membro” mudou o nome e a descrição do grupo: ele inseriu termos ilegais, acionando sistemas WhatsApp e todo o grupo foi banido.
Esses usuários tentaram entrar em contato com o Suporte do WhatsApp para solicitar o cancelamento do banimento. O WhatsApp se recusou a cancelar o banimento dessas contas, porque violaram seus Termos de Serviço.
Mantiveram contato com o suporte por mais de 2 meses, mas nada de novo: sempre recebiam a mesma resposta ou não atendiam.
Resolvi dar voz a essa história, compartilhando no Twitter. No dia seguinte, essas 13 contas foram canceladas.
</blockquote>

## Reflexão

<blockquote>
O conhecimento que adquirimos não merece ficar parado. Compartilhar tudo o que sabemos e gerar valor na vida de outras pessoas pode ter efeitos incríveis. Viver em constante compartilhamento de informações ajuda nossa comunidade profissional a evoluir cada vez mais.

Todos nós, independente do nível de conhecimento técnico, temos algum tipo de diferencial a oferecer para o próximo.

Já que temos a incrível capacidade de oferecer algo diferente para o próximo, devemos aproveitar isso para compartilhar todo esse nosso conhecimento.

Às vezes temos o sentimento de que aquilo que estamos fazendo de tão especial merece ser compartilhado, a internet está aí para nos possibilitar isso.

Temos a chance de buscar um conhecimento hoje e amanhã criar um artigo, vídeo ou qualquer outro tipo de material para compartilhar com as pessoas esse conhecimento que adquirimos.

Muitas pessoas, e talvez você se inclua nesse grupo, ainda têm aquele sentimento forte de mudar o próximo. Um sentimento que a faz ter um propósito de vida para buscar algo a mais, algo que possa contribuir para as gerações que por aqui estão e que ainda virá a passar.

Isso fica ainda mais expressivo quando se trata da comunidade específica de seu campo de estudo ou trabalho, pois deixar algum “legado” para sua área de conhecimento é algo que chama atenção de profissionais, pesquisadores e estudantes do mundo todo.

Muitos são movidos exatamente por essa energia de deixar seu nome registrado para o mundo.

A sua carreira é construída ao longo do tempo com uma série de conhecimentos e habilidades que são adquiras ao longo da vida.

Mas essa tarefa não precisa ser uma ação solitária e tão complicada assim, ainda mais levando em conta que uma sede grande pela busca de conhecimento e alguns ainda mais motivados para compartilhar tudo aquilo que já aprenderam.

Em outras palavras, as pessoas acabam tendo uma certa tendência em escutar o que as outras pessoas têm a dizer e também fazer a sua voz ser ouvida.

A informação não fica parada!

Quando entendemos a força desse hábito de compartilhar conhecimento, estamos contribuindo para que as pessoas ao nosso redor, que também precisam desse conhecimento, não parem de aprender.

Informação que fica parada, se perde! Tudo está na rede, esperando por você.

Faça dessa prática um de seus hábitos também. As informações que são compartilhadas por você podem contribuir para o crescimento e ascensão de alguém, já imaginou isso?

Envolva-se com as pessoas. Isso é ter propósito!

</blockquote>

## License

[MIT](https://choosealicense.com/licenses/mit/)
