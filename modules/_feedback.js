const store = require('data-store');
const configStore = new store({ path: __dirname+'/../CONFIG.json' });

const CHANNEL = '506277390050131978'


let text= [
	'Hiya! I started a feedback thread for you, as this is a thread-only channel. If this was not intended, please archive the thread and delete your comment.',
	'Summoning all <@&1077243339147055205> to help! \nJoin the critiquers by clicking **Channels & Roles** in the sidebar, and select **"Critiquers"** under **"When do you want to be pinged?"**.'
].join('\n\n')



//when a message is sent in a threadOnly channel
new Module('feedback', 'message', {channel: CHANNEL}, function (message) {
	console.log('posted in feedback channel', message.interaction);

	if (message.member.bot) return; //message was from a bot, dont make it a thread

	message.startThread({
		name: title(message.author.username, true) + ' ' + title(message.channel.name),
		autoArchiveDuration: 60 * 24 ,//minutes
	}).then(newThread => {
		newThread.send(text)
			.then(botMessage => {
				console.log('feedback thread started', newThread.id);
			});
	});
});


function title(string, plural) {
     let newString = string.charAt(0).toUpperCase() + string.slice(1);
    
    if (plural) newString += "'";
    if (plural && string.slice(-1) !== 's') newString += "s";
  
    return newString; 
}
