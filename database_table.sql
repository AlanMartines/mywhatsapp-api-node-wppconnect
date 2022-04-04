
-- Copiando estrutura do banco de dados para mywhatsapp-api
CREATE DATABASE IF NOT EXISTS `mywhatsapp-api`;
USE `mywhatsapp-api`;

-- Copiando estrutura para tabela mywhatsapp-api.tokens
CREATE TABLE IF NOT EXISTS `tokens` (
  `ID` int unsigned NOT NULL AUTO_INCREMENT,
  `token` char(255) NOT NULL,
	`webhook` char(255) NULL,
  `status` char(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'false',
  `state` char(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'false',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastactivit` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb3;

-- Exportação de dados foi desmarcado.
