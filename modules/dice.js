new Module('flip', 'message', /^!flip$/i, message => send(message,pickRandom(['*heads*','*tails*'])));

new Module('d2', 'message', /^!d2$/i, message => send(message,pickRandom([1,2])));
new Module('d4', 'message', /^!d4$/i, message => send(message,pickRandom(['**1**',2,3,'**4**'])));
new Module('d6', 'message', /^!d6$/i, message => send(message,pickRandom(['**1**',2,3,4,5,'**6**'])));
new Module('d8', 'message', /^!d8$/i, message => send(message,pickRandom(['**1**',2,3,4,5,6,7,'**8**'])));
new Module('d10', 'message', /^!d10$/i, message => send(message,pickRandom(['**1**',2,3,4,5,6,7,8,9,'**10**'])));
new Module('d12', 'message', /^!d12$/i, message => send(message,pickRandom(['**1**',2,3,4,5,6,7,8,9,10,11,'**12**'])));
new Module('d20', 'message', /^!d20$/i, message => send(message,pickRandom(['**1**',2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,'**20**'])));
new Module('d100', 'message', /^!d100$/i, message => {
	var num = Math.floor(Math.random() * 100) + 1;
	if (num == 1) num = '**1**';
	if (num == 100) num = '**100**';
	send(message,num);
});

/*global Module, log, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod */