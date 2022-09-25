const store = require('data-store');
const fs = require('fs');

//say a random phrase at a random interval
const phrases = fs.readFileSync(__dirname+'/../phrases.txt','utf-8').split('\n');
setInterval(()=>{

	if (!CONFIG.botChatChannel)	return;

	let randomItem = '';

	let check = Math.random();
	let chance = CONFIG.botChatChance || 0.001;
	if (check > chance) return;
	randomItem = pickRandom(phrases);
	
	console.log('sending bot chat to ',CONFIG.botChatChannel);

	//send it
	client.channels.fetch(CONFIG.botChatChannel)
		.then(channel => channel.send(randomItem))
		//.catch(e=>{throw new Error('failed to fetch botChatChannel')});
		.catch(e=>{console.error('failed to fetch bot channel',e)});
}, 1000 * 5);


//dont say vibing.
new Module('vibing', 'message', /\bv\s*[i1!|]\s*b\s*[i1!|]\s*n/i, function (message) {
	react(message, 'mad');
});


new Module('pineapplepizza', 'message', /^(?=.*?(pineapple))(?=.*?(pizza))/i, function (message) {
	react(message, 'mad');
});

const greetings = ['Hey!','Hi!','Yo','Hello','\'sup','Hellloooooo!','Hidey-ho!','Heya!','Ahoy!','Hey, how\'s it goin\'?','<:soup:713879618746318959>'];
new Module('hello', 'message', {filter: /\b(hello|hi|sup|how|yo|hey|soup|howdy|<:soup:713879618746318959>|g'day|morning|mornin'|ahoy|oi|buenos dias|hoi|hallo|hola|bonjour|guten tag|yasou|shalom|namast|jo napot|salve|konnichiwa|salam|ola)\b/i, pingBot: true}, function (message) {
	message.channel.send(pickRandom(greetings));
});

new Module('compliment', 'message', {filter: /\b(good|goodbot|nice|great|awesome|cute|friendly|dope|cool|best|gj|smart)\b/i, pingBot: true}, function (message) {
	react(message,'flattered');
});

new Module('mean', 'message', {filter: /\b(bad|badbot|stupid|ugly|dumb|idiot|moron|butt|poop|worst)\b/i, pingBot: true}, function (message) {
	react(message,pickRandom(['coolsob','sob~1','miffed']));
});

new Module('nft reply', 'message', {filter: /NFT/i, pingBot: true}, function (message) {
	message.reply({ content: 'no freaking thanks', allowedMentions: { repliedUser: true }});
});


//dont say vibing.
new Module('nft say', 'message', /NFT/i, function (message) {
	react(message, 'mad');
});

new Module('sentient', 'message', {filter: /\b(real|alive|conscious|aware|sentient)\b/i, pingBot: true}, function (message) {
	react(message,'think');
});



/*global Module, CONFIG, client, log, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod */