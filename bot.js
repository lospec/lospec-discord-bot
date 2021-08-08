const fs = require('fs');
const path = require('path');
const glob = require('glob');
const Discord = require('discord.js');
require('./logging');

////////////////////////////////////////////////////////////////////////////////
//////// CONFIG ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const Store = require('data-store');
const store = new Store({ path: __dirname+'/CONFIG.json' });
const CONFIG = Object.assign({},store.get('config'));
CONFIG.botName = CONFIG.botName||'Discord Bot';
CONFIG.emojiTimeout = CONFIG.emojiTimeout||500;
CONFIG.debug = CONFIG.hasOwnProperty('debug')?CONFIG.debug:true;
CONFIG.logIncomingEvents = CONFIG.hasOwnProperty('logIncomingEvents')?CONFIG.logIncomingEvents:true;
CONFIG.exitOnUncaughtException = CONFIG.hasOwnProperty('exitOnUncaughtException')?CONFIG.exitOnUncaughtException:true;
global.CONFIG = CONFIG;

//make sure token is configured
if (!CONFIG.token || CONFIG.token == 'PASTE YOUR TOKEN HERE' || CONFIG.token == '') {
	console.log('toke',CONFIG.token)
	try {
		console.log(fs.readFileSync(__dirname+'/intro.txt','utf-8'));
		
	} catch (err) {
		console.log("\n Oof, we've got a problem. I think you dont have the right permissions to read things in this folder. Try running this command:\n chmod -R 755 .\nMore Info:\n\n");
		console.error(err);
	}

	store.set('config.token', 'PASTE YOUR TOKEN HERE');

	process.exit();
}

log('booting up...');

//const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const client = new Discord.Client({ intents: [
	Discord.Intents.FLAGS.GUILDS, 
	Discord.Intents.FLAGS.GUILD_BANS, 
	Discord.Intents.FLAGS.GUILD_VOICE_STATES, 
	Discord.Intents.FLAGS.GUILD_MESSAGES,
	Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	Discord.Intents.FLAGS.DIRECT_MESSAGES,
	Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
]});

////////////////////////////////////////////////////////////////////////////////
//////// MODULE PROCESSING /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var modules = [];

//when an event is triggered, search for a matching module and execute it
function checkModules (event, user, message, reaction, data) {

	//ignore events from bots
	if (user.bot) return;

		console.log(event[0], message?message.channel.type:'');

    //print messages to console
    if (CONFIG.logIncomingEvents) {
		if (event.includes('voice')) console.log('  ',event[0].toUpperCase(),user.username+':');
		else if (event == 'dm') console.log('  ',event[0].toUpperCase(),user.username+':',reaction?reaction._emoji.name:message.content);
		else console.log('  ',event[0].toUpperCase(),'#'+message.channel.name.toUpperCase(),user.username+':',reaction?reaction._emoji.name:message.content);
    }

	//loop through each defined module until a matching one is found
	let foundMatch = false;
    for (var i = 0; i < modules.length; i++) {
        var module = modules[i];

		//continue searching if any of the properties don't match
		if (module.event != event) continue; //wrong event
		if (module.channel != '*' && module.channel != message.channel.id && !module.channel.includes(message.channel.id)) continue; //wrong channel

		if (module.permissions && message.member && !message.member.permissions.has(module.permissions)) continue; //message was from a bot
		if (module.pingBot && [...message.mentions.users.values()].filter(u => u.id == client.user.id) < 1) continue; //bot was not pinged
		if (message && !module.filter.test(message.content)) continue; //filter mismatch

		//rate limit
		if (module.rateLimit) {
			let lastTriggered = store.get('lastTriggered.'+module.name);

			//if the command is over the rate limit
			if (new Date() - new Date(lastTriggered) < 1000*60*module.rateLimit) {
				if (typeof module.overLimit == 'function') module.overLimit(message, user);
				continue;
			}
		}

		//execute module
		try {
			var result = module.func(message, user, reaction || data);
		} catch (err) {
			log({module: module.name, error:err});
			continue;
		}

		if (result == 'CONTINUE') continue;
		store.set('lastTriggered.'+module.name, new Date());
		if (!module.stopOnMatch) continue;

		//stop looking for bot matches
		foundMatch = true;
        break;

    }

    //bot was pinged but not matched, react confused
    if (!foundMatch && event=='message' && [...message.mentions.users.values()].filter(u => u.id == client.user.id) > 0) {
    	react(message,'hmm');
    }
}

class Module {
	constructor (name, event, options, func) {
		//defaults
		this.name = name;
	    this.event = event;
	    this.options = {};
		this.func = func;

		//make sure required fields are there
		if (!this.func || !this.event || !this.name) return log({module: this.name||'unnamed module', error: new Error('module missing required fields')});

	    //allow user to pass just a regex filter for options
	    if (options instanceof RegExp) options = {filter: options};

	    //set options
	    this.filter = options.filter || /.+/;
	    this.channel = options.channel || '*';
	    this.pingBot = options.pingBot || false;
	    this.stopOnMatch = options.stopOnMatch || true;
	    this.rateLimit = options.rateLimit;
	    this.overLimit = options.overLimit || function () {};
	    this.permissions = options.permissions;

		//show warning if the g flag was added to filter, as it breaks .test()
		if (this.filter.flags.includes('g'))
			log('\x1b[1m'+'\x1b[37m'+'['+this.name.toUpperCase()+']'+'\x1b[33m'+' WARNING:'+'\x1b[0m','including g flag on filters will most likely break things');

		//keep track of when it was last triggered for ratelimits
		this.lastTriggered = store.get('lastTriggered.'+this.name);
		if (!this.lastTriggered) store.set('lastTriggered.'+this.name, new Date());



	    //add to array of modules
	    modules.push(this);
	}
}

