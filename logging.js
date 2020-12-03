function log () {
	let args = Array.from(arguments);

	let name = global.CONFIG?global.CONFIG.botName.toUpperCase():'LOSPEC BOT';

	args.unshift('\x1b[1m'+'\x1b[37m'+'['+name+']'+'\x1b[0m'); //bold + white + text + reset
	console.log.apply(this,args);
}

global.log = log;

/*global Module, CONFIG, client, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod */