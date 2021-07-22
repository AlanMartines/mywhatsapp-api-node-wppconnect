-- Copiando estrutura do banco de dados para mywhatsapp-api
CREATE DATABASE IF NOT EXISTS `mywhatsapp-api`;
USE `mywhatsapp-api`;

-- Copiando estrutura para tabela mywhatsapp-api.tokens
CREATE TABLE IF NOT EXISTS `tokens` (
  `ID` int unsigned NOT NULL AUTO_INCREMENT,
  `token` char(255) NOT NULL,
  `active` char(5) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'true',
  `state` char(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT 'DISCONNECTED',
  `status` char(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT 'notLogged',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb3;