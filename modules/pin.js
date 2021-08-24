
new Module('role manager', 'react', {}, function (message,user,reaction) {
	if (reaction._emoji.name !== '📌') return 'CONTINUE';

	//react(message,'📌');
	console.log('pin',reaction.message.reactions.cache.get('📌').count)


});




/*global CONFIG, client, Module, log, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod */