const THREAD_ID = '1070714699399839836';

new Module('squaker reactions', 'message', {channel: [THREAD_ID]}, (message) => {
	if (message.content.length > 140) {
		react(message, 'x_');
		
		setTimeout(() => {react(message, '5️⃣');}, 2000);
		setTimeout(() => {react(message, '4️⃣');}, 4000);
		setTimeout(() => {react(message, '3️⃣');}, 6000);
		setTimeout(() => {react(message, '2️⃣');}, 8000);
		setTimeout(() => {react(message, '1️⃣');}, 10000);
		setTimeout(() => {message.delete();}, 12000);
	}
	else {
		react(message, 'love');
		react(message, '🔁');
	}
});

new Module('squawker resquawk', 'react', {channel: [THREAD_ID]}, function (message,user,reaction) {
	if (reaction._emoji.name !== '🔁') return;
	message.fetch().then((message) => {
		if (message.author.bot) return;
		let attachment = message.attachments?.first()?.url;
		let resquawk = {content: '🔁 **<@'+user.id+'> RESQUAWKED**\n'};
		resquawk.content += message.content;
		if (attachment) resquawk.files = [{attachment: attachment}];
		message.reply(resquawk);
	});
});

		
