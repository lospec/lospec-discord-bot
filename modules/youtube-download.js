
const fs = require('fs');
const path = require('path');
const YoutubeMp3Downloader = require("youtube-mp3-downloader");



const ART_HOUR_DOWNLOAD_COMMAND = {
	command: 'add-art-hour-song', 
	description: 'Downloads a song from youtube into the art hour music folder', 
	options: [{
		name: 'url',
		type: 3,
		description: 'Enter a youtube url (must contain ?watch=, extra crap at the end is okay',
		required: true
	},
	{
		name: 'filename',
		type: 3,
		description: 'enter the resulting filename you want (will get sluggified). no extension. ',
		required: false
	}]
};

new Module('art hour download song', 'message', ART_HOUR_DOWNLOAD_COMMAND, async (interaction) => {
	console.log('dk')
	//tell the user to wait while we attempt to download
	await interaction.deferReply({ephemeral: true});

	let songUrl = interaction.options.getString('url');
	let fileName = interaction.options.getString('filename');
		if (fileName) fileName = formatFileName(fileName);

	var YD = new YoutubeMp3Downloader({
		ffmpegPath: '/usr/bin/ffmpeg',        // FFmpeg binary location
		outputPath: '../art-hour/music',    // Output file location (default: the home directory)
		youtubeVideoQuality: "highestaudio",  // Desired video quality (default: highestaudio)
		progressTimeout: 500,
	});

	try {
		let songId = songUrl.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/)[1];

		YD.download(songId, fileName);

		YD.on("finished", function(err, data) {
			interaction.editReply({ content: 'downloading complete: '+data.file});

			if (!fileName) {
				let betterFileName = formatFileName(path.basename(data.file, '.mp3'))
				let newPath = path.dirname(data.file) + '/' + betterFileName + '.mp3';
				
				fs.rename(data.file, newPath, () => {
					console.log('renamed to', betterFileName);
					interaction.editReply({ content: 'downloading complete: '+data.file+'\n renamed to '+betterFileName});
				});
			}
		});

		YD.on("error", function(error) {
			console.error(error);
			interaction.editReply({ content: 'download failed: '+error.message})
		});

		YD.on("progress", function(progress) {
			console.log('DONWLOAD PROGRESS:', JSON.stringify(progress));
			let percent = Math.round(progress.progress.percentage) + '%';
			interaction.editReply({ content: 'downloading... '+percent})
		});
	}
	catch (err) {
		interaction.editReply({ content: 'download failed'})
	}
});

function formatFileName (fileName) {
	return	fileName
		.toLowerCase() 				//lowercase only
		.replace(/[\s_]/g,'-')		//replace spaces or underscores with dash
		.replace(/-{2,}/g,'-')		//replace 2 or more dashes with a single dash
		.replace(/[^a-z0-9-]/g,'')	//remove any characters other than letters and dashes
		.replace(/-$/g,'');	//remove trailing dash
}