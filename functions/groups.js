const Sessions = require('../controllers/sessions');

module.exports = class Group {
	/*
	╔═╗┬─┐┌─┐┬ ┬┌─┐  ╔═╗┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐
	║ ╦├┬┘│ ││ │├─┘  ╠╣ │ │││││   │ ││ ││││└─┐
	╚═╝┴└─└─┘└─┘┴    ╚  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘└─┘
	*/
	//
	// Deixar o grupo
	static async leaveGroup(
		SessionName,
		groupId
	) {
		console.log("- Deixar o grupo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultleaveGroup = await session.client.then(async client => {
			return await session.client.leaveGroup(groupId).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"groupId": groupId,
					"message": "Grupo deixado com sucesso"
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"groupId": groupId,
					"message": "Erro ao deixar o grupo"
				};
				//
			});
		});
		return resultleaveGroup;
	} //leaveGroup
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Obtenha membros do grupo
	static async getGroupMembers(
		SessionName,
		groupId
	) {
		console.log("- Obtendo membros do grupo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetGroupMembers = await session.client.then(async client => {
			return await session.client.getGroupMembers(groupId).then(async (result) => {
				//console.log('Result: ', result); //return object success
				//
				var getGroupMembers = [];
				//
				await forEach(result, async (resultGroupMembers) => {
					//
					if (resultGroupMembers.isMyContact === true || resultGroupMembers.isMyContact === false) {
						//
						getGroupMembers.push({
							"user": resultGroupMembers.id.user,
							"name": resultGroupMembers.name,
							"shortName": resultGroupMembers.shortName,
							"pushname": resultGroupMembers.pushname,
							"formattedName": resultGroupMembers.formattedName
						});
					}
					//
				});
				//
				return getGroupMembers;
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"groupId": groupId,
					"message": "Erro ao obter membros do grupo"
				};
				//
			});
		});
		return resultgetGroupMembers;
	} //getGroupMembers
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Obter IDs de membros do grupo
	static async getGroupMembersIds(
		SessionName,
		groupId
	) {
		console.log("- Obter IDs dos membros do grupo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetGroupMembersIds = await session.client.then(async client => {
			return await session.client.getGroupMembersIds(groupId).then((result) => {
				//console.log('Result: ', result); //return object success
				return result;
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"groupId": groupId,
					"message": "Erro ao obter membros do grupo"
				};
				//
			});
		});
		return resultgetGroupMembersIds;
	} //getGroupMembersIds
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Gerar link de url de convite de grupo
	static async getGroupInviteLink(
		SessionName,
		groupId
	) {
		console.log("- Gerar link de convite do grupo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetGroupInviteLink = await session.client.then(async client => {
			return await session.client.getGroupInviteLink(groupId).then((result) => {
				//console.log('Result: ', result); //return object success
				return result;
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"groupId": groupId,
					"message": "Erro ao obter link de convite de grupo"
				};
				//
			});
		});
		return resultgetGroupInviteLink;
	} //getGroupInviteLink
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Criar grupo (título, participantes a adicionar)
	static async createGroup(
		SessionName,
		title,
		contactlistValid,
		contactlistInvalid
	) {
		console.log("- Criando grupo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetGroupInviteLink = await session.client.then(async client => {
			return await session.client.createGroup(title, contactlistValid).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				if (result.status === 200) {
					return {
						"erro": false,
						"status": 200,
						"gid": result.gid.user,
						"contactlistValid": contactlistValid,
						"contactlistInvalid": contactlistInvalid,
						"message": "Grupo criado com a lista de contatos validos"
					};
				} else {
					//
					return {
						"erro": true,
						"status": 404,
						"gid": null,
						"contactlistValid": contactlistValid,
						"contactlistInvalid": contactlistInvalid,
						"message": "Erro ao criar grupo"
					};
					//
				}
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"gid": null,
					"contactlistValid": contactlistValid,
					"contactlistInvalid": contactlistInvalid,
					"message": "Erro ao criar grupo"
				};
				//
			});
		});
		return resultgetGroupInviteLink;
	} //createGroup
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Remove participante
	static async removeParticipant(
		SessionName,
		groupId,
		phonefull
	) {
		console.log("- Removendo participante do grupo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultremoveParticipant = await session.client.then(async client => {
			return await session.client.removeParticipant(groupId, phonefull).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				if (result === true) {
					return {
						"erro": false,
						"status": 200,
						"number": phonefull,
						"message": "Participante removido com sucesso"
					};
				} else {
					//
					return {
						"erro": true,
						"status": 404,
						"number": phonefull,
						"message": "Erro ao remover participante"
					};
					//
				}
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"number": phonefull,
					"message": "Erro ao remover participante"
				};
				//
			});
		});
		return resultremoveParticipant;
	} //removeParticipant
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Adicionar participante
	static async addParticipant(
		SessionName,
		groupId,
		phonefull
	) {
		console.log("- Adicionando participante no grupo");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultaddParticipant = await session.client.then(async client => {
			return await session.client.addParticipant(groupId, phonefull).then((result) => {
				//console.log('Result: ', addParticipant); //return object success
				//
				if (result === true) {
					return {
						"erro": false,
						"status": 200,
						"number": phonefull,
						"message": "Participante adicionado com sucesso"
					};
				} else {
					//
					return {
						"erro": true,
						"status": 404,
						"number": phonefull,
						"message": "Erro ao adicionar participante"
					};
					//
				}
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"number": phonefull,
					"message": "Erro ao adicionar participante"
				};
				//
			});
		});
		return resultaddParticipant;
	} //addParticipant
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Promote participante (Give admin privileges)
	static async promoteParticipant(
		SessionName,
		groupId,
		number
	) {
		console.log("- Promovendo participante do grupo para admin");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultpromoteParticipant = await session.client.then(async client => {
			return await session.client.promoteParticipant(groupId, number).then((result) => {
				//console.log('Result: ', promoteParticipant); //return object success
				//
				if (result === true) {
					return {
						"erro": false,
						"status": 200,
						"number": number,
						"message": "Participante promovido a administrador"
					};
				} else {
					//
					return {
						"erro": true,
						"status": 404,
						"number": number,
						"message": "Erro ao promover participante a administrador"
					};
					//
				}
				//
			}).catch((erro) => {
				console.error('Error when sending: ', erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"number": number,
					"message": "Erro ao promover participante a administrador"
				};
				//
			});
		});
		return resultpromoteParticipant;
	} //promoteParticipant
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Depromote participant (Give admin privileges)
	static async demoteParticipant(
		SessionName,
		groupId,
		phonefull
	) {
		console.log("- Removendo participante do grupo de admin");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultdemoteParticipant = await session.client.then(async client => {
			return await session.client.demoteParticipant(groupId, phonefull).then((result) => {
				//console.log('Result: ', demoteParticipant); //return object success
				//
				if (demoteParticipant === true) {
					return {
						"erro": false,
						"status": 200,
						"number": phonefull,
						"message": "Participante removido de administrador"
					};
				} else {
					//
					return {
						"erro": true,
						"status": 404,
						"number": phonefull,
						"message": "Erro ao remover participante de administrador"
					};
					//
				}
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"number": phonefull,
					"message": "Erro ao remover participante de administrador"
				};
				//
			});
		});
		return resultdemoteParticipant;
	} //demoteParticipant
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Retorna o status do grupo, jid, descrição do link de convite
	static async getGroupInfoFromInviteLink(
		SessionName,
		InviteCode
	) {
		console.log("- Obtendo status do grupo via link de convite");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultgetGroupInfoFromInviteLink = await session.client.then(async client => {
			return await session.client.getGroupInfoFromInviteLink(InviteCode).then((result) => {
				//console.log('Result: ', result); //return object success
				return result;
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao obter link de convite"
				};
				//
			});
		});
		return resultgetGroupInfoFromInviteLink;
	} //getGroupInfoFromInviteLink
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Junte-se a um grupo usando o código de convite do grupo
	static async joinGroup(
		SessionName,
		InviteCode
	) {
		console.log("- Entrando no grupo via link de convite");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultjoinGroup = await session.client.then(async client => {
			return await session.client.joinGroup(InviteCode).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				if (result.status === 200) {
					return {
						"erro": false,
						"status": 200,
						"message": "Convite para grupo aceito com suceso"
					};
				} else {
					//
					return {
						"erro": true,
						"status": 404,
						"message": "Erro ao aceitar convite para grupo"
					};
					//
				}
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao entra no grupo via convite"
				};
				//
			});
		});
		return resultjoinGroup;
	} //joinGroup
	//
	// ------------------------------------------------------------------------------------------------//
	//
}