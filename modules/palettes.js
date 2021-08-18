const fetch = require('node-fetch');

const COMMAND = {
	command: 'palette', 
	description: 'Fetch a link to a palette hosted on Lospec', 
	options: [{
		name: 'slug',
		type: 'STRING',
		description: 'Palette URL slug (the part of the url after /palette-list/)',
		required: true
	}]
};

new Module('palette poster', 'message', COMMAND, async (interaction) => {

	//tell the user to wait while we attempt to fetch palette
	await interaction.deferReply();

	//get 
	let paletteSlug = interaction.options.getString('slug');

	if (!paletteSlug) return interaction.editReply({ content: 'you must specify a palette', ephemeral: true })

	var palettteUrl = 'https://lospec.com/palette-list/'+ paletteSlug;

	//fetch json 
	fetch(palettteUrl + '.json')
		.then(async res => {
			if (!res.ok) throw 'Palette Not Found';
			let data = await res.json();

			//interaction.editReply('done'); return;
			
			//send palette embed
			interaction.editReply({embeds: [{
				title: data.name + ' by ' + data.author,
				description: 'https://lospec.com/palette-list/'+ paletteSlug ,
				image: {url: 'https://lospec.com/palettes/'+ paletteSlug + '/discord-thumbnail.png'}
			}] });
		})
		.catch(err => {
			console.error(err)
			interaction.editReply({ content: 'Sorry, I couldn\'t find a palette called "'+paletteSlug+'"  ¯\\\_(ツ)_/¯ ', ephemeral: true })
		});
});