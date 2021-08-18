const fs = require('fs');
const jokes = fs.readFileSync(__dirname+'/../jokes.txt','utf-8').split('\n');

const overText = CONFIG.jokeOverLimitText || 'Sorry, I can\'t think of any others right now.';

new Module('humor', 'message', {command: 'joke', description: "I'll tell you a funny low-spec joke!", rateLimit: CONFIG.jokeRateLimit||3, overLimit: i=> {interaction.reply(overText)}}, (interaction) => {

	//get random joke
	var randomJoke = pickRandom(jokes);

	//convert to message format
	var jokeText = randomJoke.split('?');
	jokeText = jokeText[0].trim() + '? ||' + jokeText[1].trim() + '||';

	//send
	interaction.reply(jokeText);
});

/*global Module, CONFIG, client, log, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod */