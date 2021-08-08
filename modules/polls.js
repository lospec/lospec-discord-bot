
const pollIndex = [
	'🇦','🇧','🇨','🇩','🇪','🇫','🇬','🇭','🇮','🇯','🇰','🇱','🇲','🇳','🇴','🇵','🇶','🇷','🇸','🇹','🇺','🇻','🇼','🇽','🇾','🇿',
	'0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟',
	'⏺️','🔼','⏹️',
	'🎦','📶','ℹ️','#️⃣','*️⃣','🆖','🆗','🔀','🔄','⏫','⏬','⏪','⏩','⏸️','⏏️',
	'🅰️','🅱️','🆎','🆑','🅾️',
	'⛎','♈','♉','♊','♌','♍','♎','♏','♋','♐','♑','♒','♓',
	'☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐',
	'🆔','⚛️',
	'♾️','Ⓜ️','⛔','☢️','📳','📴','🛣️','🏞️','🌅','🌄','🌠','🏙️','🌁','🌌'
];

new Module('poll', 'message', /^!poll/i, function (message) {

	var options = message.content
		.replace('!poll ','')		//remove poll command
		.split(',')					//split into array by comma
		.map(o => o.trim())			//remove space at beginning/end
		.filter(o => o.length > 0);	//remove empty options

	//options not found
	if (!options || options.length < 2) {
		react(message, 'hmm');
		return;
	}

	if (options.length > 100) return react(message,'mad');

	let title = 'POLL:';
	//user put a ? and then a comma
	if (options[0].endsWith('?')) {
		title += ' '+options.shift();
	}
	//user just put a ? and then the first option
	else if (options[0].includes('?')) {
		let titleSplit = options[0].split('?');
		title += ' '+titleSplit[0]+'?';
		options[0] = titleSplit[1].trim();
	}

	//create poll message
	let pollContent = options.map((o,i) => pollIndex[i]+' '+o).join('\n');
	let embed = {
		embed: {
			description: pollContent,
			title: title,
			author: {
		      name: message.author.username,
		      icon_url: 'https://cdn.discordapp.com/avatars/'+message.author.id+'/'+message.author.avatar+'.png'
		    },
	    },
	};

    //send message
    message.channel.send(embed)
		.then(pollMessage => {

    		var optionsToSend = pollIndex.slice(0,options.length);

    		console.log('adding',optionsToSend.length,'options')

    		//add reactions
			react(pollMessage, optionsToSend.splice(0,20));

			var loop = 0;

			while (optionsToSend.length > 0 && loop <= 5) {
				loop++;
				let l = loop;
				let additionalOptions = optionsToSend.splice(0,20);

				message.channel.send('** **')
					.then(additionalOptionsMessage => {
			    		//add reactions
			    		setTimeout(()=> {
			    			react(additionalOptionsMessage, additionalOptions);
			    		}, CONFIG.emojiTimer*20*l);
					});
			}
    	});

	//delete the poll request
    //message.delete();
});


/*global Module, CONFIG, client, log, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod */
