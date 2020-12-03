const fs = require('fs');
const jokes = fs.readFileSync(__dirname+'/../jokes.txt','utf-8').split('\n');

new Module('humor', 'message', {filter: /\bjoke\b/i, rateLimit: CONFIG.jokeRateLimit||3, pingBot: true, overLimit: overLimit}, getJoke);
new Module('humor', 'message', {filter: /^!joke$/i, rateLimit: CONFIG.jokeRateLimit||3, overLimit: overLimit}, getJoke);

function getJoke (message) {

	//get random joke
	var randomJoke = pickRandom(jokes);

	//convert to message format
	var jokeText = randomJoke.split('?');
	jokeText = jokeText[0].trim() + '? ||' + jokeText[1].trim() + '||';

	//send
	message.channel.send(jokeText);

}

function overLimit (m) {
	send(m,(CONFIG.jokeOverLimitText||'Sorry, I can\'t think of any others right now.'));
}

/*global Module, CONFIG, client, log, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod */