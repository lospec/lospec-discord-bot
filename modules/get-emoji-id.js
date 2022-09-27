const fs = require('fs');
const https = require('https');
const { MessageEmbed } = require('discord.js');
const getImageDimentions = require('image-size')
var timeAgo = require('node-time-ago');
const store = require('data-store');
const LFTStore = new store({ path: __dirname+'/../config/lft.json' });

const HIGHESTID = LFTStore.get('lfts').length-1;
const LFTLOGCHANNEL = LFTStore.get('logchannel');


//████████████████████████████████████████████████████████████████████████████████
//████████████████████████████████ View LFT ██████████████████████████████████████
//████████████████████████████████████████████████████████████████████████████████
// Create a new LFT by overwriting an LFT

const GET_EMOJI_COMMAND = {
	command: 'get-emoji-id', 
	description: 'get the discord id of a specific emoji', 
	default_member_permissions: "0",
	options: [{
		name: 'emoji',
		type: 3,
		description: 'put the emoji here',
		required: true
	}]
};


new Module('get emoji id', 'message', GET_EMOJI_COMMAND, async (interaction) => {
	interaction.reply({content: '`' + interaction.options.getString('emoji') + '`', ephemeral: true})
});