////////////////////////////////////////////////////////////////////////////////
//////// EVENT LISTENERS ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


client.on('messageCreate', (message) => {
	if (message.channel.type == 'dm')
		checkModules('dm',message.author, message);
	else
		checkModules('message',message.author, message);
});

client.on('messageReactionAdd', (reaction, user) => {
	checkModules('react',user,reaction.message,reaction);
});

client.on('messageReactionRemove', (reaction, user) => {
	checkModules('unreact',user,reaction.message,reaction);
});

client.on('voiceStateUpdate', (oldState, newState) => {

	//user left a channel
	if (newState.channelID === null) checkModules('voiceLeave', newState.member.user, null, null, oldState);

	//user joined a channel
	else if (oldState.channelID === null) checkModules('voiceJoin', newState.member.user, null, null, newState);

	//user moved from one channel to the other
	else if (oldState.channelID !== newState.channelID) {
		checkModules('voiceLeave', newState.member.user, null, null, oldState);
		checkModules('voiceJoin', newState.member.user, null, null, newState);
	}
});

////////////////////////////////////////////////////////////////////////////////
//////// UTILITY FUNCTIONS /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

//send a message
function send(message, text) {
	message.channel.send(text);
}

//add a reaction to a message
function react(message, emojiArray) {

	//if not an array, convert to an array
	if (!Array.isArray(emojiArray)) emojiArray = [emojiArray];

	//loop through each option, adding the emoji
	for (var i = 0; i < emojiArray.length; i++) {

		console.log('\tsending emoji',(i+1)+'/'+emojiArray.length,emojiArray[i]);

		let e = emojiArray[i];

		//do a timeout since doing them all at once makes them display in a random order
		setTimeout(()=>{

			//try to find an emoji with a matching name on the server
			var matchedEmoji = message.guild.emojis.cache.find(emoji => emoji.name === e);

			//emoji was found, send that
			if (matchedEmoji)
				message.react(matchedEmoji)
					.catch(()=>{throw new Error('failed to react with '+matchedEmoji)});

			//emoji not found (assume generic emoji and try to send)
			else
				message.react(e)
					.catch(()=>{throw new Error('emoji '+matchedEmoji+' not found')});

		}, CONFIG.emojiTimeout*i);
	}
}

//send a single emoji message
function sendEmoji(message, emojiName) {
	var emoji = message.guild.emojis.find(emoji => emoji.name === emojiName);
	message.channel.send('<:'+emoji.name+':'+emoji.id+'>')
		.catch(console.warn);
}

//pick a random item from an array
function pickRandom (optionsArray) {
	return optionsArray[Math.floor(Math.random()*optionsArray.length)];
}

//make functions global so they're available in included modules
global.Module = Module;
global.send = send;
global.react = react;
global.sendEmoji = sendEmoji;
global.pickRandom = pickRandom;
global.client = client;



////////////////////////////////////////////////////////////////////////////////
//////// STARTUP ///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

//load each module in modules folder
glob.sync('/modules/*.js', {root: __dirname}).forEach(filepath => {
	let extension = path.extname(filepath);
	let file = path.basename(filepath,extension);

	//require patch, and catch any init errors so they can be printed to the console
	try {
		require(filepath);
	}
	catch (err) {
		log({module: file, error:err});
	}

	log({module:file},'loaded');
});

//catches and logs error messages not caught by trycatch around require()
process.on('uncaughtException', function(err){
	let logLineDetails = ((err.stack).split("at ")[1]).trim();
	let firstLine = logLineDetails = /\((.+):\d+:\d+\)/gi.exec(logLineDetails)[1];
	let extension = path.extname(firstLine);
	let filename = path.basename(firstLine,extension);

	//log
	log({module: filename, error:err});
	console.log('\n\n This error was produced by an uncaught exeption, the bot may be in an usable state so it\'s shutting down. To keep the bot running, you can either set exitOnUncaughtException to false in the config (not reccomended), or you can use a process manager to restart the bot when it crashes (such as PM2).');
	if (CONFIG.exitOnUncaughtException) process.exit();
});

//when bot is connected
client.once('ready', () => {
	//store guild info
	global.guild = client.guilds.cache.first();

	//if bot name hasn't been set yet, store it
	if (!store.get('config').botName) {
		store.set('config.botName',client.user.username);
		log('set bots name to',client.user.username);
	}

	log('connected to',guild.name,'as',client.user.username);
});

//log bot in
client.login(CONFIG.token);

/*global log, guild*/