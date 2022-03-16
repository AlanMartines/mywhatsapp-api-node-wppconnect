const fs = require('fs-extra');
const pinoms = require('pino-multi-stream')

const prettyStream = pinoms.prettyStream(
	{
		prettyPrint:
		{
			colorize: true,
			translateTime: "dd-mm-yyyy HH:MM:ss",
			ignore: "pid,hostname" // add 'time' to remove timestamp
		},
	}
);

const streams = [
	//{ stream: fs.createWriteStream(`${process.cwd()}/logs/info.log`, { flags: 'a' }) },
	{ stream: prettyStream },
	{ level: 'debug', stream: fs.createWriteStream(`${process.cwd()}/logs/debug.log`, { flags: 'a' }) },
	{ level: 'fatal', stream: fs.createWriteStream(`${process.cwd()}/logs/fatal.log`, { flags: 'a' }) }
]

const logger = pinoms(pinoms.multistream(streams))

module.exports = logger
