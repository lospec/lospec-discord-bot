const { MessageActionRow, MessageButton, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const Bank = require('./bank.js');
const e = require('express');

const PLAY = {
	command: 'play-blackjack', 
	description: 'Play Blackjack against me!',
    options: [{
    name: 'bet',
    type: 4,
    description: 'Your wager for the game (optional).',
    required: false
}]
};

const ranks = ["A",2,3,4,5,6,7,8,9,10,"J","Q","K"]

new Module('Blackjack', 'message', PLAY, async (interaction) => {
    await interaction.deferReply()
    let bet = (interaction.options.getInteger('bet')||0);
    if(bet<0) {
        interaction.editReply({ content: "You have to bet a positive amount of Pikzels, or bet nothing if you just want to play for fun!", ephemeral: true })
        return
    };
    try{
        if(bet>0){
            Bank.getBalance(interaction.user.id).then(async (f) => {
                if(f == undefined) f=0
                gameLoop(interaction,bet,f)
            })
        }
        else gameLoop(interaction)
    }catch(e) {
        console.log(e)
        interaction.editReply({content: 'Something went wrong... I guess the only winning move is not to play.', embeds:[], components:[]})
    }
});

async function gameLoop(interaction, bet=0, playerFunds = 0)
{
    let playerid = interaction.user.id
    let playerName = interaction.user.username

    const collectorFilter = i => {return i.user.id === playerid;}
    
    if(bet>0) 
    {
        if(bet>playerFunds)
        {
            interaction.editReply({ content: "Sorry "+playerName+", I can't give credit! Come back when you're a little... mmm... **richer!**", ephemeral: true })
            return
        }
        playerFunds -= bet
    }

    let dealer = {count:0, hasAce: false, cards: []};
    let player = {count:0, hasAce: false, cards: []};

    //hit dealer and player twice. Taking turns doesnt matter but its tradition.
    hitHand(dealer)
    hitHand(player)
    hitHand(dealer)
    hitHand(player)

    let playerResponse

    let actionBar = buildActionBar(bet>0 && playerFunds>bet)

    //GAMEPLAY//
    //2 is in play. 1 is a stay. 0 is a surrender. -1 is a bust
    let result = 2

    while(result>1){
        let gameQuery = await interaction.editReply({embeds:[{
        title:"Welcome to the Table, "+playerName+"!",
        description: "**Dealer's hand: **"+ dealer.cards[0] +
        ",? \n**Your hand: **"+ player.cards + 
        "\n**Your bet: **"+ bet +
        "Ᵽ \nIf you do nothing, you surrender!"}], components: [actionBar]})

        try {
            playerResponse = await gameQuery.awaitMessageComponent({ filter: collectorFilter, time: 30000 })
            playerResponse.deferUpdate()
        } catch (e) {
            //If the player ever stops responding, they surrender
            result = 0;
            break;
        }

        let move = playerResponse.customId
        if(move === 'hit' || move === 'double')
        {
            hitHand(player)
            if(move==='double')
            {
                playerFunds -= bet
                bet*=2
                result = 1
            }
            if(scoreHand(player) > 21)
            {
                result = -1
            }

            if(result === 1 || result === -1) break;
        }
        else if(move === 'stay')
        {
            result = 1
            break;
        }
        else
        {
            result = 0
            break
        }

        // playerResponse.update({embeds:[{title:"Welcome to the Table, "+playerName+"!",
        //     description: "**Dealer's hand: **"+ dealer.cards[0] +
        //     ",? \n**Your hand: **"+ player.cards + 
        //     "\n**Your bet: **"+ bet +
        //     "Ᵽ \nIf you do nothing, you surrender!"}], components: [actionBar]});
    }

    //RESULTS//
    let resultTitle, resultMessage = ""
    let payout = 0;

    if(result == -1)
    {
        resultTitle=playerName+" Busted..."
        resultMessage="Got a little bit too greedy!"
    }
    else if(result == 0)
    {
        resultTitle=playerName+" Surrendered..."
        resultMessage="Don't let the pressure get to you!"
        payout = Math.floor(bet/2)
    }
    else
    {
        let playerScore = scoreHand(player)
        let dealerScore = scoreHand(dealer)

        //I believe the dealer is REQUIRED to hit at 16 or less, even if they are winning
        while(dealerScore<=16)
        {
            hitHand(dealer)
            dealerScore = scoreHand(dealer)
        }

        //we dont need to check if the player is over 21, we already did.
        if(dealerScore>21 || playerScore>dealerScore){
            resultTitle=playerName+" Won!"
            resultMessage="Luck is on your side today!"
            payout = 2*bet
        }
        else if(dealerScore===playerScore){
            resultTitle=playerName+" Pushed."
            resultMessage="Not too bad!"
            //Since this is funny game for funny made up money, lets make it so you EARN money over time playing it.
            payout = Math.ceil(bet*1.5)
        }
        else{
            resultTitle=playerName+" Lost..."
            resultMessage="The house always wins!"
        }
    }

    //Payout pikzels
    payout -= bet;
    if(payout!=0) await Bank.adjustBalance(interaction.user.id, payout, "Gambling")

    let finalReport = {embeds:[{title:resultTitle,
                    description: "**Dealer's hand: **"+ dealer.cards +
                    "\n**Your hand: **"+ player.cards + 
                    "\n**Your bet: **"+ bet +
                    "Ᵽ\n**Your take: **"+ payout +
                    "Ᵽ\n" +resultMessage}], components: []}
    //if the player just walks away, this gets mad at us for sending another update for their last response.
    try {
        await playerResponse.update(finalReport);
    } catch (e)
    {
         await interaction.editReply(finalReport);
    }

}


function hitHand(hand){
    let draw = pickRandom(ranks);
    let v = 1;

    switch(draw)
    {
        //We have at least one ace
        case "A": hand.hasAce=true; break;

        //faces are 10
        case "J": 
        case "K":
        case "Q": v = 10; break;

        //Everything else is its number
        default: v = draw;
    }
    hand.count += v;
    hand.cards.push(draw)
}

function scoreHand(hand) {
    let difference = 21 - hand.count

    //If we don't have an ace to turn into an 11, or doing so would bust, we're done.
    if(!hand.hasAce || difference<10) return hand.count

    //heres the thing. Only one ace can be worth 11. The others have to be worth 1, or you bust.
    return (hand.count) + 10
}

function buildActionBar(doubleDown = false){
    actionBar = new MessageActionRow()

    let hit = new MessageButton()
            .setCustomId('hit')
            .setLabel("Hit")
            .setStyle("PRIMARY")
    let stay = new MessageButton()
            .setCustomId('stay')
            .setLabel("Stay")
            .setStyle("SECONDARY")

    actionBar.addComponents(hit,stay)

    if(doubleDown)
    {
        let double = new MessageButton()
            .setCustomId('double')
            .setLabel("Double Down")
            .setStyle("SUCCESS")
        actionBar.addComponents(double)
    }

    let surrender = new MessageButton()
            .setCustomId('quit')
            .setLabel("Surrender")
            .setStyle("DANGER")
    actionBar.addComponents(surrender)

    return actionBar
}
