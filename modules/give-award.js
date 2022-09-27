const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const store = require('data-store');
const Bank = require('./bank.js');
const AwardConfig = new store({ path: __dirname+'/../config/awards.json' });
const AwardData = new store({ path: __dirname+'/../data/awards.json' });

function getAwardsListChoices (nameName = 'label') {
	let choices = Object.entries(AwardConfig.get('awards')||[]).map(a => ({
		[nameName]: a[0]+' ('+a[1].defaultAmount+'Ᵽ)' ,
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

//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ right click  ██████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

const SHOW_AWARD_SELECTION = {
	command: 'give-award', 
	default_member_permissions: "0",
	commandType: 3
};

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

		await Bank.adjustBalance(awardedMessage.author.id, award.defaultAmount, 'You were given the '+awardId+' award in '+interaction.message.channel.name+'!')

		//record award
		AwardData.set(interaction.message.id, {
			userId: awardedMessage.author.id,
			award: awardId,
			prize: award.defaultAmount,
			date: new Date(),
			messageId: awardedMessageId,
			channelName: interaction.message.channel.name
		});
		
		let awardEmoji = '<:'+ (award.emojiName||'win') +':' + (award.emojiId||'740028074053337148') +'>';
		await interaction.message.channel.send({content: '<@'+awardedMessage.author.id+'>' + ' was given the '+awardEmoji+' **'+awardId+'** award and Ᵽ'+award.defaultAmount+'!'});

		interaction.update({content: awardEmoji + ' ' + awardId+' award given to '+awardedMessage.author.username,components: []});
	} catch (err) {
		interaction.update({content: 'award giving failed: \n'+err,components: []});
	}
});


//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ Award All Pinned ██████████████████████████████
//████████████████████████████████████████████████████████████████████████████████


const AWARD_ALL_PINNED_COMMAND = {
	command: 'award-all-pins', 
	description: 'give an award to every member with a pinned message in this channel/thread', 
	default_member_permissions: "0",
	options: [{
		name: 'award-name',
		type: 3,
		description: 'choose which award to give',
		required: true,
		choices: getAwardsListChoices('name'),
	}]
};

new Module('award all pinned', 'message', AWARD_ALL_PINNED_COMMAND, async (interaction) => {
	let awardId = interaction.options.getString('award-name');
	let award = AwardConfig.get('awards.'+awardId);

	let pinnedMessages = await interaction.channel.messages.fetchPinned();
	let authors = pinnedMessages.map(m => m.author.id)
		.filter((author)=> author !== interaction.channel.ownerId)
		.filter((author,i,array)=>array.indexOf(author) == i);

	if (authors.length == 0) return interaction.reply({content: '0 pins were found', ephemeral: true });

	authors.forEach(async author => {
		await Bank.adjustBalance(author, award.defaultAmount, 'You were given the '+awardId+' award in '+interaction.channel.name+'!')
	});

	interaction.reply({content: authors.map(a=>'<@'+a+'>').join(', ') + ' were given the **'+awardId+'** award and Ᵽ'+award.defaultAmount+'!', ephemeral: true });
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


//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ Claim Unclaimed Awards ████████████████████████
//████████████████████████████████████████████████████████████████████████████████

Bank.on('bank-account-opened', (userId)=> {
	let allAwards = AwardData.get();

	let awardsForThisUser = Object.values(allAwards)
		.filter(a => a.userId == userId)
		.map(a => a.prize)
		.reduce((a,b) => a+b, 0);

	Bank.adjustBalance(userId, awardsForThisUser, 'Unclaimed award money')
});