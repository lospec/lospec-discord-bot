
const PING = {
	command: 'threadping', 
	description: 'Ping all users who have joined your thread (THREAD OWNER ONLY)',
	options: [{
		name: 'message',
		type: 3,
		description: 'Include a message with your ping'
	}]
};

new Module('thread admin ping', 'message', PING, async (interaction) => {


	let threadId = interaction.channelId;


	client.channels.fetch(threadId)
		.then(thread => {
			console.log('thread',thread)
			//MAKE SURE USER is allowed to use this command
			if (thread.type !== 'GUILD_PUBLIC_THREAD') throw 'not a thread';
			if (thread.ownerId !== interaction.user.id) throw 'not thread owner';
			
			return thread.members.fetch();
		})
		.then(threadMembers => {
			
			//get list of pings
			threadMembers = threadMembers.map(m => '<@'+m.id+'>').join(' ');

			//get users message
			let message = interaction.options.getString('message') || 'PING!';

			//console.log(interaction)
			console.log('evertyoin',interaction.guild.roles.everyone)
			
			//send reply
			interaction.reply({ content: threadMembers || '', embeds:[{
				author: {
					name: interaction.user.username,
					icon_url: 'https://cdn.discordapp.com/avatars/'+interaction.user.id+'/'+interaction.user.avatar+'.png',
				},
				description: message
			}]});
		})
		.catch(e=> {
			console.warn('ERROR DOING ADMIN THREAD PING',e);
			return interaction.reply({ content: 'This command can only be used in threads that you own.', ephemeral: true });
			
		});
});
