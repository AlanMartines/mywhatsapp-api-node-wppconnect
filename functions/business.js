
const Sessions = require('../controllers/sessions');

module.exports = class business {

	static async addProduct(req, res) {
		let { session, number, name, image, addittionalImg, url, price, currency, description, code, isHidden } = req.body;
		let data = Sessions.getSession(session)
		// let phone = await Sessions?.getCache(number)
		// let product = {
		//     name: name,
		//     imageCdnUrl: image,
		//     url: url,
		//     additionalImageCdnUrl: addittionalImg,
		//     isHidden: isHidden,
		//     priceAmount1000: price,
		//     currency: currency,
		//     description: description,
		//     retailerId: code
		// };
		let client = data.client
		client?.page?.evaluate(async () => {
			let product = {
				name: 'Honda Fit',
				imageCdnUrl: 'https://img.olx.com.br/images/30/308177334484850.jpg',
				url: 'https://docs.browserless.io/',
				additionalImageCdnUrl: ["https://img.olx.com.br/images/30/309158578742280.jpg,https://img.olx.com.br/images/30/308180330399512.jpg,https://img.olx.com.br/images/30/306154693457018.jpg"],
				isHidden: false,
				priceAmount1000: 15,
				currency: 'BRL',
				description: 'Honda Fit cambio automatico 2010',
				retailerId: 1
			};

			let Catalogo = await window.Store.Catalog.get('554391798832@c.us');
			console.log(Catalogo)
			//let result = Catalogo.addProduct(product);
			// res.status(200).json({
			//     result: Catalogo.productCollection.serialize()
			// })
		})
		// async function add(data, phone, product) {
		//     let to = '554391798832@c.us';
		//     await data.client?.page?.evaluate(async () => {
		//         let Catalogo = await Store.Catalog.find(Store.WidFactory.createWid(to));
		//         let result = await Catalogo.addProduct(product);
		//         res.status(200).json({
		//             result: result
		//         })
		//     });
		// }
		// add(data, phone, product)
	}

	// static async addProduct(session, number, name, image, addittionalImg, url, price, currency, description, code) {
	//     await data.client?.page?.evaluate(async () => {
	//         let data = Sessions.getSession(session)
	//         let phone = await Sessions?.getCache(number)
	//         let Catalogo = await Store.Catalog.find(Store.WidFactory.createWid(phone));
	//         var product = {
	//             name: name,
	//             imageCdnUrl: image,
	//             url: url,
	//             additionalImageCdnUrl: addittionalImg,
	//             isHidden: isHidden,
	//             priceAmount1000: price,
	//             currency: currency,
	//             description: description,
	//             retailerId: code
	//         };
	//         console.log(product)
	//         let result = await Catalogo.addProduct(product);
	//         console.log(result)
	//     })


	//     await data.client.page?.evaluate(async () => {
	//         let { session, number } = req.body;
	//         let data = Sessions.getSession(session)
	//         let phone = await Sessions?.getCache(number)
	//         let catalog = window.Store.Catalog.get(phone);
	//         if (!catalog) {
	//             catalog = await window.Store.Catalog.find(Store.WidFactory.createWid(phone));
	//         }

	//         if (!catalog) {
	//             throw {
	//                 error: true,
	//                 code: 'catalog_not_found',
	//                 message: 'Catalog not found',
	//             };
	//         }

	//         if (catalog.productCollection) {
	//             res.status(200).send(catalog.productCollection.serialize())
	//         }

	//         return [];
	//     })
	// }


	static async getOrderbyMsg(req, res) {
		let { session, messageid } = req?.body;
		let data = Sessions?.getSession(session)
		if (!messageid) {
			return res?.status(400)?.json({
				status: 400,
				error: "MessageID não foi informado, é obrigatorio"
			})
		}
		else {
			try {
				let response = await data?.client?.getOrderbyMsg(messageid);
				return res?.status(200)?.json({
					result: 200,
					type: 'order',
					session: session,
					data: response
				})

			} catch (error) {
				return res?.status(200)?.json({
					"result": 400,
					"status": "FAIL",
					"error": error
				})
			}
		}
	}

}