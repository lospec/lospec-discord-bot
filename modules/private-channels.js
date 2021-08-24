
//base command
const CMD = '(!channel|!ch|!c)';

//add user to channel
new Module('private channel add', 'message', {filter: new RegExp('^'+CMD+' +add +<@!?\\d+>','i'), permissions: 'MANAGE_MESSAGES'}, function (message,user) {
	let args = message.content.split(/ +/g);
	let targetUserId = args[2].replace(/[^0-9]/gi, '');

	message.channel.updateOverwrite(targetUserId, { VIEW_CHANNEL: true });
});

//add user to another channel
new Module('private channel add', 'message', {filter: new RegExp('^'+CMD+' +add +<#\\d.+> +<@!?\\d+>','i'), permissions: 'MANAGE_MESSAGES'}, function (message,user) {
	let args = message.content.split(/ +/g);
	let targetChannel = args[2].replace(/[<#>]+/g, '').trim();
	let targetUserId = args[3].replace(/[^0-9]/gi, '');

	client.channels.cache.get(targetChannel).updateOverwrite(targetUserId, { VIEW_CHANNEL: true });

	react(message,'check');
});

//remove user to channel
new Module('private channel kick', 'message', {filter: new RegExp('^'+CMD+' +kick +<@!?\\d+>','i'), permissions: 'MANAGE_MESSAGES'}, function (message,user) {
	let args = message.content.split(/ +/g);
	let targetUserId = args[2].replace(/[^0-9]/gi, '');

	message.channel.updateOverwrite(targetUserId, { VIEW_CHANNEL: false });
});


/*global CONFIG, client, Module, log, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod */