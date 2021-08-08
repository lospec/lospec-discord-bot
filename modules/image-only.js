if (!CONFIG.imageOnlyChannels) return;

new Module('image only', 'message', {channel: CONFIG.imageOnlyChannels}, function (message) {

	const channelName = '#'+message.channel.name;
	const userName = '#'+message.author.username;

	//if there is no attachment
	if (message.attachments.size <= 0) {

		//if the message was an image url, exit without deleting
		if (/^(http|https):\/\/.*\.(png|jpg|jpeg)$/i.test(message.content))	return log('\timage url posted');

		//if the message is an instagram, reddit or twitter url, exit without deleting
		if (/^(http|https):\/\/(www\.)?(instagram|twitter|reddit)\.com/i.test(message.content))	return  log('\tsocial url posted');

		//otherwise, delete it
		log('deleting message in',channelName,'by',userName,'"'+message.content+'"');
		message.delete();
		return;
	}

	//there are attachments
	else {

		var att = message.attachments.first();

		if (!att.width || !att.height) {
			log('deleting message in inspiration by',userName,'(no width or height)');
			message.delete();
			return;
		}
		else if (att.width < 200 || att.height < 200) {
			log('deleting message in inspiration by',userName,'too small',att.width,'x',att.height);
			message.delete();
			return;
		}
	}
});

/*global Module, CONFIG, log, Log, send, react, sendEmoji, pickRandom */