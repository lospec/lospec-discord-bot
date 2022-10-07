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
	}
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

	interaction.reply({
		files: [{
			attachment: generator(),
			name: 'random-monster-'+(Math.random()*168468)+'.png'
		}],
	})
});

Array.prototype.random = function () {
	return this[Math.floor((Math.random()*this.length))];
}