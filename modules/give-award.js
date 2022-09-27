const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const store = require('data-store');
const Bank = require('./bank.js');
const AwardConfig = new store({ path: __dirname+'/../config/awards.json' });
const AwardData = new store({ path: __dirname+'/../data/awards.json' });

function getAwardsListChoices () {
	let choices = Object.entries(AwardConfig.get('awards')||[]).map(a => ({
		label: a[0]+' ('+a[1].defaultAmount+'Ᵽ)' ,
		value: a[0],
		emoji: {
			name: a[1].emojiName || 'win',
			id: a[1].emojiId || '740028074053337148'
		}
	}));
	
	while (choices.length < 3) {
		choices.push({
			label: 'You need to add more award options bro (dont click this)',
			value: 'fakechoice'+choices.length
		});
	}
	console.log('ch',choices)
	return choices;

}

const AWARD_COMMAND = {
	command: 'give-award', 
	description: 'give an award to this player', 
	default_member_permissions: "0",
	options: [{
		name: 'name',
		type: 3,
		description: 'choose which award to give',
		required: true,
		choices: getAwardsListChoices,
	},
	{
		name: 'amount',
		type: 4,
		description: 'The amount to give to the player (if different than the default)',
	}]
};

//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ right click  ██████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

const SHOW_AWARD_SELECTION = {
	command: 'give-award', 
	default_member_permissions: "0",
	commandType: 3
};

console.log(Object.entries(AwardConfig.get('awards')||[]).map(a => ({
	label: a[0]+' ('+a[1].defaultAmount+'Ᵽ)' ,
	value: a[0],
	emoji: {
		name: a[1].emojiName || 'win',
		id: a[1].emojiId || '740028074053337148'
	}
})));

new Module('show award selection', 'message', SHOW_AWARD_SELECTION, async (interaction) => {
	interaction.reply({content: interaction.targetId, ephemeral: true, "components": [
        {
            "type": 1,
            "components": [
                {
                    "type": 3,
                    "custom_id": "award-selection",
                    "options": getAwardsListChoices(),
                    "placeholder": "choose the award you wish to give",
                }
            ]
        }
    ]});
});


//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ award selected ████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

const SELECTED_AWARD = {
	command: 'award-selection', 
	commandType: 'select'
};

new Module('award selected', 'message', SELECTED_AWARD, async (interaction) => {
	try {
		let awardId = interaction.values[0];
		let award = AwardConfig.get('awards.'+awardId);
		let awardedMessageId = interaction.message.content;
		let awardedMessage = await interaction.message.channel.messages.fetch(awardedMessageId);

		//record award
		AwardData.set(interaction.message.id, {
			userId: awardedMessage.author.id,
			award: awardId,
			prize: award.defaultAmount,
			date: new Date(),
			messageId: awardedMessageId,
			channelName: interaction.message.channel.name
		});

		await Bank.adjustBalance(awardedMessage.author.id, award.defaultAmount, 'You were given the '+awardId+' award in '+interaction.message.channel.name+'!');
		let awardEmoji = '<:'+ (award.emojiName||'win') +':' + (award.emojiId||'740028074053337148') +'>';
		await interaction.message.channel.send({content: '<@'+awardedMessage.author.id+'>' + ' was given the **'+awardId+'** award and Ᵽ'+award.defaultAmount+'!\n '+awardEmoji});

		interaction.update({content: awardEmoji + ' ' + awardId+' award given to '+awardedMessage.author.username,components: []});
	} catch (err) {
		interaction.update({content: 'award giving failed: \n'+err,components: []});
	}
});


//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ ADD AWARDS ████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

const ADD_AWARD_COMMAND = {
	command: 'add-award', 
	description: 'create a new award that can be given to members', 
	default_member_permissions: "0",
	options: [{
		name: 'name',
		type: 3,
		description: 'its a number',
		required: true
	},
	{
		name: 'amount',
		type: 4,
		description: 'The amount to give to the player by default for this award',
		required: true
	}]
};


new Module('add new award', 'user', ADD_AWARD_COMMAND, async (interaction) => {
	AwardConfig.set('awards.'+ interaction.options.getString('name'), {
		defaultAmount: interaction.options.getInteger('amount')
	});

	interaction.reply({content: 'Award added.', ephemeral: true });
});


