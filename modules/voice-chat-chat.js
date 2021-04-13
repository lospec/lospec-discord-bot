const store = require('data-store');
const voiceChatData = new store({ path: __dirname+'/../voice-chat-data.json' });

new Module('join voice channel', 'voiceJoin', {}, function (message, user, data) {
	console.log('joined', user.username, data.channelID);

	let textChannel = voiceChatData.get('channels')[data.channelID];
		if (!textChannel) return;

	//get matching text channel
	client.channels.fetch(textChannel)
		.then(channel => {

			//make channel visible
			channel.overwritePermissions([{
				id: voiceChatData.get('voiceChannelRole'),
				allow: ['VIEW_CHANNEL'],
			}, ], 'bot update');

			channel.send(`**<@!${user.id}> joined the voice channel ${data.selfDeaf?'🔇':'🔊'} ${data.selfMute?'🙊':'🎙'} ${data.streaming?'🖥':''}**`);
		})
		.catch(e=>log({module: 'role manager', error: new Error('failed to fetch matching text channel for voice')}));

});

new Module('leave voice channel', 'voiceLeave', {}, function (message, user, data) {
	console.log('left', user.username, data.channelID);

	let textChannel = voiceChatData.get('channels')[data.channelID];
		if (!textChannel) return;


	//get voice channel
	client.channels.fetch(data.channelID)
		.then(voiceChannel => {

			let membersInVoiceChannel = voiceChannel.members.size;

			//get text channel
			client.channels.fetch(textChannel)
				.then(textChannel => {

					//say the user left (but prevent them from being pinged)
					textChannel.send(`**<@!${user.id}> left the voice channel**`, {"allowedMentions": { "users" : []}});

					//if no more users are in the voice channel
					if (membersInVoiceChannel == 0) {
						//make channel visible
						textChannel.overwritePermissions([{
							id: voiceChatData.get('voiceChannelRole'),
							deny: ['VIEW_CHANNEL'],
						}, ], 'bot update');
					}
				})
				.catch(e=>log({module: 'role manager', error: new Error('failed to fetch matching text channel for voice')}));

		})
		.catch(e=>log({module: 'role manager', error: new Error('failed to fetch voice channel')}));
});


/*global Module, CONFIG, client, guild, log, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod */