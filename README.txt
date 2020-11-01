Shockbot

Discord Bot in discord.js for 1v1 player matchmaking (finding opponents)

WHAT IT DOES:

Users may visit a #matchmaking channel, and click reactions on message to have roles assigned to them such as @Looking For Opponent, @Potentially available, or @Do Not Disturb.
When someone looks for an opponent, the bot sends a message pinging @Looking For Opponent and @Potentially available.
Other users can then click a reaction to that message to offer to play with the first player.
He or she can then accept by clicking a reaction to the offer message.
It then creates a text channel and a voice channel for the those two users, and deletes them when a user changes their role back to @Potentially Available or @Do Not Disturb.

There are more features.  I'll just list a few here:
Spectators may get permissions to access these "match" channels, if the players in the channels have not locked them.
Players may kick spectators.
The bot assigns the @New Members role to new players who join, and removes it when they first use #matchmaking.  You can use this to limit what @New Members have access to in Discord.  In my Discord server, I've removed access to most of the channels for @New Members to ensure they learn how to use matchmaking before they get distracted by other channels.

IMPLEMENTATION:

Note: I am currently uploading this on the condition that nobody asks me for help implementing / updating / fixing bugs.  Feel free to submit bug reports on github (there are several known bugs), but I may or may not address them.  I made this for my own server, and am only making it open source because people have asked for it.

One known bug is the bot will every once in a while do nothing when a player tries to accept an offer to play.  Players can just notice the reaction and just DM eachother, or start over by looking for opponent again.

Heads-up: this is my first javascript project ever, so a lot of the code/practices contained within are probably awful.  Be nice.  There may even be cases where your bot will crash because I did not try/catch an error or promise rejection.  Logging has told me that future versions of node.js/discord.js will crash if these are not handled.
If using windows, you might run the bot using the included shockbotautorespawn.bat to automatically restart the bot if it crashes.

Note: as of 5/30/2020, I am using node npm version 6.14.5 and discord.js version 12.2.0.

I will provide at least this much in the way of tips for getting started with this:

(I apologize in advance if any of this is not quite right.)

- You will need node.js installed on your computer (can use Windows or Linux).
- I learned how to set up discord.js, node.js, and my discord bot from this youtube playlist:  https://www.youtube.com/playlist?list=PLL9m5KjtRdzAubBDuYU6Rq7_OMvoS9zA7
- You'll need to make some Roles and Channels in your Discord Server to go along with what's listed in botsettings.json:  Fill in all the blanks (empty quotes "") in botsettings.json with info about your server.  You can get ID's for things by typing \@SomeRole or \#SomeChannel in your Discord Server.  You just need the number it shows you, for example 388352919952687115, and not the symbols around it like <#388352919952687115>.  If you enable developer mode in discord, you can right click a message and click "copyID" to get a message ID.
I think you can maybe get away with not having anything for "channelIDMaster" through "channelIDBronze", these were for a feature I ended up not implementing.
- For "messageIDForMatchmakingRoles" and "messageIDForSkillSurvey", you'll need to uncomment some code to have the bot send these messages once, then close your bot, update the botsettings.json with the message IDs and run your bot again. These lines of code are around line of code 1115 (at the time of this writing) Look for: //Run these only once, then comment them out    //bot.channels.get(textChannelIDForMatchmaking).send(`...
and look for //bot.channels.get(textChannelIDForSurveys).send(skillSurveyMessageContent)
Feel free to first edit line of code 48 (approximately) const skillSurveyMessageContent to represent what skills each level like Bronze or Master mean in your game.

For each channel you provided an ID for in botsettings.json, make sure your bot has read and send message permission in that channel.

Recently (around 10/30/2020), Discord started requiring the following be turned on for the bot to respond to role/presence changes:
The code *should* be redsigned to no longer need such information, but for now, I'm just turning them on:
https://discord.com/developers/applications
Your bot application > Settings > Bot > Privileged Gateway Intents
Toggle on "PRESENCE INTENT" AND "SERVER MEMBERS INTENT"

After you've got discord.js and node.js installed,
open a command prompt, cd (change directory) to the folder you are storing your bot files,
and run
node app.js

If all is well, you should get output from the bot something like this:
2018:12:05 12:24:35 Bot Launched...
2018:12:05 12:24:35 starting new matchmaker
2018:12:05 12:24:35 created new matchmaker
2018:12:05 12:24:35 textChannelIDForMatchmaking = 389669476515315724
2018:12:05 12:24:35 found the matchmaking channel. ID: 389669476515315724
2018:12:05 12:24:35 found the Surveys channel
2018:12:05 12:24:35 found the stream-alerts channel
2018:12:05 12:24:35 found the message for the Skill Survey
2018:12:05 12:24:35 fetched users who had previously reacted to the skill survey
2018:12:05 12:24:35 found the message for Matchmaking Role assignment
2018:12:05 12:24:35 fetched users who had previously reacted to the matchmaking message
2018:12:05 12:24:39 reactions added to the messageForMatchmakingRoles
2018:12:05 12:24:40 reactions added to the message for Skill Survey
2018:12:05 12:24:40 READY

That's all I can think of for now.  Again, I do not want to help people implement this.  I am uploading this because people have asked for it. But if you figure something out that should be added to or changed in the readme, feel free to submit a pull request to update the readme.  I don't make any promise that I will pull it, but I may.

-Jon_12156
