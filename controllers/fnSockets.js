module.exports = class Sockets {
	constructor(io) {
		this.io = io;
	}
	//emitindo mensagem que qrcode mudou 
	qrCode(session, data) {
		this.io.emit('qrcode', data);
		return true;
	}

	//mudando statusFind
	statusFind(session, data) {
		this.io.emit('statusFind', data);
		return true;
	}
	//detectando start do servidor
	start(session, data) {
		this.io.emit('start', data);
		return true;
	}
	//enviando mensagem como emissor
	messagesent(session, data) {
		this.io.emit('messagesent', data);
		return true;
	}
	//recebendo mensagens
	message(session, data) {
		this.io.emit('message', data);
		return true;
	}
	//mudando status
	stateChange(session, data) {
		this.io.emit('stateChange', data);
		return true;
	}
	//webhook para detecção de alteracoes de status nas mensagens
	ack(session, data) {
		this.io.emit('ack', data);
		return true;
	}
	//Função para emitir mensagens de status
	events(session, data) {
		this.io.emit('events', data)
	}
	//Função para emitir um alerta
	alert(session, data) {
		this.io.emit('alert', data);
		return true;
	}
}