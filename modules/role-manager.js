const store = require('data-store');
const roleManagerData = new store({ path: __dirname+'/../role-manager-data.json' });

new Module('role manager', 'react', {}, function (message,user,reaction) {
	if (!reaction) throw new Error('reaction is null');

	let ROLEMANAGERS = roleManagerData.get();

	//get role manager based on the message id
	let roleManager = Object.keys(ROLEMANAGERS).find((k,i) => ROLEMANAGERS[k].messageId == reaction._emoji.reaction.message.id);
	if (!roleManager) return 'CONTINUE';
	roleManager = ROLEMANAGERS[roleManager];

	let matchedReaction = roleManager.roles.find(r => r.emoji == reaction._emoji.id || r.emoji == reaction._emoji.name);

	//if the reaction wasn't matched - remove it and exit
	if (!matchedReaction) {
		//remove the reaction
		reaction._emoji.reaction.remove(message.user)
			.then(e=>log({module: 'role manager'},'reaction removed: ',reaction._emoji.name,'['+reaction._emoji.id+']','by',user.username))
			.catch(e=>log({module: 'role manager', error: new Error('failed reaction removal '+reaction._emoji.name+' ['+reaction._emoji.id+'] by'+user.username)}));

		return;
	}

	//get the "guild member" (user relative to server), and add the role to them
	reaction.message.channel.guild.members.fetch(user.id)
		.then(guildMember=> {
			//give user role base on matched emoji
			guildMember.roles.add(matchedReaction.role)
				.then(e=>log({module: 'role manager'},'gave',user.username,matchedReaction.name,'role'))
				.catch(e=>log({module: 'role manager', error: new Error('maybe failed to give '+user.username+' '+matchedReaction.name+'role')}));
			})
		.catch(d => log({module: 'role manager', error: new Error('failed to get guild member')}));
});


new Module('role manager', 'unreact', {}, function (message,user,reaction) {
	if (!message) return; 
	if (!reaction) throw new Error('reaction is null');

	let ROLEMANAGERS = roleManagerData.get();

	//get role manager based on the message id
	let roleManager = Object.keys(ROLEMANAGERS).find((k,i) => ROLEMANAGERS[k].messageId == reaction._emoji.reaction.message.id);
	if (!roleManager) return 'CONTINUE';
	roleManager = ROLEMANAGERS[roleManager];

	let matchedReaction = roleManager.roles.find(r => r.emoji == reaction._emoji.id || r.emoji == reaction._emoji.name);

	//if the reaction wasn't matched - this probably can't happen, but just ignore it
	if (!matchedReaction) return;

	//get the "guild member" (user relative to server), and add the role to them
	reaction.message.channel.guild.members.fetch(user.id)
		.then(guildMember=> {
			//give user role base on matched emoji
			guildMember.roles.remove(matchedReaction.role)
				.then(e=>console.log('\tremoved',user.username,matchedReaction.name,'role'))
				.catch(e=>console.log('\tmaybe failed to remove',user.username,matchedReaction.name,'role'));
			})
		.catch(d => console.log('failed to get guild member',d));
});



/*global Module, CONFIG, client, guild, log, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod */