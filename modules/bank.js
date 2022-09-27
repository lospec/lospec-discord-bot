const fs = require('fs');
const store = require('data-store');
const BankAccounts = new store({ path: __dirname+'/../config/bank-accounts.json' });

//id of user who can give out money freely
const BANKADMINISTRATOR = '354968653260783618';
const BANKLOGCHANNEL = '954077494661775370';
const RICHESTPERSONROLE = '954089337161666683';

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
    BankAccounts.set(interaction.user.id,{balance: 1, username: interaction.user.username, lastInterest: 0});
    interaction.reply({ content: 'Thank you for opening an account with the Lozpekistan National Bank! We have given you a Ᵽ1 free!', ephemeral: true });

	log(interaction.user.toString(),'opened an account');
});


//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ Balance ███████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

const INTEREST = {
	command: 'bankbalance', 
	description: 'Check the balance of your bank account'
};

new Module('bank balance', 'message', INTEREST, async (interaction) => {
    //user doesnt has account
    if (typeof BankAccounts.get(interaction.user.id) == 'undefined') return interaction.reply({ content: NOACCOUNT, ephemeral: true });
    
    //get account
    let account = BankAccounts.get(interaction.user.id);

    //get account balance
    interaction.reply({ content: 'Your current balance: `Ᵽ'+account.balance+'`.', ephemeral: true });
	log(interaction.user.toString(),'checked their balance');
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
    
    //get account
    let account = BankAccounts.get(interaction.user.id);

	
	//calculate interest rate
	let interestRate = getInterestLevel(interaction).rate;
	
	//calculate interest amount
	let interestAmount = Math.max(1, Math.round(account.balance * interestRate));
	
	    let interestRateInfo = 'Interest Rate Class: `  '+getInterestLevel(interaction).name+'  ('+(interestRate*100)+'%)  `';
		
	//figure out how long ago the user last collected interest
	if (datesAreOnSameDay(new Date(), new Date(account.lastInterest))) {
		console.log('dates same');
		return interaction.reply({ content: 'You have already collected your interest today! Please come back tomorrow.\n '+interestRateInfo, ephemeral: true });
	} else console.log('dates not same');
	
	//update account
	account.balance += interestAmount;
	account.lastInterest = new Date();
	BankAccounts.set(interaction.user.id, account);
    
    //get account balance
    interaction.reply({ content: 'You have been awarded `Ᵽ'+interestAmount+'` in interest. Your new balance is: `Ᵽ'+account.balance+'`.\n '+interestRateInfo, ephemeral: true });
	log(interaction.user.toString(),'collected Ᵽ',interestAmount,'in interest','('+interestRateInfo+')');
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
    //user doesnt has account
    if (typeof BankAccounts.get(interaction.user.id) == 'undefined') return interaction.reply({ content: NOACCOUNT, ephemeral: true });
      let account = BankAccounts.get(interaction.user.id);
      let balance = account.balance;
	
	//check if this in an "award", ie money awarded to members and not subtracted from an account (only can be done by bank admin)
	let AWARD = (interaction.user.id == BANKADMINISTRATOR);
    
    //get receiving account
    let payee = interaction.options.getUser('payee');
    
	//dont let users send money to themselves
	if (interaction.user.id == payee.id) return interaction.reply({ content: 'We detected a money laundering attempt on your account. Your information has been sent to the Lozpekistan Money Fraud Prevention Department. If this was intentional, please submit yourself to the nearest Lozpekistan Law Enforcement center for questioning.', ephemeral: true });
	
	//payee doesn't has account
    if (typeof BankAccounts.get(payee.id) == 'undefined') return interaction.reply({ content: 'We\'re sorry, but this payee doesn\'t seem to have an open account with us. Please ensure they have an open account and try again.', ephemeral: true });
        let payeeAccount = BankAccounts.get(payee.id);
        let payeeBalance = payeeAccount.balance;
        
    //get receiving amount
    let transferAmount = interaction.options.getInteger('amount');
    
    //make sure amount is valid
    if (transferAmount <= 0) return interaction.reply({ content: 'We\'re sorry, transfer amount must be a positive number.', ephemeral: true });
	
    //make sure user has enough money
    if (transferAmount > balance && !AWARD) return interaction.reply({ content: 'We\'re sorry, you do not have the funds to make this transfer.', ephemeral: true });    
    
    //transfer money 
	if (!AWARD) account.balance = parseInt(account.balance) - transferAmount;
				payeeAccount.balance =  parseInt(payeeAccount.balance) + transferAmount;
    if (!AWARD) BankAccounts.set(interaction.user.id, account);
				BankAccounts.set(payee.id, payeeAccount);
	
	let memo = (interaction.options.getString('memo')||'n/a');

	//send dm notification to payee
	payee.send("Hello, this is a message from Lozpekistan National Bank:\n\n User "+interaction.user.toString()+" has transferred ` Ᵽ"+transferAmount+" ` to your account. Reason: ` "+ (AWARD?'AWARD: ':'') + memo+"` \n Your new balance is ` Ᵽ"+payeeAccount.balance+" ` \n\n Have a nice day!");

    //success
    interaction.reply({ content: 'Your money was successfully transfered. \n\nYour new balance is: `Ᵽ'+account.balance+'`.\n\n Thank you for using Lozpekistan National Bank.', ephemeral: true });
	log(interaction.user.toString(),'transferred Ᵽ',transferAmount,'to',payee.toString(),'for `'+memo+'`',AWARD?'[AWARD]':'');
	checkRichestPersonRole(interaction.guild);
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
	log(interaction.user.toString(),'asked for help');
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
//████████████████████████████████ LOG ███████████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

function log () {
	let text = Array.from(arguments).join(' ');

	client.channels.fetch(BANKLOGCHANNEL).then(channel => {
		channel.send(text);
	});
}


//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ ASSIGN ROLE ███████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████

function checkRichestPersonRole (guild) {

	let accounts = BankAccounts.get()

	let largestAccount = Object.keys(accounts).reduce((prev,curr) => {
		console.log({prev: prev, curr: curr});
		return accounts[prev].balance > accounts[curr].balance ? prev :curr;
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
		.then(member => log(member.toString(),'became richest person'))
		.catch(console.log)
		
}

//BANK API

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
	let account = BankAccounts.get(req.params.userId);
	if (account == undefined) return res.sendStatus(404);
	res.json(account.balance);
});

bankAPI.post('/balance/:userId', function(req, res) {
	let account = BankAccounts.get(req.params.userId);
	if (account == undefined) return res.sendStatus(404);
	let amount = parseInt(req.body.amount);
	if (amount == NaN) return res.sendStatus(400);
	BankAccounts.set(req.params.userId+'.balance', account.balance + amount);
	res.json(BankAccounts.get(req.params.userId).balance);
});

bankAPI.put('/balance/:userId', function(req, res) {
	let account = BankAccounts.get(req.params.userId);
	let amount = parseInt(req.body.amount);
	if (amount == NaN) return res.sendStatus(400);

	if (account == undefined) {
		BankAccounts.set(req.params.userId, {
			balance: amount,
			username: 'opened with api',
			lastInterest: 0,
		});
		return res.json(true);
	}

	else {
		BankAccounts.set(req.params.userId+'.balance', amount);
		return res.json(false);
	} 
});

bankAPI.use((req, res)=> {return res.sendStatus(404);});
bankAPI.listen(4420, () => {console.log(`Bank API listening on port 4420`);});

