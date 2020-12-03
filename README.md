# Lospec Discord Bot

<img align="left" width="200" height="200" src="https://i.imgur.com/i2DPIwL.png">

This is a discord bot library built on top of Discord.js, made for the Lospec Discord server. The main intent for this repository is to make it so people can contribute to our bot, but you could also build your own discord bot based on it. You gotta host it yourself though. Good luck with that. If you do, let us know! LB wishes he had more siblings.

Lospec Discord Server: https://Lospec.com/Discord

<br clear="both"/>

## Setup

#### Requirements:
* nodeJS v11.6
* npm
* git

### Setting up your development environment

1. [Fork](https://guides.github.com/activities/forking/#fork) this project on Github
2. Locally [clone](https://guides.github.com/activities/forking/#clone) from your fork.
3. In a the project working directory run `npm install` to download the required nodeJS modules
4. (Optional) [Configure](https://github.com/git-guides/git-remote#git-remote) your local git repo to have the original repository as `upstream` so you can directly [pull](https://github.com/git-guides/git-pull) from it


### Creating a Discord application

Make sure you have a discord set-up where you have admin permissions before following these steps
1. Enter the [Discord Developer Portal](https://discord.com/developers/applications) and create a `New Application`. This will be your testing application.
2. With the Application created, select the `Bot` tab from the left panel. Choose `Add bot`.
3. Under the username, there will be a section labelled `token`, this contains the secret token to be added to `CONFIG.json`. Do not share or commit it!
4. Replace `DISCORD_TOKEN` in the following snippet and save it as `CONFIG.json` in the project working directory:   
```json
{
  "config": {
    "token": "DISCORD_TOKEN"
  }
}
```
5. To invite your bot to your development server, go back to the `General Infomration` tab and note down the `Client ID`. Replace `CLIENT_ID` in the following URL with that number and visit it in your browser:   
`https://discord.com/oauth2/authorize?client_id=CLIENT_ID&scope=bot`
6. Follow through the instructions in the web browser and add your bot to your development server.

### Running the bot
To run the bot, access the project working directory in a terminal and run `npm run run`. 

## Modules

Lospec Bot runs on modules, which can be easily added or removed simply by managing the files within the `modules` folder.

To create a module, first create a .js file within the ./modules folder. This will automatically get found and included by the bot on startup.

Within that file, you'll probably want to create a new Module instance:

```js
new Module('module name', 'message', {}, function (message) {
    //do bot stuff here!
});
```
Here are the arguments for the Module class constructor:

1. **module name** - `(String)` - A text string used for logging
2. **event type** - `(String)` - What event should trigger this module (current options are `message`, `react` and `unreact`)
3. **trigger options** - `(Object)` - Further configuration options that determine when the bot is triggered. If not needed, pass an empty object.
    + **filter** - `(Regex)` - A regex instance to compare to messages. You can also pass just this regex instead of an options object.
    + **channel** - `(String | Array)` - A channel or array of channels which the module should respond in
    + **pingBot** - `(Boolean)` - Whether the module should only respond if this bot is pinged in the message
    + **rateLimit** - `(Int)` - How many minutes must pass after this module is called before it can be called again.
    +  **overLimit** - `(Function)` - A function to call when the rateLimit is exceeded (optional)
    +  **permissions** - `(String | Array)` - A permission or array of permissions that the user must have to use this module. List of permissions: https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
    +  **stopOnMatch** - `(Boolean)` - Whether the bot should stop searching for matching modules once this one is run. By default, this is `true` (it will stop after this module matches, unless you specify `false`). You can also continue searching dynamically by doing `return 'CONTINUE';` in your module (this must be done outside asyncronous functions of course)
4. **module function** - `(Function)` - The function called when a match is found. The arguments passed are as follows:
    + **message** - https://discord.js.org/#/docs/main/master/class/Message
	+ **user** - https://discord.js.org/#/docs/main/master/class/User
    + **reaction** (on react/unreact events)- https://discord.js.org/#/docs/main/master/class/MessageReaction

If something goes wrong while processing your module, you should throw an error, which will get caught and logged to the console:

```js
throw new Error('something bad happened!');
```

You can also throw the error outside of the module instance, doing so will stop any further loading within that module.

A file in the module folder doesn't have to contain just one module, some will require multiple. Just define multiple within that file, and you're good to go. They can even have the same name.

```js
new Module('mod', 'message', /^!command1$/i, myModule);
new Module('mod', 'message', /^!command2$/i, myModule);
function myModule () {/*do bot stuff!*/}
```

You can also user setInterval() to make some tasks that run periodically, you can then send messages with `client.channels.fetch(CHANNELID)`

## Globals

Aside from the Modules class, there are a few more global properties and functions that are available globally (within each module file without being declared).

- **CONFIG** - object containing all properties defined within CONFIG.json
- **client** - a reference to the client object instantiated in the main file https://discord.js.org/#/docs/main/stable/class/Client
- **log(`String` text)** - log text to console with [BOTNAME] prefix
- **send(`Message` message, `String` text)** - send text to message.channel
- **react(`Message` message, `String` emoji)** - react to a message with emoji (or array of emoji), should be a custom emoji name, or an actual emoji
- **sendEmoji(`Message` message, `String` emoji)** - send a single emoji. I forget why this is necessary to be honest.
- **pickRandom(`Array` options)** - pick a random item from an array

## Role Manager

Currently you need to configure the role manager via a role-manager-data.json.

```json
{
  "message title for reference": {
    "channelName": "channel name for reference",
    "channelId": "PASTE CHANNEL ID HERE",
    "messageId": "PASTE MESSAGE ID HERE",
    "roles": [
      {
        "name": "role name for reference",
        "emoji": "PASTE EMOJI OR CUSTOM EMOJI ID HERE",
        "role": "PASTE ROLE ID HERE"
      },
      {
        "name": "role name for reference",
        "emoji": "PASTE EMOJI OR CUSTOM EMOJI ID HERE",
        "role": "PASTE ROLE ID HERE"
      }
    ]
  }
}
```

## Reference

- [Discord.js Docs](https://discord.js.org/#/docs/) - Info on the library that powers this
- [Discord API Docs](https://discord.com/developers/docs/) - info on the back end API that Discord.js uses
- [Regex101](https://regex101.com/) - Easy regex writing / debugging
