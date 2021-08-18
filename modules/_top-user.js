const store = require('data-store');
const topUserData = new store({ path: __dirname+'/../top-user-data.json' });

const topUserRoleId = '839480902563659836';
const MINACTIVEDAYS = 4;
const MINMESSAGES = 5;
const CHECKFREQUENCY = 1000*60*30; //30 minutes
const REFRESHFREQUENCY = 1000*60*60*24; //1 day

setInterval(() => {
	let lastTrigger = CONFIGstore.get('lastTriggered.topUserRecount');

	//exit if bot was triggered within the refresh frequency
	if (lastTrigger && new Date() - new Date(lastTrigger) < REFRESHFREQUENCY) return;

	//mark the time it was checked
	CONFIGstore.set('lastTriggered.topUserRecount', new Date());

	refreshActiveUsers();

}, CHECKFREQUENCY);

new Module('top user', 'message', {}, function (message,user) {
	let currentDay = String(Math.floor(new Date().getTime() / 1000 / 60 / 60 / 24));

	//if hour doesnt exist yet, add it
	if (!topUserData.has(currentDay)) topUserData.set(currentDay, {});

	//if user record in hour doesn't exist yet, add it
	if (!topUserData.has(currentDay+'.'+user.id)) topUserData.set(currentDay+'.'+user.id, 1);
	else topUserData.set(currentDay+'.'+user.id, topUserData.get(currentDay+'.'+user.id)+1);

	//allow the bot to coninue checking this message to match other modules
	return 'CONTINUE';
});

//admin trigger of refreshing users manually
new Module('say', 'message', {filter: /^!refreshactiveusers$/i, permissions: 'MANAGE_MESSAGES'}, refreshActiveUsers);

async function refreshActiveUsers () {
	log('refreshing active users');

	let server = await client.guilds.cache.get('506164002003484673');

	//let role = await server.roles.cache.get('554764628920631306');

	if (!server) return log({module: 'top users', error: new Error('failed to fetch guild')});

	//get all users in server
	server.members.fetch().then(members => {

		//find only members with role, loop through them
		let membersWithRole = members.filter(m => m._roles.includes(topUserRoleId));

		//if no members have role, just start giving out role
		if (!membersWithRole.first()) return populateRoleMembers();

		//loop through members
		membersWithRole.each(m => {
			//remove the role
			m.roles.remove(topUserRoleId)
				.then(e=> {
					console.log('\tdeactivated',m.user.username);

					//if this is the last user that needs to be checked, move onto the next step
					if (m.user.id == membersWithRole.last().user.id) populateRoleMembers();
				})
				.catch(e=>console.log('\tmaybe failed to remove',m.user.username));
		});
	}).catch(console.error);
}

async function populateRoleMembers () {
	log('distributing active user role');

	let currentDay = String(Math.floor(new Date().getTime() / 1000 / 60 / 60 / 24));

	let pastWeek = [currentDay, currentDay-1, currentDay-2, currentDay-3, currentDay-4, currentDay-5, currentDay-6];

	let usersFound = {};

	pastWeek.forEach(day => {
		let dayData = topUserData.get(String(day));

		Object.keys(dayData).forEach(u => {
			if (!usersFound[u])	usersFound[u] = 0;
			if (dayData[u] > MINMESSAGES) usersFound[u]++;
		});
	});

	let server = await client.guilds.cache.get('506164002003484673');

	Object.keys(usersFound).forEach(u => {
		if (usersFound[u] < MINACTIVEDAYS) return;
		console.log('user',u,'has',usersFound[u],'days');

		//fetch member
		server.members.fetch(u)
			.then(guildMember=> {
				//give user role
				guildMember.roles.add(topUserRoleId)
					.then(e=>log('gave',guildMember.user.username,' active user role'))
					.catch(e=>log({module: 'top users', error: new Error('maybe failed to give '+guildMember.user.username+'active user role')}));
				})
			.catch(d => log({module: 'top users', error: new Error('failed to get guild member "'+u+'"')}));
	});

}


/*global CONFIG, CONFIGstore, client, Module, log, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod */