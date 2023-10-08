const fs = require('fs');
const store = require('data-store');
const BankConfig = new store({ path: __dirname+'/../config/bank.json' });
const BankAccounts = new store({ path: __dirname+'/../data/bank-accounts.json' });
const BankInterest = new store({ path: __dirname+'/../data/bank-interest.json' });
const events = require('events');
const BankEvents =  new events.EventEmitter(); 
module.exports = BankEvents;

//id of user who can give out money freely
const BANKADMINISTRATOR = BankConfig.get('adminId');
const BANKLOGCHANNEL = BankConfig.get('logChannelId');
const RICHESTPERSONROLE = BankConfig.get('richestPersonRoleId');

const NOACCOUNT = 'We\'re sorry, but you don\'t seem to have an open account with us. Please contact customer service.';

//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ Open ██████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

const OPEN = {
	command: 'bankopenaccount', 
	description: 'Open an account with the Lospekistan National Bank'
};

new Module('bank open', 'message', OPEN, async (interaction) => {
    //user already has account
    if (BankAccounts.get(interaction.user.id))
      return interaction.reply({ content: 'You already have an account open with us!', ephemeral: true });
    
    //open account
    BankAccounts.set(interaction.user.id,1);
    interaction.reply({ content: 'Thank you for opening an account with the Lozpekistan National Bank! We have given you a Ᵽ1 free!', ephemeral: true });
	BankEvents.emit('bank-account-opened',interaction.user.id);

	banklog(interaction.user.toString(),'opened an account');
});


//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ Balance ███████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

const INTEREST = {
	command: 'bankbalance', 
	description: 'Check the balance of your bank account'
};

new Module('bank balance', 'message', INTEREST, async (interaction) => {
    let balance = BankAccounts.get(interaction.user.id);
    if (balance == undefined) return interaction.reply({ content: NOACCOUNT, ephemeral: true });

    //get account balance
    interaction.reply({ content: 'Your current balance: `Ᵽ'+balance+'`.', ephemeral: true });
	banklog(interaction.user.toString(),'checked their balance');
});


//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ Interest ██████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

const BALANCE = {
	command: 'bankinterest', 
	description: 'Claim your daily account interest'
};

new Module('bank interest', 'message', BALANCE, async (interaction) => {
    //user doesnt has account
    if (typeof BankAccounts.get(interaction.user.id) == 'undefined') return interaction.reply({ content: NOACCOUNT, ephemeral: true });
    
    let balance = BankAccounts.get(interaction.user.id);
	let interestRate = getInterestLevel(interaction).rate;
	let interestAmount = Math.max(1, Math.round(balance * interestRate));
	let interestRateInfo = 'Interest Rate Class: `  '+getInterestLevel(interaction).name+'  ('+(interestRate*100)+'%)  `';
		
	//figure out how long ago the user last collected interest
	if (datesAreOnSameDay(new Date(), new Date(BankInterest.get(interaction.user.id)||0))) {
		console.log('dates same');
		return interaction.reply({ content: 'You have already collected your interest today! Please come back tomorrow.\n '+interestRateInfo, ephemeral: true });
	} else console.log('dates not same');
	
	//update account
	balance+=interestAmount;
	BankAccounts.set(interaction.user.id, balance);
	BankInterest.set(interaction.user.id, new Date());
    
    //get account balance
    interaction.reply({ content: 'You have been awarded `Ᵽ'+interestAmount+'` in interest. Your new balance is: `Ᵽ'+balance+'`.\n '+interestRateInfo, ephemeral: true });
	banklog(interaction.user.toString(),'collected Ᵽ',interestAmount,'in interest','('+interestRateInfo+')');
	checkRichestPersonRole(interaction.guild);
});

function getInterestLevel (interaction) {
	
	//dragon
	if (interaction.member.roles.cache.has('506164884204027943')) return {rate: 0.006, name: 'DRAGON'};
	
	//cyclops
	if (interaction.member.roles.cache.has('506164942416904194')) return {rate: 0.005, name: 'CYCLOPS'};
	
	//orc
	if (interaction.member.roles.cache.has('506164966949257227')) return {rate: 0.004, name: 'ORC'};
	
	//goblin
	if (interaction.member.roles.cache.has('506165021622140968')) return {rate: 0.003, name: 'GOBLIN'};
	
	//imp
	if (interaction.member.roles.cache.has('506165059022487573')) return {rate: 0.002, name: 'IMP'};
	
	//jalapeno king
	if (interaction.member.roles.cache.has('610568462879817739')) return {rate: 0.00175, name: 'JALAPENO KING'};
		
	//killer robot killer
	if (interaction.member.roles.cache.has('854087304809152522')) return {rate: 0.0016, name: 'KILLER ROBOT KILLER'};
	
	//lozpekamon master
	if (interaction.member.roles.cache.has('837748194585608232')) return {rate: 0.0016, name: 'LOZPEKAMON MASTER'};
	
	//nitro booster
	if (interaction.member.roles.cache.has('641648853455732742')) return {rate: 0.0016, name: 'NITRO BOOSTER'};
	
	//active member
	if (interaction.member.roles.cache.has('839480902563659836')) return {rate: 0.0015, name: 'ACTIVE MEMBER'};
	
	//default
	return {rate: 0.001, name: 'DEFAULT'};
}

//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ Transfer ██████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

const TRANSFER = {
	command: 'banktransfer', 
	description: 'Send money to another user', 
	options: [{
		name: 'payee',
		type: 6,
		description: 'Tag the user you wish to transfer money to.',
		required: true
	},
	{
		name: 'amount',
		type: 4,
		description: 'The amount you want to send',
		required: true
	},
	{
		name: 'memo',
		type: 3,
		description: 'Text describing the purpose of this transfer.',
		required: false
	}]
};

new Module('bank transfer', 'message', TRANSFER, async (interaction) => {
	try {
		let balance = BankAccounts.get(interaction.user.id);
		let AWARD = (interaction.user.id == BANKADMINISTRATOR);
		let payee = interaction.options.getUser('payee');
		let transferAmount = interaction.options.getInteger('amount');
		let payeeBalance = BankAccounts.get(payee.id);

		//check for errors
		if (typeof balance == 'undefined') 
			return interaction.reply({ content: NOACCOUNT, ephemeral: true });
		if (interaction.user.id == payee.id) 
			return interaction.reply({ content: 'We detected a money laundering attempt on your account. Your information has been sent to the Lozpekistan Money Fraud Prevention Department. If this was intentional, please submit yourself to the nearest Lozpekistan Law Enforcement center for questioning.', ephemeral: true });
		if (typeof payeeBalance == 'undefined') 
			return interaction.reply({ content: 'We\'re sorry, but this payee doesn\'t seem to have an open account with us. Please ensure they have an open account and try again.', ephemeral: true });
		if (transferAmount <= 0) 
			return interaction.reply({ content: 'We\'re sorry, transfer amount must be a positive number.', ephemeral: true });
		if (transferAmount > balance && !AWARD) 
			return interaction.reply({ content: 'We\'re sorry, you do not have the funds to make this transfer.', ephemeral: true });    
		if (payee.bot)
			return interaction.reply({ content: 'We\'re sorry, robots are not allowed to own bank accounts at this time.', ephemeral: true });  
		
		//transfer money 
		balance = 		parseInt(balance) - transferAmount;
		payeeBalance =  parseInt(payeeBalance) + transferAmount;
		BankAccounts.set(payee.id, payeeBalance);
		if (!AWARD) BankAccounts.set(interaction.user.id, balance);
		
		//send dm notification to payee
		let memo = (interaction.options.getString('memo')||'n/a');
		payee.send({content: 'Hello, this is a message from Lozpekistan National Bank:', embeds:[{description:"User "+interaction.user.toString()+" has transferred ` Ᵽ"+transferAmount+" ` to your account. \nReason: ` "+ (AWARD?'AWARD: ':'') + memo+"` \n Your new balance is ` Ᵽ"+payeeBalance+" ` \n\n Have a nice day!"}]})

		//success
		interaction.reply({ content: 'Your money was successfully transfered. \n\nYour new balance is: `Ᵽ'+balance+'`.\n\n Thank you for using Lozpekistan National Bank.', ephemeral: true });
		banklog(interaction.user.toString(),'transferred Ᵽ',transferAmount,'to',payee.toString(),'for `'+memo+'`',AWARD?'[AWARD]':'');
		checkRichestPersonRole(interaction.guild);

	} catch (err) {interaction.reply({content: 'transfer failed: \n'+err})}
});

//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ Help ██████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

const BankHelp = fs.readFileSync(__dirname+'/../config/bank-help.txt', 'utf-8');

const HELP = {
	command: 'bankcustomerservice', 
	description: 'Lospekistan National Bank Customer Service'
};

new Module('bank customer service', 'message', HELP, async (interaction) => {
    interaction.reply({ content: BankHelp, ephemeral: true });
	banklog(interaction.user.toString(),'asked for help');
});



function datesAreOnSameDay (first, second) { 
	console.log(first,'vs',second)
	console.log(first.getFullYear() === second.getFullYear(),
    first.getMonth() === second.getMonth(),
    first.getDate() === second.getDate())
		console.log(first.getFullYear() , second.getFullYear(),
    first.getMonth() , second.getMonth(),
    first.getDate() , second.getDate())
	
	return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() === second.getDate();	
}

//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ Leaderboard ███████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████
const LEADERBOARDLENGTH = 25;
const LEADERBOARD = {
	command: 'bankleaderboard', 
	description: 'List top '+LEADERBOARDLENGTH+' richest people in lozpekistan', 
};

function nth(n){return["st","nd","rd"][((n+90)%100-10)%10-1]||"th"} 

new Module('bank leaderboard', 'message', LEADERBOARD, async (interaction) => {
	
	try {
		let leaderboard = [];
		let count = 0;
		Object.entries(BankAccounts.get()).forEach(a => {
			//if (a[0] == BANKADMINISTRATOR) return;
			leaderboard.push({id: a[0], balance: a[1]});
			count++;
		});
		leaderboard.sort((a, b) => b.balance - a.balance);
		let message = '```Lozpekistan National Bank Top '+LEADERBOARDLENGTH+' Customers \n------------------------------------\n\n';

		let position = 1;
		for (let i = 0; i < leaderboard.length && position <= LEADERBOARDLENGTH; i++) {
			console.log(leaderboard[i]);
			if (typeof leaderboard[i] == 'undefined') break;
			try {
				let user = await client.users.fetch(leaderboard[i].id);
				//make sure user isnt bank admin
				if (user.id == BANKADMINISTRATOR) continue;
				message += `${position}${nth(position)}: ${user.username}`;
				message += '\n';
				position++;
			} catch (err) {
				console.log('bad user');
			}
		}
		message += '\n------------------------------------\n\nOut of a total of '+count+' customers.```';
		interaction.reply({ content: message });
		banklog(interaction.user.toString(),'asked for leaderboard');
	} catch (err) {
		console.log('error with leaderboard',err);
	}
});


//████████████████████████████████████████████████████████████████████████████████
//███████████████████████████████████ Ranking ████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████


const RANKING = {
	command: 'bankranking', 
	description: 'Get your rank of richest people in lozpekistan', 
};

new Module('bank ranking', 'message', RANKING, async (interaction) => {
	
	if (typeof BankAccounts.get(interaction.user.id) == 'undefined') return interaction.reply({ content: NOACCOUNT, ephemeral: true });

	try {
		let rankings = [];
		Object.entries(BankAccounts.get()).forEach(a => {
			if (a[0] == BANKADMINISTRATOR) return;
			rankings.push({id: a[0], balance: a[1]});
		});
		rankings.sort((a, b) => b.balance - a.balance);

		let positionInRankings = rankings.findIndex(a => a.id == interaction.user.id) + 1;

		let message = '```Lozpekistan National Bank Wealth Ranking for '+interaction.user.username+': '+positionInRankings+'```';
		interaction.reply({ content: message });
		banklog(interaction.user.toString(),'asked for ranking');
	} catch (err) {
		console.log('error with leaderboard',err);
	}
});


//████████████████████████████████████████████████████████████████████████████████
//███████████████████████████████████ Giveaway ███████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

const Giveaways = new store({ path: __dirname+'/../data/bank-giveaways.json' });

const GIVEAWAY_COMMAND = {
	command: 'giveaway', 
	description: 'Give away free money from your bank account publicly', 
	options: [
	{
		name: 'amount',
		type: 4,
		description: 'The amount you want to give to each user that claims this giveaway',
		required: true
	},
	{
		name: 'title',
		type: 3,
		description: 'Describe your giveaway',
		required: true
	},
	{
		name: 'quantity',
		type: 4,
		description: 'The number of users who can claim this giveaway',
		required: false
	}]
};

