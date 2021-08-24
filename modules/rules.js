const store = require('data-store');
const rulesData = new store({ path: __dirname+'/../rules-data.json' });

const rules = rulesData.get('rules');

const COMMAND = {
	command: 'rule', 
	description: 'display a lospec discord server rule', 
	options: [{
		name: 'rule',
		type: 4,
		description: 'Rule Number (1 - 8)',
		required: true
	}]
};

new Module('rules display', 'message', COMMAND, async (interaction) => {
	console.log('match');

	let ruleNumber = interaction.options.getInteger('rule');

	let ruleTitle = Object.keys(rules);
	let ruleValue = Object.values(rules);

	//exit if rule number invalid
	if (ruleNumber < 1 || ruleNumber > ruleTitle.length) return 'CONTINUE';

	//send embed containing rule
	message.channel.send({embeds: [{
		title: 'RULE #'+ruleNumber+': '+ruleTitle[ruleNumber-1].toUpperCase(),
		description: ruleValue[ruleNumber-1]
	}]});
});



/*global CONFIG, client, Module, log, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod */