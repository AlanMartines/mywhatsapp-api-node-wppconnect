const Sessions = require('../controllers/sessions');

module.exports = class Profile {

	/*
	╔═╗┬─┐┌─┐┌─┐┬┬  ┌─┐  ╔═╗┬ ┬┌┐┌┌─┐┌┬┐┬┌─┐┌┐┌┌─┐
	╠═╝├┬┘│ │├┤ ││  ├┤   ╠╣ │ │││││   │ ││ ││││└─┐
	╩  ┴└─└─┘└  ┴┴─┘└─┘  ╚  └─┘┘└┘└─┘ ┴ ┴└─┘┘└┘└─┘
	*/
	//
	// Set client status
	static async setProfileStatus(
		SessionName,
		ProfileStatus
	) {
		console.log("- Mudando o estatus");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultsetProfileStatus = await session.client.then(async client => {
			return await session.client.setProfileStatus(ProfileStatus).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Profile status alterado com sucesso."
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//return erro;
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao alterar profile status."
				};
				//
			});
		});
		return resultsetProfileStatus;
	} //setProfileStatus
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Set client profile name
	static async setProfileName(
		SessionName,
		ProfileName
	) {
		console.log("- Mudando profile name");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultsetProfileName = await session.client.then(async client => {
			return await session.client.setProfileName(ProfileName).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Profile name alterado com sucesso."
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//return erro;
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao alterar profile name."
				};
				//
			});
		});
		return resultsetProfileName;
	} //setProfileName
	//
	// ------------------------------------------------------------------------------------------------//
	//
	// Set client profile photo
	static async setProfilePic(
		SessionName,
		path
	) {
		console.log("- Mudando imagem do perfil");
		await sleep(3000);
		var session = Sessions.getSession(SessionName);
		var resultsetProfilePic = await session.client.then(async client => {
			return await session.client.setProfilePic(path).then((result) => {
				//console.log('Result: ', result); //return object success
				//
				return {
					"erro": false,
					"status": 200,
					"message": "Profile pic alterado com sucesso."
				};
				//
			}).catch((erro) => {
				console.error("Error when:", erro); //return object error
				//
				return {
					"erro": true,
					"status": 404,
					"message": "Erro ao alterar profile pic."
				};
				//
			});
		});
		return resultsetProfilePic;
	} //setProfilePic
	//
	// ------------------------------------------------------------------------------------------------//
	//
}