new Module('bank giveaway', 'message', GIVEAWAY_COMMAND, async (interaction) => {
	try {
		let balance = BankAccounts.get(interaction.user.id);
		let giveawayTitle = interaction.options.getString('title');
		let giveawayAmount = interaction.options.getInteger('amount');
		let giveawayQuantity = interaction.options.getInteger('quantity')||1;
		let isAdmin = (interaction.user.id == BANKADMINISTRATOR);
		let totalCost = giveawayAmount * giveawayQuantity;

		console.log('is admin',isAdmin,interaction.user.id == BANKADMINISTRATOR, interaction.user.id, BANKADMINISTRATOR)

		//check for errors
		if (typeof balance == 'undefined') 
			return interaction.reply({ content: NOACCOUNT, ephemeral: true });
		if (totalCost <= 0) 
			return interaction.reply({ content: 'We\'re sorry, transfer amount must be a positive number.', ephemeral: true });
		if (!isAdmin && totalCost > balance) 
			return interaction.reply({ content: 'We\'re sorry, you do not have the funds to make this transfer.', ephemeral: true });    
		

		
		//take  money 
		if (!isAdmin) BankAccounts.set(interaction.user.id, balance - totalCost);	

		//success
		await interaction.reply({ embeds: [{
				title: 'GIVEAWAY: '+giveawayTitle,
				description: 'Claim '+giveawayAmount+' Ᵽ from '+interaction.user.toString()+'! \n\n**'+giveawayQuantity+'** more people can claim this giveaway.',
			}], 
			components: [
				{
					"type": 1,
					"components": [
						{
							"type": 2,
							"label": "Claim!",
							"style": 3,
							"custom_id": "claim_giveaway_"+giveawayAmount+'_'+giveawayQuantity
						}
					]
		
				}
			]});
		let newMessage = await interaction.fetchReply();

		//save giveaway data to be claimed
		Giveaways.set(newMessage.id, { 
			id: newMessage.id, 
			creator: interaction.user.id,
			title: giveawayTitle, 
			amount: giveawayAmount, 
			quantity: giveawayQuantity, 
			remaining: giveawayQuantity, 
			claimedBy: [] });
		
		banklog(interaction.user.toString(),'started giveaway for Ᵽ'+giveawayAmount+' each to '+giveawayQuantity+' people ('+totalCost+' total)');
		checkRichestPersonRole(interaction.guild);

	} catch (err) {
		console.log('error with giveaway',err);
	}
});

//user clicked claim button
client.on('interactionCreate', async (interaction, user) => {

	try {
		if (!interaction.isButton || !interaction?.customId?.startsWith('claim_giveaway')) return;

		let giveaway = Giveaways.get(interaction.message.id);
		
		if (!giveaway) return interaction.reply({ content: 'We\'re sorry, this giveaway has expired.', ephemeral: true });
		if (giveaway.remaining < 1) {
			interaction.reply({ content: 'We\'re sorry, this giveaway has expired.', ephemeral: true });
			return endGiveaway(interaction.message);
		}
		if (typeof BankAccounts.get(interaction.user.id) == 'undefined') return interaction.reply({ content: NOACCOUNT, ephemeral: true });
		if (giveaway.claimedBy.includes(interaction.user.id)) return interaction.reply({ content: 'You have already claimed this giveaway!', ephemeral: true });
		if (interaction.user.id == giveaway.creator) return interaction.reply({ content: 'You cannot claim your own giveaway!', ephemeral: true });


		//give money
		BankAccounts.set(interaction.user.id, BankAccounts.get(interaction.user.id) + giveaway.amount);
		checkRichestPersonRole(interaction.guild);
		giveaway.claimedBy.push(interaction.user.id);
		giveaway.remaining--;
		Giveaways.set(giveaway.id, giveaway);

		//success
		interaction.reply({ content: 'You have claimed '+giveaway.amount+' Ᵽ from the '+giveaway.title+' giveaway!', ephemeral: true });
		banklog(interaction.user.toString(),'claimed Ᵽ'+giveaway.amount,'from giveaway',giveaway.title);

		if (giveaway.remaining > 0) {
			//update message
			let giveawayMessage = interaction.message;
			await giveawayMessage.edit({ embeds: [{
				title: 'GIVEAWAY: '+giveaway.title,
				description: 'Claim '+giveaway.amount+' Ᵽ from <@'+giveaway.creator+'>! \n\n'+
					'**Claimed by:** '+giveaway.claimedBy.map(id => '<@'+id+'>').join(', ')+'\n\n'+
					'**'+giveaway.remaining+'** more people can claim this giveaway.',
			}]});
		} else {
			endGiveaway(interaction.message);
		}
	
	} catch (err) {
		console.log('error claiming giveaway',err);
		banklog('error claiming giveaway',err?.message);
	}
});

async function endGiveaway (giveawayMessage) {

	let id = giveawayMessage.id;
	let giveaway = Giveaways.get(id);

	//update message
	await giveawayMessage.edit({ embeds: [{
		title: 'GIVEAWAY: '+giveaway.title,
		description: '**This giveaway has ended!**\n\n'+
			'<@'+giveaway.creator+'>' + ' gave away **'+ giveaway.amount+'Ᵽ** to **'+giveaway.quantity+'** people.\n\n'+
			'**Claimed by:** '+giveaway.claimedBy.map(id => '<@'+id+'>').join(', ')
	}]});

	//delete giveaway
	Giveaways.del(id);

	console.log('giveaway '+id+' ended successfully');
}


