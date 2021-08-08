
new Module('say', 'message', {filter: /^!say <#\d.+> .+/i, permissions: 'MANAGE_MESSAGES'}, function (message) {

	if (message.author.id == CONFIG.adminId) console.log('good');
	else throw new Error(message.author.username + ' tried to use the !say command...');

	//get count from bot, limit to 10
	let textToSend = message.content.split(' ');

	let channelId  = textToSend[1].replace(/[<#>]+/g, '').trim();

	textToSend.shift(); textToSend.shift();
	textToSend = textToSend.join(' ').trim();

	console.log('send to "'+channelId+'"')

	console.log('in channel',channelId,'SAY',textToSend);

	client.channels.cache.get(channelId).send(textToSend);

	message.delete();
});

new Module('embed', 'message', {filter: /^!embed <#\d.+> .+/i, permissions: 'MANAGE_MESSAGES'}, function (message) {

	if (message.author.id == CONFIG.adminId) console.log('good');
	else throw new Error(message.author.username + 'tried to use the !say command...');

	//get count from bot, limit to 10
	let options = message.content.split(' ');

	let channelId  = options[1].replace(/[<#>]+/g, '').trim();

	options.shift(); options.shift();
	options = options.join(' ').trim();

	//split the text by the matching key followed by :
	options = options.split(/ (?=title|description|image|message|thumbnail)/gi);

	console.log('options:',options,'\n\nsdfsdf')

	//create embed options object
	let content = '';
	let embed = {};
	options.forEach(o => {
		let d = o.split(/:(.+)/); //split into key and value, by the first : instance
		let key = d.shift(); // remove first array item as it's the key
		let prop = d.join('').trim(); //merge rest of array and remove spaces around value

		//images (needs a special object format)
		if (key == 'image' || key == 'thumbnail') embed[key] = { url: prop };

		//add a message above the embed, where you can ping people
		else if (key == 'message') content+=prop;

		//all other generic string values
		else embed[key] = prop;
	});

	console.log('in channel',channelId,'POST EMBED:',embed);

	client.channels.cache.get(channelId).send({content: content, embed: embed});

	//message.delete();
});

/*global Module, log, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod, CONFIG, client */