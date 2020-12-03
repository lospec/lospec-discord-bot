
//before
new Module('petition', 'message', /^!?petition.*/i, function (message) {
	react(message, ['⬆️','⬇️' ]);
});

/*global Module, log, error, send, react, sendEmoji, pickRandom, messageHasBotPing, isMod */