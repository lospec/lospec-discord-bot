const { MessageActionRow, MessageButton, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const Bank = require('./bank.js');

const PLAY = {
	command: 'play-tic-tac-toe', 
	description: 'Play a game of tic tac toe'
};

const BOARD = [ ['⬛','⬛','⬛',],
				['⬛','⬛','⬛',],
				['⬛','⬛','⬛',]]

new Module('tic tac toe', 'message', PLAY, async interaction => {
	await interaction.deferReply();
	try{
		let gameboard = structuredClone(BOARD);

		const response = await interaction.editReply({components: buildBoard(gameboard)});

		//If it aint the other player pushing buttons we dont care.
		const collectorFilter = i => {return i.user.id === interaction.user.id;}

		let playerMove
		
		let state = 'inplay'
			while(state == 'inplay'){
				try {
					playerMove = await response.awaitMessageComponent({ filter: collectorFilter, time: 10000 })
					playerMove.deferUpdate()
					if(playerMove == undefined) throw("Something is really wrong")
						
				} catch (e) {
					//If something goes wrong (most often a timeout waiting for a player move) stop the game.
					state = 'timeout';
					break;
				}

				handleMove(playerMove.customId, gameboard, '🇽');
				state = checkState(gameboard)
				await interaction.editReply({components: buildBoard(gameboard, true)})
				if(state != 'inplay') break;



				handleMove(findBestMove(gameboard), gameboard, '🅾️');
				state = checkState(gameboard)
				await interaction.editReply({components: buildBoard(gameboard)})
				if(state != 'inplay') break;
			}

		let result = 'A tie.'
		switch(state)
		{
			case '🇽': result = 'You win...'; break;
			case '🅾️': result = 'I win!'; break;
			case 'timeout': result = "Way to leave me hanging..."; break;
			default: break;
		}
		await interaction.editReply({content: result, components: buildBoard(gameboard, true)});
		
	} catch (e) {
		console.log(e)
		interaction.editReply({content: 'Something went wrong... I guess the only winning move is not to play.', components:[]})
	}
});

function handleMove(move, board, player) {
	let temp = move.split(',')
	let row = parseFloat(temp[0])
	let col = parseFloat(temp[1])

	board[row][col] = player
}

function buildBoard(board, locked = false){

	let rows = []

	for(let i=0; i<3; i++){
		rows[i] = new MessageActionRow()

		for(let j=0; j<3; j++){
		     let color = board[i][j] == '⬛'?"SECONDARY":(board[i][j]=='🅾️'?"DANGER":"PRIMARY")

			let button = new MessageButton()
				.setCustomId(i+','+j)
				.setLabel("")
				.setStyle(color)
				.setDisabled(board[i][j] != '⬛' || locked)
				.setEmoji(board[i][j]);

			rows[i].addComponents(button);
		}
	}

	return rows;
}

function checkState(board){
	//check rows, columns
	for(let i = 0; i < 3; i++)
	{
		if (board[i][i] != '⬛'
		&& ((board[i][0] == board[i][1] && board[i][1] == board[i][2]) 
		|| (board[0][i] == board[1][i] && board[1][i] == board[2][i]))){
			return board[i][i];
		}
	}

	//check diagonals
	if (board[1][1] != '⬛'
	&& ((board[0][0] == board[1][1] && board[1][1] == board[2][2]) 
	|| (board[0][2] == board[1][1] && board[1][1] == board[2][0]))){
		return board[1][1];
	}

	for(let i = 0; i < 3; i++)
		if(board[i].includes('⬛'))
			return 'inplay';

	return 'cat';
}

function minimax(board, depth, isMax) {

	let state = checkState(board);
	if (state == 'cat')
		return 0
	if(state == '🇽')
		return -1
	if(state == '🅾️')
		return 1
	
	//we want him beatable
	if(depth > 2){
		return 0;
	}

	// If this maximizer's move
    if (isMax)
    {
        let best = -1000;
  
        // Traverse all cells
        for (let i = 0; i<3; i++)
        {
            for (let j = 0; j<3; j++)
            {
                // Check if cell is empty
                if (board[i][j]!='⬛')
					continue;

				// Make the move
				board[i][j] = '🅾️';

				// Call minimax recursively and choose
				// the maximum value
				best = Math.max( best,
					minimax(board, depth+1, !isMax) );

				// Undo the move
				board[i][j] = '⬛';
            }
        }
        return best;
    }
  
    // If this minimizer's move
    else
    {
        let best = 1000;
  
        // Traverse all cells
        for (let i = 0; i<3; i++)
        {
            for (let j = 0; j<3; j++)
            {
                // Check if cell is empty
                if (board[i][j]!='⬛')
					continue;

				// Make the move
				board[i][j] = '🇽';

				// Call minimax recursively and choose
				// the minimum value
				best = Math.min(best,
						minimax(board, depth+1, !isMax));

				// Undo the move
				board[i][j] = '⬛';
            }
        }
        return best;
    }
}

function findBestMove(Board)
{
	let board = structuredClone(Board);

    let bestVal = -1000;
    let bestMove = {row: -1, col:-1};
  
    // Traverse all cells, evaluate minimax function for
    // all empty cells. And return the cell with optimal
    // value.
    for (let i = 0; i<3; i++)
    {
        for (let j = 0; j<3; j++)
        {
            // Check if cell is empty
            if (board[i][j]!='⬛')
				continue;
			// Make the move
			board[i][j] = '🅾️';

			// compute evaluation function for this
			// move.
			let moveVal = minimax(board, 0, false);

			// Undo the move
			board[i][j] = '⬛';

			// If the value of the current move is
			// more than the best value, then update
			// best/
			if (moveVal > bestVal)
			{
				bestMove.row = i;
				bestMove.col = j;
				bestVal = moveVal;
			}
        }
    }
  
    return bestMove.row +','+bestMove.col;
}