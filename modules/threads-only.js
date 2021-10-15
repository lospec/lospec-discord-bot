const store = require('data-store');
const configStore = new store({ path: __dirname+'/../CONFIG.json' });

let channelsList = configStore.get('config.threadOnlyChannels');



if (!channelsList || channelsList.length == 0) log({module: 'threads-only'}, 'no threads only channels are defined');
else  {

	//when a message is sent in a threadOnly channel
	new Module('threads-only', 'message', {channel: CONFIG.threadOnlyChannels}, function (message) {

		console.log('posted in thread only channel', message.interaction);

		message.startThread({
			name: title(message.author.username, true) + ' ' + title(message.channel.name),
			autoArchiveDuration: 60 * 24 ,//minutes
			//reason: 'poopoo'
		}).then(newThread => {
			newThread.send('Hiya! I started a thread for you, as this is a thread-only channel. If this was not intended, please archive the thread and delete your comment.')
				.then(botMessage => {
					setTimeout(e => {
						try {
							botMessage.delete().catch(e => console.log('failed to delete'))}
						catch (e) {console.log('failed to delete thread notice')}
					}, 1000 * 60 );
				});
		});
	});

	/*new Module('thread archive', 'message', {filter: /^!deletethread$/i}, function (message) {
		
	});*/
}


function title(string, plural) {
     let newString = string.charAt(0).toUpperCase() + string.slice(1);
    
    if (plural) newString += "'";
    if (plural && string.slice(-1) !== 's') newString += "s";
  
    return newString;
}

/*
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
		});*/