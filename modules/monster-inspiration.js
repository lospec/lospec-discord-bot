const fetch = require('node-fetch');
const glob = require('glob');
const fs = require('fs');

const monsterGenerators = {

	'PokemonFusion':  () => {
		let firstPokemon = Math.round(Math.random() * 151);
		let secondPokemon;
	
		do {
			secondPokemon = Math.round(Math.random() * 151);
		} while (secondPokemon == firstPokemon);
	
		return 'https://images.alexonsager.net/pokemon/fused/'+firstPokemon+'/'+firstPokemon+'.'+secondPokemon+'.png';
	},


	'Nokemon': ()=> {
		let files = glob.sync('media/monsters/nokemon/*.png');
		return fs.readFileSync(files.random());
	},


	'StableDiffusion': ()=> {
		let files = glob.sync('media/monsters/stable-diffusion/*.png');
		return fs.readFileSync(files.random());
	},

//TODO: unfortunatley this seems to be fetching the same page each time no matter what
	// 'Spore': async () => {
	// 	let randomBatchId = Math.round(Math.random()*99999);

	// 	let res = await fetch("https://www.spore.com/jsserv/call/plaincall/assetService.listAssets.dwr?asdf="+randomBatchId, {
	// 		"credentials": "include",
	// 		"headers": {
	// 			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:105.0) Gecko/20100101 Firefox/105.0",
	// 			"Accept": "*/*",
	// 			"Accept-Language": "en-US,en;q=0.5",
	// 			"Sec-Fetch-Dest": "empty",
	// 			"Sec-Fetch-Mode": "no-cors",
	// 			"Sec-Fetch-Site": "same-origin",
	// 			"Content-Type": "text/plain",
	// 			"Pragma": "no-cache",
	// 			"Cache-Control": "no-cache"
	// 		},
	// 		"referrer": "https://www.spore.com/sporepedia",
	// 		"body": "callCount=1\npage=/sporepedia\nhttpSessionId=4854D39659D4691008156B557BFA35EC\nscriptSessionId=6CE3B7FC66A69A09C4873DBEAF4DF689861\nc0-scriptName=assetService\nc0-methodName=listAssets\nc0-id=0\nc0-e1=string:CREATURE\nc0-e2=string:CREATURE\nc0-e3=string:RANDOM\nc0-e4=number:0\nc0-e5=number:20\nc0-param0=Object_Object:{type:reference:c0-e1, assetFunction:reference:c0-e2, view:reference:c0-e3, index:reference:c0-e4, count:reference:c0-e5}\nbatchId="+randomBatchId+"\n",
	// 		"method": "POST",
	// 		"mode": "cors"
	// 	});
	// 	let body = await res.text();
	
	// 	let matches = body.match(/avatarImage="(thumb.*?)"/);
	
	// 	let thumbnailUrl = matches[1];

	// 	let fullUrl = 'http://static.spore.com' + thumbnailUrl
	// 		.replace(/\\\//g,'/')
	// 		.replace('thumb','/static/image')
	// 		.replace('.png','_lrg.png');

	// 	return fullUrl;
	// },

}

const COMMAND = {
	command: 'inspiration-monster', 
	description: 'Get a random monster design inspiration image', 
	options: [{
		name: 'generator',
		type: 3,
		description: 'which generator to use (optional, will use a random one by default)',
		choices: Object.keys(monsterGenerators).map(k => ({name:k,value:k})),
	}]
};


new Module('monster inspiration', 'message', COMMAND, async (interaction) => {
	let selectedGenerator = interaction.options.getString('generator');
	let generator = selectedGenerator?monsterGenerators[selectedGenerator]:Object.values(monsterGenerators).random();

	await interaction.deferReply({ephemeral: true});

	interaction.editReply({
		files: [{
			attachment: await generator(),
			name: 'random-monster-'+(Math.random()*168468)+'.png'
		}],
	})
});

Array.prototype.random = function () {
	return this[Math.floor((Math.random()*this.length))];
}