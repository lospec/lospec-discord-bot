
new Module('mod delete', 'message', {filter: /^!delete \d+$/i, permissions: 'MANAGE_MESSAGES'}, function (message) {

	//get count from bot, limit to 10
	let messagesToDelete = Math.min(message.content.split(' ')[1], CONFIG.deleteLimit||10);
	messagesToDelete++;

	//loop through and delete them
    message.channel.messages.fetch({ limit: messagesToDelete })
	    .then(messages => {
	    	messages.forEach(m => {
	    		log('deleting message:',m.content);
	    		m.delete();
	    	});
	    })
		.catch(() => {
			react(message, 'x_');
			throw new Error('failed to fetch messages');
		});
});

/*global Module, CONFIG, log, send, react, sendEmoji, pickRandom */