//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ ADMIN - account ███████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

const ADMIN_ACCOUNT_COMMAND = {
	command: 'bank-admin-account', 
	description: 'check a users account',
	default_member_permissions: "0",
	options: [{
		name: 'user',
		type: 6,
		description: 'Tag the user you wish to check',
		required: true
	}]
};

new Module('bank admin - account', 'message', ADMIN_ACCOUNT_COMMAND, async (interaction) => {
	let payee = interaction.options.getUser('user');
    interaction.reply({ content: JSON.stringify({user: payee.username, userid: payee.id, balance: BankAccounts.get(payee.id), interest: BankInterest.get(payee.id)}), ephemeral: true });
});


//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ LOG ███████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

function banklog () {
	let text = Array.from(arguments).join(' ');

	try {
		client.channels.fetch(BANKLOGCHANNEL).then(channel => {
			channel.send(text);
		})
		.catch(() => {console.log('BANK LOG: ', text)});
	} catch (e) {console.log('BANK LOG: ', text);}
}


//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ ASSIGN ROLE ███████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

function checkRichestPersonRole (guild) {

	let accounts = BankAccounts.get()

	let largestAccount = Object.keys(accounts).reduce((prev,curr) => {
		console.log({prev: prev, curr: curr});
		return accounts[prev] > accounts[curr] ? prev :curr;
	}, Object.keys(accounts)[0]);

	//remove role from current user, then assign to richest user
	guild.members.fetch()
		.then(() => guild.roles.fetch(RICHESTPERSONROLE))
		.then(role => role.members.first())
		.then(richestPerson => {
			if (!richestPerson) return;
			else if (richestPerson.id == largestAccount) throw 'richest person still richest';
			return richestPerson.roles.remove(RICHESTPERSONROLE);
		})
		.then(() => guild.members.fetch(largestAccount))
		.then(member => member.roles.add(RICHESTPERSONROLE))
		.then(member => banklog(member.toString(),'became richest person'))
		.catch(console.log)
}

//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ EXTERNAL API ██████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

const express = require('express');
let bankAPI = express();
bankAPI.use(express.json());

bankAPI.use((req, res, next)=> {
	console.log('BANK API REQUEST |', req.method+' '+req.originalUrl, res.statusCode);
	next();
});

bankAPI.get('/balance', function(req, res) {
	res.json(BankAccounts.get());
});

bankAPI.get('/balance/:userId', function(req, res) {
	let balance = BankAccounts.get(req.params.userId);
	if (balance == undefined) return res.sendStatus(404);

	res.json(balance);
});

bankAPI.post('/balance/:userId', function(req, res) {
	let balance = BankAccounts.get(req.params.userId);
	if (balance == undefined) return res.sendStatus(404);
	let amount = parseInt(req.body.amount);
	if (amount == NaN) return res.sendStatus(400);

	BankAccounts.set(req.params.userId+'.balance', balance + amount);
	res.json(BankAccounts.get(req.params.userId));
});

bankAPI.put('/balance/:userId', function(req, res) {
	let balance = BankAccounts.get(req.params.userId);
	let amount = parseInt(req.body.amount);
	if (amount == NaN) return res.sendStatus(400);

	BankAccounts.set(req.params.userId, amount);
	if (balance == undefined) return res.json(true);
	else return res.json(false);
});

bankAPI.use((req, res)=> {return res.sendStatus(404);});
bankAPI.listen(4420, 'localhost', () => {console.log(`Bank API listening on port 4420`);});

//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ INTERNAL API ██████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

module.exports.getBalance = async function getBalance (userId) {
	let account = BankAccounts.get(userId);
	if (account == undefined) throw 'account not found';
	banklog('<@'+userId+'>','checked their balance');
	return account.balance;
}

module.exports.adjustBalance = async function adjustBalance (userId, amount, memo) {
	console.log('BANK API INTERNAL','adjust balance',userId,amount,memo);
	let balance = BankAccounts.get(userId);
		console.log('\t',balance)
	if (balance == undefined) return false;
	if (!amount) throw 'invalid amount';
	let payee = await client.users.fetch(userId, {force: true});

	payee.send({content: 'Hello, this is a message from Lozpekistan National Bank:', embeds:[{description:"` Ᵽ"+amount+" ` has been transferred to your account. \nReason: ` "+ memo+" ` \n Your new balance is ` Ᵽ"+(balance + amount)+" ` \n\n Have a nice day!"}]});
	banklog('transferred Ᵽ',amount,'to',payee.toString(),'for `'+memo+'`');

	BankAccounts.set(userId, balance + amount);
	return BankAccounts.get(userId);
}