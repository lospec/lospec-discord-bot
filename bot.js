#!/usr/bin/env node
import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Partials } from 'discord.js';

console.log('starting bot...');
dotenv.config();

let client = new Client({ 
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages,  GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once('ready', async () => {
	console.log('\nLospec Bot v4 is logged in and ready.\n\n'+'█'.repeat(80), '\n\n');
});

client.login(process.env.DISCORD_BOT_TOKEN);