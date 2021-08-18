function log () {
	let args = Array.from(arguments);

	//create options, import from first argument if provided
	let options = {};
	if (typeof args[0] == 'object') {
		options = args.shift();
	}

	//get bot name
	options.botname = global.CONFIG?global.CONFIG.botName:'LOSPEC BOT';

	//create log message string
	let message =
				'\x1b[1m'+ //bold
				'\x1b[37m'+	//white
				'['+options.botname.toUpperCase()+']'; //bot name

	//add module name
	if (options.module) message += ' ['+options.module.toUpperCase()+']';

	//add error message
	if (options.error) message += '\x1b[31m'+' ERROR: '+'\x1b[0m'+options.error.message;

	//reset formatting
	message+=	'\x1b[0m';

	//insert text at beginning of array
	args.unshift(message);

	//log it
	console.log.apply(this,args);

	//if debug is enabled and an error was passed, log the error stack
	if (CONFIG.debug && options.error) console.log(options.error);
}

global.log = log;

/*global Module, CONFIG, client, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod */