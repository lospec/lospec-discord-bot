new Module('random', 'message', /^!r\d{1,9}$/i, message => {
	var num = Math.floor(Math.random() * parseInt(message.content.replace('!r',''))) + 1;
	if (num == 1) num = '**1**';
	if (num == 100) num = '**100**';
	send(message,num);
});

/*global Module, log, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod */