const botSettings = require("./botsettings.json")
var Discord = require('discord.js');
const fs = require('fs');
var bot = new Discord.Client({autoReconnect:true});
//var matchmakingTextChannel;
var streamAlertsChannel;
var surveysTextChannel;
//var messageForMatchmakingRoles;
var messageForSkillSurvey;
var matchmaker;
var lastMatchmakingActivity

// the current lists of MatchSeeks, Matches

//IDs
const textChannelIDForWelcome = botSettings.textChannelIDForWelcome
const textChannelIDForSetupHelp = botSettings.textChannelIDForSetupHelp
const textChannelIDForSkillVerification = botSettings.textChannelIDForSkillVerification
const channelIDStreamAlerts = botSettings.channelIDStreamAlerts
const roleIDNewMember = botSettings.roleIDNewMember
const roleIDInactive = botSettings.roleIDInactive
const reactionIdentLock = botSettings.reactionIdentLock //:lock:
const reactionIdentUnlock = botSettings.reactionIdentUnlock //:unlock:
const unicodeLock = botSettings.unicodeLock //🔒
const unicodeUnlock = botSettings.unicodeUnlock //🔓
const reactionIdentGetMatchChannelPermissions = botSettings.reactionIdentGetMatchChannelPermissions //:microphone:
const unicodeGetMatchChannelPermissions = botSettings.unicodeGetMatchChannelPermissions //🎙
const unicodeBoot = botSettings.unicodeBoot // "unicodeBoot": "👢",
const reactionIdentBronze = botSettings.reactionIdentBronze //:one:
const reactionIdentSilver = botSettings.reactionIdentSilver //:two:
const reactionIdentGold = botSettings.reactionIdentGold //:three:
const reactionIdentPlatinum = botSettings.reactionIdentPlatinum //:four:
const reactionIdentDiamond = botSettings.reactionIdentDiamond //:five:
const reactionIdentMaster = botSettings.reactionIdentMaster //:six:
const validSkillRoleStrings = ['Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Master (pending verification)', 'Diamond (pending verification)', 'Platinum (pending verification)']
const textChannelIDForSurveys = botSettings.textChannelIDForSurveys
const skillSurveyMessageContent = '__**Skill Survey**__\n\nPlease estimate your own skill at the game.  I\'ve put together a scale from Bronze to Master.\n\nTo answer, just click a reaction button corresponding to the number next to the skill level you think most closely matches your current skill.\n\nPlease answer as accurately as possible.  We\'d appreciate it if you don\'t joke and rank yourself way higher or way lower than your actual approximate skill.\n\n:one: **Bronze**\n-Very little or no experience with the game\n-mostly goes for 4 combos if anything.\n-prefers difficulty level 1\n\n:two: **Silver**\n-understands how to lower the stack (get rid of towers and fill holes)\n-looks for 5-6 combos\n-sets up x2 chains (not so many skill chains)\n-comfortable on levels 2-4\n\n:three: **Gold**\n-comfortable on level 5\n-can do some skill chains, usually just in the nick of time.\n-great at chaining off of transforming garbage\n\n:four: **Platinum**\n-Comfortable on level 8.\n-good at recognizing patterns and building long skill chains.\n\n:five: **Diamond**\n-comfortable on level 10\n-strategizes on what kinds of garbage to send and when, and when to stop a chain.\n-sees chains many links ahead, and can quickly send exactly the garbage he wants.\n\n:six: **Master**\n-great at incorporating lots of medium-large combos while chaining, which produces very high garbage output.\n-often takes advantage of time lag chains, and can often work on two chains at once.\n-deep game sense, knowing when to do certain things that will give him/her an advantage, like always knowing just how much garbage is required to top out the opponent.'


const messageIDForSkillSurvey = botSettings.messageIDForSkillSurvey
//skill IDs
const roleIDMaster = botSettings.roleIDMaster
const roleIDDiamond = botSettings.roleIDDiamond
const roleIDPlatinum = botSettings.roleIDPlatinum
const roleIDGold = botSettings.roleIDGold
const roleIDSilver = botSettings.roleIDSilver
const roleIDBronze = botSettings.roleIDBronze
const roleIDMasterPending = botSettings.roleIDMasterPending
const roleIDDiamondPending = botSettings.roleIDDiamondPending
const roleIDPlatinumPending = botSettings.roleIDPlatinumPending
const channelIDMaster = botSettings.channelIDMaster
const channelIDDiamond = botSettings.channelIDDiamond
const channelIDPlatinum = botSettings.channelIDPlatinum
const channelIDGold = botSettings.channelIDGold
const channelIDSilver = botSettings.channelIDSilver
const channelIDBronze = botSettings.channelIDBronze
const cordeliasPrefix = botSettings.cordeliasPrefix
const reactionIdentChallenge = botSettings.reactionIdentChallenge // :crossed_swords:
const reactionIdentAcceptChallenge = botSettings.reactionIdentAcceptChallenge  //:OK:
const reactionIdentLogMatchSeeks = botSettings.reactionIdentLogMatchSeeks //:wrench:
const reactionIdentNoMike = botSettings.reactionIdentNoMike //:keyboard:
const delayInSecBeforeNonPlayersCanJoinChat = botSettings.delayInSecBeforeNonPlayersCanJoinChat //in seconds (NOT MILLISECONDS) i.e. 10 for 10 seconds
var maintenanceIntervalInMin = botSettings.maintenanceIntervalInMin
if (isNaN(maintenanceIntervalInMin)){
  log(`Error: botSettings file does not contain a valid maintenanceIntervalInMin.  Using 10 minutes`)
  maintenanceIntervalInMin = 10
}
var inactivityActions
if (botSettings.hasOwnProperty('inactivityActions')) {
  inactivityActions = botSettings.inactivityActions
}else{
  log(`Error: No inactivityActions specified in botSettings.json.  We will not change matchmaking roles for inactivity.`)
  inactivityActions = []
}
var matchmakingPlatforms
if (botSettings.hasOwnProperty('matchmakingPlatforms')) {
  matchmakingPlatforms = botSettings.matchmakingPlatforms
}else{
  log(`Fatal Error: No matchmakingPlatforms specified in botSettings.json. `)
  matchmakingPlatforms = []
  throw ''; //exit the program
}
// Functions

// pauses running of code for duration passed in (in milliseconds)
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
function getDateTime() {
  var date = new Date();
  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;
  var min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;
  var sec  = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;
  var day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;
  return year + ":" + month + ":" + day + " " + hour + ":" + min + ":" + sec;
}
function log(message){
  console.log(`${getDateTime()} ${message}`)
}
function getSkillRoleString(member){
  // we'll return an empty string if the member doesn't have a skill role.
  let skillRoleString = ''
  validSkillRoleStrings.forEach(s => {
    if (member.roles.cache.some(x => x.name === s)){
      // return the first valid Skill Role as a string
      log('skill role found')
      skillRoleString = s
      return
    }
  })
  if (skillRoleString === '') log('skill role not found')
  return skillRoleString
}
class Matchmaker{
  constructor(){
    log('starting new matchmaker');
    this.matchSeekSet = new Set();
    this.matchSet = new Set();
    log('created new matchmaker');
    //log('matchmaker\'s matchSeekSet:\n' + this.matchSeekSet)

  }
  async addMatchSeek(matchSeek){
    let messageContent = `${matchSeek.seeker}`
    let skillRoleString = getSkillRoleString(matchSeek.seeker);
    if (skillRoleString !== '') messageContent += ` (${skillRoleString})`
    messageContent += ' **is looking for an opponent!**';
    if (matchSeek.pingAllowed) messageContent += `\n\n<@&${matchmakingPlatforms[matchSeek.platformIndex].roleIDLookingForOpponent}> <@&${matchmakingPlatforms[matchSeek.platformIndex].roleIDPotentiallyAvailable}>`;
    let message;
    try {
      message = await matchSeek.textChannel.send(messageContent);
      matchSeek.message = message;
      matchSeek.coreMessageContent = messageContent
      message.react(reactionIdentChallenge);
      log('we are around line 130');
      this.matchSeekSet.add(matchSeek);
      if (skillRoleString === '')
      matchSeek.seeker.send('Please note: I\'m not able to let everyone in #matchmaking know what your skill level is because you haven\'t answered the **Skill Survey** in #surveys yet.  Please take a second to have a look at that.\n\nIf you can\'t get it to work, please message @Jon_12156 and include your skill level. \n\nThanks')
      /*log('entire matchSeekSet:')
      this.matchSeekSet.forEach(function(matchSeekToPrint){
      log(matchSeekToPrint)
    })*/
    log(`New MatchSeek created:\nseeker: ${matchSeek.seeker.user.username}\ntextChannel: ${matchSeek.textChannel.name}\n`);
    return true;
    } catch (err) {
      log('MatchSeek creation failed');
      log(err);
      return false;
    }


  }
  updateMatchSeekMessage(matchSeek, customMessage){
    try{
      matchSeek.customMessage = customMessage
      log(`updating custom message for ${matchSeek.seeker}`)
      log(`Custom Message: \"${matchSeek.customMessage}\"`)
      matchSeek.message.edit(`${matchSeek.coreMessageContent}\n\n\"${matchSeek.customMessage}\"`)
    }
    catch(err){
      log('error updating custom message')
      log(err)
    }
  }
  removeMatchSeek(member){
    //remove any official matchSeeks (from this bot)
    sleep(1).then(() => {
      this.matchSeekSet.forEach(matchSeek =>{
        if (matchSeek.seeker === member){
          matchSeek.challenges.forEach(challenge => {
            matchmaker.removeMatchSeek
            matchSeek.removeChallenge(challenge)
          })
          this.matchSeekSet.delete(matchSeek)
          matchSeek.message.delete()
          .then(log('deleted message of official matchseek for ' + member.user.username))
          .catch(function(err){
            log(`failed to delete message for official match for ${member.user.username}.  Maybe it is already deleted.`)
            log(err)
          })
        }
      })
    }).then(() =>{
      matchmakingPlatforms.forEach(platform =>
        {
          // also remove any other messages saying the member "is looking", perhaps sent by cordelia
          platform.matchmakingTextChannel.messages.fetch().then(function(messageCollection){
            messageCollection.forEach(function(message, id){
              let msg = message.content.toUpperCase()
              //exceptions:
              // don't delete the messageForMatchmakingRoles
              if(id !== platform.messageIDForMatchmakingRoles){
                //delete messages that say the member is looking
                if(msg.includes(member.id) && msg.includes('IS LOOKING')){

                  log('deleting message: id:' + id + ' Message Content:' + message)
                  message.delete()
                  .then(log('deleted matchSeek message'))
                  .catch(() => undefined);
                }else{
                  //used to log which messages were not being deleted here.
                  //log('not deleting: id:' + id + ' Message Content:' + message)
                }
              }
            })
        })
      })
    })

  }
  removeChallenge(challenge){
    challenge.matchSeek.removeChallenge(challenge);
  }
  removeChallengesForMember(member){
    //log(this.matchSeekSet)
    log('matchSeeks before deletions:')
    matchmaker.matchSeekSet.forEach(function(matchSeek){
      log('matchSeek seeker: ' + matchSeek.seeker.user.username)
      log('challenges: ')
      matchSeek.challenges.forEach(function(challenge){
        log('challenger: ' + challenge.challenger.user.username)
      })
    })
    log('deleting any challenges where challenger = ' + member.user.username)
    this.matchSeekSet.forEach(matchSeek =>{
      matchSeek.challenges.forEach(challenge =>{
        log('challenger: ' + challenge.challenger)
        log('member having challenges removed: ' + member)
        if (challenge.challenger === member){
          log(challenge)
          matchSeek.removeChallenge(challenge)
          .then(log('deleted challenge message'))
          .catch(console.error())
        }
      })
    })
  }
  memberIsInAMatch(member){
    log(`Checking whether ${member.user.username} is in a match`)
    var memberFoundInMatch = false
    matchmaker.matchSet.forEach(match => {

      if (match.player1 === member || match.player2 === member){
        log(`They are.`)
        memberFoundInMatch = true
        return
      }
    })
    if (memberFoundInMatch) log(`They are.`)
    else log(`They aren't`)
    return memberFoundInMatch
  }

  removeLookingMessages(member, platformIndex){
    // removes from all platforms if platform not specified
    // remove any other messages saying the member "is looking", perhaps sent by cordelia
    matchmakingPlatforms.forEach(platform =>{
      if (typeof platformIndex == "undefined" || platformIndex === -1 || platform.platformName === matchmakingPlatforms[platformIndex].platformName){
        platform.matchmakingTextChannel.messages.fetch().then(function(messageCollection){
          messageCollection.forEach(function(message, id){
            let msg = message.content.toUpperCase()
            //exceptions:
            // don't delete the messageForMatchmakingRoles
            if(id !== platform.messageIDForMatchmakingRoles){
              //delete messages that say the member is looking
              if(msg.includes(member.id) && msg.includes('IS LOOKING')){

                log('deleting message: id:' + id + ' Message Content:' + message)
                message.delete()
                .then(log('deleted matchSeek message'))
                .catch(() => undefined);
              }else{
                //used to log which messages were not being deleted here.
                //log('not deleting: id:' + id + ' Message Content:' + message)
              }
            }
          })
        })
      }
    })
  }
  async addMatch(match){
    log('beginning of matchmaker addMatch method')
    matchmaker.removeLookingMessages(match.player1, match.platformIndex)
    matchmaker.removeLookingMessages(match.player2, match.platformIndex)
    matchmaker.endMatch(match.player1);
    matchmaker.endMatch(match.player2);
    sleep(500).then(() => {
      changeMatchmakingRole(match.player1, matchmakingPlatforms[match.platformIndex].roleIDInGame)
      changeMatchmakingRole(match.player2, matchmakingPlatforms[match.platformIndex].roleIDInGame)
      match.createVoiceChannel()
      match.createTextChannel()
      .then(sleep(1000)).then(() =>{
        this.matchSet.add(match);
        this.checkAndUpdateStreamsForMatch(match)
      })
      .catch(err => {
        log(`couldn't update streams`)
      })
    });

  }
  checkAndUpdateStreamsForMatch(match){
    let linkAddedToMatch = null
    log(`match.player1StreamURL = ${match.player1StreamURL}`)
    log(`match.player2StreamURL = ${match.player2StreamURL}`)
    linkAddedToMatch = match.checkAndUpdateStreams()
    log(`linkAddedToMatch = ${linkAddedToMatch}`)
    if(linkAddedToMatch){
      streamAlertsChannel.send(`${match.player1.user.username} vs ${match.player2.user.username}\n<${linkAddedToMatch}>`)
      log('sent a message in the stream alerts channel')
    }
    else{
      log('no stream was added')
    }
    log(`match.player1StreamURL = ${match.player1StreamURL}`)
    log(`match.player2StreamURL = ${match.player2StreamURL}`)
    //and then also announce a new stream in a separate channel

  }
  async createVoiceChannel(match){
    await match.createVoiceChannel();
    try{
      log('Moving players to Voice Channel (if they were in another voice channel in this server)')

      match.player1.voice.setChannel(match.voiceChannel)
      match.player2.voice.setChannel(match.voiceChannel)
      log('players should have been moved to voice channel')
    }
    catch(err){
      log('Error moving players into the Voice Channel')
      log(err)
    }
  }
  cancelSeeksAndChallenges(member){
    this.removeChallengesForMember(member)
    this.removeMatchSeek(member)
  }

  //end a match where the member was a player
  endMatch(member){
    this.matchSet.forEach(match =>{
      if (match.player1 === member || match.player2 === member){
        try{
          if (match.textChannel){
            log('deleting TextChannel: ' + match.textChannel.name)
            match.textChannel.delete()
          }
        }
        catch(err){
          log('error deleting textChannel')
          log(err)
        }
        try{
          if (match.voiceChannel){
            log('deleting VoiceChannel: ' + match.voiceChannel.name)
            match.voiceChannel.delete()
          }
        }
        catch (err){
          log('error deleting VoiceChannel')
          log(err)
        }
        this.matchSet.delete(match)
        // Remove the opponent's IN-GAME role.
        // set the opponent as POTENTIALLY AVAILABLE if they aren't already LOOKING for another opponent.
        if (match.player1 === member ){
          if (match.player2.roles.cache.has(matchmakingPlatforms[match.platformIndex].roleIDLookingForOpponent)
           && match.player2.roles.cache.has(matchmakingPlatforms[match.platformIndex].roleIDInGame)){
            match.player2.roles.remove(member.guild.roles.cache.get(matchmakingPlatforms[match.platformIndex].roleIDInGame))
          }
          else{
            changeMatchmakingRole(match.player2, matchmakingPlatforms[match.platformIndex].roleIDPotentiallyAvailable)
          }
        }
        if (match.player2 === member ){
          if (match.player1.roles.cache.has(matchmakingPlatforms[match.platformIndex].roleIDLookingForOpponent)
           && match.player1.roles.cache.has(matchmakingPlatforms[match.platformIndex].roleIDInGame)){
            match.player1.roles.remove(member.guild.roles.cache.get(matchmakingPlatforms[match.platformIndex].roleIDInGame))
          }
          else{
            changeMatchmakingRole(match.player1, matchmakingPlatforms[match.platformIndex].roleIDPotentiallyAvailable)
          }
        }
        if (match.matchAnnouncement !== null) {
          log(`matchAnnouncement to delete: ${match.matchAnnouncement.content}`)
          match.matchAnnouncement.delete();
          log('deleted matchAnnouncement')
        }
      }
    })
  }


  memberIsSeeking(member){
    let isSeeking = false
    this.matchSeekSet.forEach(matchSeek =>{
      if (matchSeek.seeker === member) isSeeking = true
    })
    return isSeeking
  }
  //returns a matchSeek object if there is a current matchSeek where the member is the seeker
  getMatchSeek(member){
    let toReturn = null
    this.matchSeekSet.forEach(matchSeek =>{
      if (matchSeek.seeker === member){
        toReturn = matchSeek
      }
    })
    return toReturn
  }
  async disconnectMemberFromVoice(member){
    log(`Attempting to disconnect ${member.user.username} from voice chat`)
    if (member.voice.channel){
      let tempChannelName = `booting-${member.user.username}`
      //remove special characters from the channel name
      tempChannelName = format_channel_name(tempChannelName)
      log(`Trying to create temporary voice channel with name: ${tempChannelName}`)
      await member.guild.channels.create(tempChannelName, {
        type: 'voice',
        permissionOverwrites: [{
          type: 'role',
          id:member.guild.id,
          deny:0x400 //'VIEW_CHANNEL'
          },{
          type: 'member',
          id:member.id,
          allow:0x400 //'VIEW_CHANNEL'
          },{
          type: 'member',
          id:member.guild.me.id, //add's permission for this bot's user to view the channel
          allow:0x400 //'VIEW_CHANNEL'
        }],
        reason: `temp channel to remove ${member.user.username} from voice chat`})
      .then(channel =>{
        log(`Created Temporary channel to move ${member.user.username} to...`)
        member.voice.setChannel(channel)
        .then(() => {
          log('Moved them. Now deleting the temporary channel')
          channel.delete()
          .then(() => {
            log(`SUCCESS. ${member.user.username} has been disconnected from voice chat.`)
          }).catch(err =>{
            log(`Failed to delete the temporary Channel`)
          })
        }).catch(err =>{
          log(`Failed to move them to the temporary channel`)
        })
      }).catch(err => {
        log(`Failed to create temporary channel and so cannot disconnect ${member.user.username} from voice chat}`)
        log(err)
      })
    }
    else {
      log(`${member.user.username} is not connected to voice`)
    }
  }
}
function format_channel_name(stringIn){
  var arr  = stringIn.split('')
  var stringOut = []
  for(var i = 0; i < arr.length; i++){
    if (arr[i].match(/[A-Za-z0-9-_]/)){
      stringOut.push(arr[i])
    }
  }
  return stringOut.join('')
}
class Spectator{
  constructor(member, match){
    this.member = member
    this.match = match
    this.spectatorAnnouncement = null
  }
  createSpectatorAnnouncement(){
    this.match.textChannel.send(`${this.member} has joined the chat`).then(message => {
      this.spectatorAnnouncement = message
      message.react(unicodeBoot)
    }).catch(err=> {
      log(err)
    })
  }
}
class Match{
  constructor(matchID , player1, player2, announceChannel) {
    this.id = matchID
    this.player1 = player1
    this.player2 = player2
    this.player1StreamURL = ''
    this.player2StreamURL = ''
    this.textChannel = null
    this.platformIndex = findIndexOfRelatedPlatform(announceChannel)
    this.announceChannel = announceChannel // the channel where it is announced the match has started.  may or may not use this
    this.matchAnnouncement = null
    this.voiceChannel = null
    this.voiceChatInvite = null
    this.controlPanelMessage = null
    this.locked = false
    this.allowOthersToJoinDelayDone = false
    this.spectators = new Set()
    this.coreAnnouncementMessage = ''
  }
  addMemberAsSpectator(memberToAdd){
    log(this.textChannel.name)
    if (this.memberIsAPlayerInMatch(memberToAdd) || this.memberIsASpectatorInMatch(memberToAdd)){
      log(`${memberToAdd.user.username} is already in the match`)
      memberToAdd.user.send(`This reaction grants you access to a match.  You were already in this match.  You should be able to see its channels at to top of the list.`)
    }
    else {
      this.textChannel.createOverwrite(memberToAdd.user, {VIEW_CHANNEL: true})
      this.voiceChannel.createOverwrite(memberToAdd.user, {VIEW_CHANNEL: true})
      log(`applying read permission for a match's channels for ${memberToAdd.user.username}`)
      let spectator = new Spectator(memberToAdd, this)
      this.spectators.add(spectator)
      spectator.createSpectatorAnnouncement()
    }

  }
  removeMemberAsSpectator(memberToRemove){
    let success = false
    this.spectators.forEach(spectator => {
      if (spectator.member.id === memberToRemove.id){
        this.textChannel.createOverwrite(memberToRemove.user, {VIEW_CHANNEL: false})
        this.voiceChannel.createOverwrite(memberToRemove.user, {VIEW_CHANNEL: false})
        matchmaker.disconnectMemberFromVoice(spectator.member)
        log(`removing read permission for a match's channels for ${memberToRemove.user.username}`)
        this.spectators.delete(spectator)

        success = true
      }
      if (!success){
        log(`Failed to remove member from match because they aren't in the match as a spectator`)
      }
    })
  }
  //returns the member that is a player in a match that was not the member passed in, or null if the passed member is not a player.
  otherPlayer(member){
    let answer = null
    if (this.player1 === member){
      answer = this.player2
    }else if (this.player2 === member){
      answer = this.player1
    }
    return answer
  }
  memberIsAPlayerInMatch(member){
    if (this.player1 === member) return true
    if (this.player2 === member) return true
    return false
  }
  memberIsASpectatorInMatch(member){
    let answer = false
    this.spectators.forEach(spectator => {
      if (spectator.member.id === member.id) answer = true
    })
    return answer
  }
  //the following method also returns a promise of the match having been announced.
  createTextChannel(){
    return new Promise((resolve, reject) => {
      //create Text Channel
      let channelName = this.player1.user.username + '-vs-' + this.player2.user.username
      let matchAnnounced = false
      //remove special characters from the channel name
      channelName = format_channel_name(channelName)

      let channelName2 = channelName;
      log(`channelName2 = ${channelName2}`)
      log(`Trying to create text channel with name: ${channelName}`)
      this.player1.guild.channels.create(channelName,
        {
          type: 'text',
          permissionOverwrites:[{
            type: 'role',
            id:this.player1.guild.id,
            deny:0x400 //'VIEW_CHANNEL'
            },{
            type: 'member',
            id:this.player1.id,
            allow:0x400 //'VIEW_CHANNEL'
            },{
            type: 'member',
            id:this.player2.id,
            allow:0x400 //'VIEW_CHANNEL'
            },{
            type: 'member',
            id:this.player1.guild.me.id, //add's permission for this bot's user to view the channel
            allow:0x400 //'VIEW_CHANNEL'
          }],
          reason: "match text channel"
        })
      .then(channel =>{
        this.textChannel = channel
        // TO DO: limit this.textChannel permissions
        this.coreAnnouncementMessage = `${channelName} is now in progress, <@&${matchmakingPlatforms[this.platformIndex].roleIDSpectators}>!\nPlayers, please proceed to ${channel} to chat with your opponent.`
        //let msg = 'CHALLENGE ACCEPTED! \nPlease proceed to ' + channel

        this.announceChannel.send(this.coreAnnouncementMessage)
        .then(messageSentSuccessfully => {
          this.matchAnnouncement = messageSentSuccessfully
          log('announced message for ' + channel.name)
          matchAnnounced = true
          resolve(this.matchAnnouncement)
        }).catch(err => {
          log('failed to announce ' + channel.name)
          matchAnnounced = false
          reject(err)
        })
        log(this.coreAnnouncementMessage)
        let controlPanelMessageContent = `${this.player1} vs ${this.player2}\n\n**Match Control Panel**\n:unlock: (Default) Allow other people to join chat (text/voice)\n:lock: Do not allow other people to join chat\n:white_check_mark: Look for a new opponent\n:bell: Leave match and change me to Potentially Available\n:no_bell: Leave match and change me to Do Not Notify`
        this.textChannel.send(controlPanelMessageContent)
        .then(async controlPanelMessage =>{
          this.controlPanelMessage = controlPanelMessage
          await this.controlPanelMessage.react(reactionIdentUnlock)
          await this.controlPanelMessage.react(reactionIdentLock)
          await this.controlPanelMessage.react(matchmakingPlatforms[this.platformIndex].reactionIdentLookingForOpponent)
          await this.controlPanelMessage.react(matchmakingPlatforms[this.platformIndex].reactionIdentPotentiallyAvailable)
          await this.controlPanelMessage.react(matchmakingPlatforms[this.platformIndex].reactionIdentDND)
        })
        .catch(err =>{
          log(`Match channel creation failed.  Here's the error:`)
          log(err)
          let errmsg = `MATCH ACCEPTED!  ${this.player1} vs ${this.player2}\n Match channel creation failed.  Please DM eachother`
          //let errmsg = 'CHALLENGE ACCEPTED!\n Match channel creation failed.  Please DM eachother'
          this.announceChannel.send(errmsg)
        })
        .then(() => {
          //wait 10 seconds before adding a button for other users to join chat
          //this is to allow time for a player to lock the chat before a non-player jumps in.
          //granted, this is imperfect because the user could react themselves before the bot adds the reaction.
          sleep(delayInSecBeforeNonPlayersCanJoinChat*1000).then(async ()=>{
            //if the match chat isn't locked already
            log('It is now 10 seconds after the match start')
            if(!this.locked && !this.allowOthersToJoinDelayDone){
              log('Conditions met for adding reactions to the announcement')
              try{
                await this.matchAnnouncement.react(reactionIdentUnlock)
                await this.matchAnnouncement.react(reactionIdentGetMatchChannelPermissions)
                this.allowOthersToJoinDelayDone = true
              }
              catch (err) {
                log('Did not add room-join reactions to the match announcement')
                log('Perhaps the room has already been closed? Here\'s the error:')
                log(err)
              }

            }else{
              log('Conditions not met for adding reactions to the announcement')
            }
          })
        })
        //maybe not here, but TO DO: remove any messages from the matchSeek.
      })
    })


  }
  checkAndUpdateStreams(){
    let linkAdded = null
    //log(`(this.player1StreamURL === '') is ${this.player1StreamURL === ''}`)
    //log(`this.player1StreamURL is: ${this.player1StreamURL}`)
    if (this.player1.presence.activities && this.player1.presence.activities.some(activity => activity.type === 'STREAMING') && this.player1StreamURL === ''){
      this.player1StreamURL = this.player1.presence.activities.find(activity => activity.type === 'STREAMING').url
      linkAdded = this.player1StreamURL
    }
    //log(`streamAdded for p1 is: ${streamAdded}`)
    //log(`now, this.player1StreamURL is: ${this.player1StreamURL}`)

    if (this.player2.presence.activities && this.player2.presence.activities.some(activity => activity.type === 'STREAMING') && this.player2StreamURL === ''){
      this.player2StreamURL = this.player2.presence.activities.find(activity => activity.type === 'STREAMING').url
      linkAdded = this.player2StreamURL
    }

    if (linkAdded){
      this.refreshMatchAnnouncementMessage()
    }
    return linkAdded
  }
  refreshMatchAnnouncementMessage(){
    let newMessageContent = ''
    newMessageContent = this.coreAnnouncementMessage
    if (this.player1StreamURL !== ''){
      newMessageContent += `\n${this.player1.user.username}'s stream: <${this.player1StreamURL}>`
    }
    if (this.player2StreamURL !== ''){
      newMessageContent += `\n${this.player2.user.username}'s stream: <${this.player2StreamURL}>`
    }
    this.matchAnnouncement.edit(newMessageContent)
  }
  updateMatchAnnouncementMessage(newMessage){
    this.matchAnnouncement.edit(newMessage)
  }
  appendToMatchAnnouncementMessage(stringToAppend){
    this.matchAnnouncement.edit(`${this.matchAnnouncement.content}\n${stringToAppend}`)
  }
  async createVoiceChannel(){
    let channelName = `voice-${this.player1.user.username}-vs-${this.player2.user.username}`
    //remove special characters from the channel name
    channelName = format_channel_name(channelName)

    let channelName2 = channelName;
    log(`channelName2 = ${channelName2}`)
    log(`Trying to create channel with name: ${channelName}`)

    await this.player1.guild.channels.create(channelName,
      {
        type: 'voice',
        permissionOverwrites:
        [{
          type: 'role',
          id:this.player1.guild.id,
          deny:0x400 //'VIEW_CHANNEL'
          },{
          type: 'member',
          id:this.player1.id,
          allow:0x400 //'VIEW_CHANNEL'
          },{
          type: 'member',
          id:this.player2.id,
          allow:0x400 //'VIEW_CHANNEL'
          },{
          type: 'member',
          id:this.player1.guild.me.id, //add's permission for this bot's user to view the channel
          allow:0x400 //'VIEW_CHANNEL'
        }],
        reason: 'match voice channel'
      })
    .then(channel =>{
      log('assigning voiceChannel property')
      this.voiceChannel = channel
      log('done assigning voiceChannel')
      log(this.voiceChannel)
    })
  }
  lockChat(){
    this.locked = true
    this.allowOthersToJoinDelayDone = true
    //change the permissions of this.textChannel and this.voiceChannel such that they no longer have permissions for Everyone to view them.
  }
  unlockChat(){
    this.locked = false
    this.allowOthersToJoinDelayDone = true
    //change the permissions of this.textChannel and this.voiceChannel such that they do have permissions for Everyone to view them.
  }
}
class MatchSeek {

  constructor(seeker, textChannel, pingAllowed) {
    this.seeker = seeker;
    this.textChannel = textChannel;
    this.platformIndex = findIndexOfRelatedPlatform(textChannel)
    this.challenges = new Set();
    this.pingAllowed = pingAllowed;
    this.message = null;
    this.coreMessageContent = ''
    this.customMessage = ''
    this.controlPanelMessage = null
    this.allowOthersToJoinDelayDone = false
  }
  addChallenge(challenge){
    this.challenges.add(challenge)
  }
  removeChallenge(challenge){
    this.challenges.delete(challenge)
    challenge.message.delete()
  }

  /*async sendMessage() {

}*/
}
class Challenge {
  constructor(challenger, matchSeek) {
    this.challenger = challenger; //the member who is challenging somebody
    this.matchSeek = matchSeek;
    this.message = null;
    this.pingAllowed = true; // whether the message sent will ping the match seeker, alllowed by default
  }
  allowPing(pingAllowed){
    if (typeof pingAllowed == 'boolean'){
      this.pingAllowed = pingAllowed;
    }
  }
  async challengeMatchSeek() {
    let messageContent = this.challenger.toString()
    let skillRoleString = getSkillRoleString(this.challenger);
    if (skillRoleString !== '') messageContent += ` (${skillRoleString})`
    messageContent += ' offers to play with ';
    if (this.pingAllowed){
      messageContent += this.matchSeek.seeker.toString();
    }
    else{
      messageContent += this.matchSeek.seeker.user.username;
    }
    let message;
    try {
      message = await this.matchSeek.textChannel.send(messageContent);
      await this.matchSeek.addChallenge(this);
      this.message = message;
      await this.message.react(reactionIdentAcceptChallenge);
      log(this.challenger.user.username + ' offers to play with ' + this.matchSeek.seeker.user.username);
      return true
    } catch (err) {
      log('Challenge creation failed');
      log(err);
      return false;
    }


    //log(this)
    //log(`New Challenge created:\nseeker: ${this.matchSeek.seeker.username}\nchallenger: ${this.challenger.username}\ntextChannel: ${this.message.textChannel}\n`);
    //log('New Challenge created:\nseeker: ' + this.matchSeek.seeker.username + '}\nchallenger: ' + this.challenger.username)


  }
}

//determine which platform uses the newRoleID
function findIndexOfRelatedPlatform(searchTerm){
  return matchmakingPlatforms.findIndex(function(platform){
    return Object.keys(platform).findIndex(key => platform[key] === searchTerm) !== -1
  })
  //returns -1 if platform isn't found
}

function findPlatformHavingName(name){
  return matchmakingPlatforms.find(platform => platform.platformName === name)

}

async function changeMatchmakingRole(member, newRoleID) {
  //if the member is a bot, don't do anything
  if (member.bot) return;
  //determine which platform uses the newRoleID
  var platformIndex
  var platform = null
  await (platformIndex = findIndexOfRelatedPlatform(newRoleID))
  if (platformIndex === -1) {
    log(`Error: platform not found with given newRoleID ${newRoleID}`)
    return
  }
  else{
    platform = matchmakingPlatforms[platformIndex]
  }
  if (!lastMatchmakingActivity[platformIndex]){
    lastMatchmakingActivity[platformIndex] = {}
  }
  lastMatchmakingActivity[platformIndex][member.id] = Date.now()
  //do stuff depending on what matchmaking role roleString represents
  if (newRoleID === platform.roleIDLookingForOpponent) {
    member.roles.remove([platform.roleIDLookingForOpponent,platform.roleIDPotentiallyAvailable,platform.roleIDDoNotNotify,roleIDNewMember,roleIDInactive]);//but don't remove "in-game" role, to allow looking while in-game
    if (!matchmaker.memberIsInAMatch(member)){
      log(`member not in a match. also removing @in-game`)
      sleep(500).then(() =>{
        member.roles.remove(platform.roleIDInGame)
      })
    }
    // pause a moment for roles to be finished being removed
    sleep(500).then(() => {
      //assign '@looking for Opponent'
      var role = member.guild.roles.cache.find(x => x.id === platform.roleIDLookingForOpponent);
      member.roles.add(role);
      log('Added role \'@Looking for Opponent\' for platform ' + platform.platformName + ' to member ' + member.user.username);


      //send a message in the matchmaking channel alerting people that a user wants to play
      sleep(1).then(async function(){
        const matchSeekToAdd = new MatchSeek(member, platform.matchmakingTextChannel, true);

        //await matchSeekToAdd.sendMessage();

        //if (matchSeekToAdd.message){
        if(matchmaker.addMatchSeek(matchSeekToAdd)){
          log('added match seek to matchSeekSet')
        }
        else(
          log('did not add match seek to matchSeekSet')
        )
        //  log('matchseek added to list');
        //} else {
        //  log('matchseek message was null');
        //}
      });
      /*sleep(1).then(async function(){
      let matchSeekToAdd = await new MatchSeek(member, matchmakingTextChannel, true)
      await sleep(2000).then(() =>{
      if (matchSeekToAdd.message !== null){
      currentMatchSeekSet.add(matchSeekToAdd)
      log('matchseek added to list')
    }
    else{
    log('matchseek message was null')
  }
});
})*/

//matchmakingTextChannel.send(member.user + ' **is looking for an opponent!**\n\n<@&' + roleIDLookingForOpponent+ '> <@&' + roleIDPotentiallyAvailable + '>')
})
return;
}
  if (newRoleID === platform.roleIDPotentiallyAvailable) {
    removeAllMatchmakingRoles(member, platformIndex);
    // pause a moment for roles to be finished being removed
    sleep(500).then(() => {
      //assign '@looking for Opponent'
      var role = member.guild.roles.cache.find(x => x.id === platform.roleIDPotentiallyAvailable);
      member.roles.add(role);
      log('Added role \'@Potentially available\' for platform ' + platform.platformName + ' to member ' + member.user.username);
      //cancel any existing game seek
    })
    return;
  }
  if (newRoleID === platform.roleIDDoNotNotify) {
    removeAllMatchmakingRoles(member, platformIndex); //todo: have this function remove all matchmaking roles on all platforms if a platform is not specified.
    // pause a moment for roles to be finished being removed
    sleep(500).then(() => {
      //assign '@looking for Opponent'
      var role = member.guild.roles.cache.find(x => x.id === platform.roleIDDoNotNotify);
      member.roles.add(role);
      log('Added role \'@Do Not Notify\' to member ' + member.user.username);
      //cancel any existing game seek
    })
    return;
  }
  if (newRoleID === platform.roleIDInGame) {
    removeAllMatchmakingRoles(member) //if they are going to in-game status, we remove all matchmaking roles from all platforms
    // pause a moment for roles to be finished being removed
    sleep(500).then(() => {
      //assign '@in-game'
      var role = member.guild.roles.cache.find(x => x.id === platform.roleIDInGame);
      member.roles.add(role);
      log('Added role \'@In-Game\' to member ' + member.user.username);
      //cancel any existing game seek
    })
    return;
  }
  // if we are here, we didn't return, so we didn't change a role
  log('Role for member ' + member.user.username + ' not changed because \'' + roleString + '\' is not a valid role name')
}

function addRoleToMember(roleID, member){
  var role = member.guild.roles.cache.find(x => x.id === roleID);
  member.roles.add(role);
  log('Added role ' + role.name + ' to member ' + member.user.username);
}
//the following function removes all matchmaking roles.  Note: this should be given a half second
//before code with subsequent role changes gets run.
//use like this, for example:
/*
removeAllMatchmakingRoles(member)
sleep(500).then(() => {
// Do the stuff that should follow the removeAllMatchmakingRoles function call
})
*/
function removeAllMatchmakingRoles(member, platformIndex) {
  try{
    var rolesToRemove = []
    matchmakingPlatforms.forEach(platform =>{
      //removes all matchmaking roles in a given platform, or for all platforms if platformIndex isn't specified
      if (typeof platformIndex == "undefined" || platform.platformName === matchmakingPlatforms[platformIndex].platformName){
        rolesToRemove = rolesToRemove.concat([platform.roleIDInGame,platform.roleIDLookingForOpponent,platform.roleIDPotentiallyAvailable,platform.roleIDDoNotNotify])
        log(`removing all matchmaking roles for platform ${platform.platformName} from ${member.user.username}...`)
      }
    })
    rolesToRemove = rolesToRemove.concat([roleIDNewMember,roleIDInactive])
    log(`removing roles: ${rolesToRemove.toString()}`)
    member.roles.remove(rolesToRemove)
  }
  catch(err){
    log(`Error in removeAllMatchMakingRoles:`)
    log(err)
  }
}
function removeAllSkillRoles(member) {
  //remove all skill roles
  member.roles.remove([roleIDMaster, roleIDDiamond, roleIDPlatinum, roleIDGold, roleIDSilver, roleIDBronze, roleIDMasterPending, roleIDDiamondPending, roleIDPlatinumPending])
  log('removing all skill roles from ' + member.user.username + '...')

}
function changeSkillRole(member, roleString){
  //if roleString represents a valid role
  if(validSkillRoleStrings.indexOf(roleString) > -1){
    removeAllSkillRoles(member)
    sleep(500).then(() => {
      let roleID = member.guild.roles.cache.find(x => x.name === roleString).id
      addRoleToMember(roleID, member)
    });
    if(roleString.includes("pending")){
      //message the member
      try{
        member.send('Thank you for taking the skill survey!  Note:  for skill levels above Gold, your skill role will say "(pending verification)" on the end of it.  After you\'ve proved your skill by playing well enough against players of the skill level you\'ve selected, a moderator can give you the appropriate role without the "(pending verification)" on the end.')
      } catch (err) {
        log('Failed to send member a message, perhaps they have blocked DMs?')
        log(err)
      }

      //report this event to the skill-verification channel
      try{
        skillVerificationTextChannel.send(`${member} is now ${roleString}.`)
      } catch (err) {
        log('Failed to send a message in the skill-verification channel')
        log(err)
      }
    }
  }

}

// Listener Event: message
bot.on('message', message => {

  // Variables
  var sender = message.author; // the person who sent the message
  var msg = message.content.toUpperCase(); //we'll compare everything as uppercase so as to nove have commands be case-sensitive
  var prefix = '>'; // the text before commands for this bot, can be changed later

  if (msg === prefix + 'PING') {
    message.channel.send('Pong!') //sends message to the channel with the contents "Pong!"
  }
  // Cammands will only be run if the message was sent in a channel we are accepting commands in.
  // the Shockbot-commands channel's ID is 389650317026787329
  matchmakingPlatforms.forEach(platform =>{
    if (message.channel.id === platform.textChannelIDForMatchmaking){
      if (msg.startsWith(prefix)){

        if (msg === prefix + 'LOOKING' || msg === prefix + 'LO') {
          changeMatchmakingRole(message.member, platform.roleIDLookingForOpponent)
        }
        else if (msg === prefix + 'LURKING' || msg === prefix + 'AVAILABLE' || msg === prefix + 'LU'){
          changeMatchmakingRole(message.member, platform.roleIDPotentiallyAvailable)
        }
        else if (msg === prefix +'DND'){
          changeMatchmakingRole(message.member, platform.roleIDDoNotNotify)
        }
        else if (msg === prefix +'INGAME' || msg === prefix + 'IG' || msg === prefix + 'IN-GAME'){
          changeMatchmakingRole(message.member, platform.roleIDInGame)
        }
        else {
          let errorMessage = '\''+ message.content + '\' is an unrecognized command.\nCurrently, supported commands are the following, preceded by a \'' + prefix + '\'\nlooking, lo,\nlurking, lu,\ningame, ig,\ndnd '
          message.author.send(errorMessage)
          log('Direct Message sent to ' + message.author.username + ': ' + errorMessage)
        }
      }
      //if the sender is not a bot, delete the message after it's been processed
      if(!sender.bot){
        //give Cordelia some time to process the message before we delete it
        if (msg.startsWith(cordeliasPrefix)){
          sleep(3000).then(() => {
            try{
              message.delete();
              log('deleted message')
            }
            catch (err){
              log('couldn\'t delete message. Maybe it already got deleted by cordelia?')
            }
          });
        }
        else{
          //if the sender has an active matchSeek
          if (matchSeek = matchmaker.getMatchSeek(message.member)){
            //append the message content to the matchseek message so the seeker can customize the matchSeek
            //for example, they can add something like "accepting all challenges", or "Platinum only", or "First to 10 wins"
            log('DETECTED MESSAGE FROM A MATCH SEEKER')
            matchmaker.updateMatchSeekMessage(matchSeek, message.content);
          }
          try{
            message.delete();
            log('deleted message')
          }
          catch (err){
            log('couldn\'t delete message.')
          }
        }
      }
    }
  })

});
function guildMemberUpdate(platforms, oldMember, newMember,){
  var delayForNextIteration
  setTimeout(function() {
      // Add tasks to do
  }, 3000 * i);
}

bot.on('guildMemberUpdate', (oldMember, newMember) => {
  //if a member loses their '@looking For Opponent' Role
  var wait = 0
  matchmakingPlatforms.forEach(async function(platform){
    let p = new Promise(function(resolve, reject){
      resolve(1);
    })
    p.then(sleep(wait)).then(wait = 0).then(() => {
      if(oldMember.roles.cache.some(role => role.id === platform.roleIDLookingForOpponent) && !newMember.roles.cache.some(role => role.id === platform.roleIDLookingForOpponent)){
        //try to remove any messages in the matchmaking channel that indicated they were Looking for Opponent
        log(newMember.user.username + ' is no longer Looking for Opponent.\nTrying to delete messages indicating they were looking')
        matchmaker.removeMatchSeek(newMember);
        wait = 500
      }
    }).then(sleep(wait)).then(wait = 0).then(() => {
      if(newMember.roles.cache.some(role => role.id === platform.roleIDDoNotNotify) && !oldMember.roles.cache.some(role => role.id === platform.roleIDDoNotNotify)){
        log(`${newMember.user.username} changed to Do Not Notify`)
        matchmaker.cancelSeeksAndChallenges(newMember);
        wait = 500
      }
    }).then(sleep(wait)).then(wait = 0).then(() => {
      if(newMember.roles.cache.some(role => role.id === platform.roleIDInGame) && !oldMember.roles.cache.some(role => role.id === platform.roleIDInGame)){
        log(`${newMember.user.username} changed to In-Game`)
        matchmaker.cancelSeeksAndChallenges(newMember);
        wait = 500
      }
    }).then(sleep(wait)).then(wait = 0).then(() => {
      if(oldMember.roles.cache.some(role => role.id === platform.roleIDInGame) && !newMember.roles.cache.some(role => role.id === platform.roleIDInGame)){
        // member was in-game and now is not. End any match they were in.
        log(newMember.user.username + ' is no longer in-game.\n Ending any matches they were in.')
        matchmaker.endMatch(newMember);
        wait = 500
      }
    })
  })
});

// Listener Event: Bot Launched
bot.on('ready', () => {
  log('Bot Launched...') //Runs when the bot it Launched

  var errorCount = 0;
  matchmaker = new Matchmaker();
  //log(matchmaker);
  matchmakingPlatforms.forEach(platform =>{
    try { //try to find the matchmaking channel
      log(`specified textChannelIDForMatchmaking for platform ${platform.platformName} = ${platform.textChannelIDForMatchmaking}`)
      platform.matchmakingTextChannel = bot.channels.cache.get(platform.textChannelIDForMatchmaking)
      log(`found the matchmaking channel for platform ${platform.platformName}. ID: ${platform.matchmakingTextChannel.id}`)
    }
    catch (e) {
      log(`ERROR: Could not find the matchmaking channel for platform ${platform.platformName}`)
      log(e)
      errorCount += 1;
    }
    //try { //try to fetch the message with messageIDForMatchmakingRoles
    platform.matchmakingTextChannel.messages.fetch(platform.messageIDForMatchmakingRoles).then(function(fetchedMessage){
      log(`found the message for Matchmaking Role assignment for platform ${platform.platformName}`)
      platform.messageForMatchmakingRoles = fetchedMessage
      try{
        platform.messageForMatchmakingRoles.reactions.cache.forEach(function(matchmakingMessageReaction){
          matchmakingMessageReaction.users.fetch();
        });
        log(`fetched users who had previously reacted to the matchmaking message for platform ${platform.platformName}`)
      }
      catch (err){
        log(`ERROR fetching users who had previously reacted to the matchmaking message for platform ${platform.platformName}`)
        log(err)
      }
      sleep(1).then(async function(){
        //TO DO: check if we have added the appropriate reactions to the messageForMatchmakingRoles
        //if not, add them
        //for now, just add the appropriate reactions
        await platform.messageForMatchmakingRoles.react(platform.reactionIdentLookingForOpponent);
        await platform.messageForMatchmakingRoles.react(platform.reactionIdentPotentiallyAvailable);
        await platform.messageForMatchmakingRoles.react(platform.reactionIdentInGame);
        await platform.messageForMatchmakingRoles.react(platform.reactionIdentDND);
        await platform.messageForMatchmakingRoles.react(platform.reactionIdentSpectator);
        //await messageForMatchmakingRoles.react(reactionIdentLogMatchSeeks);
        log(`reactions added to the messageForMatchmakingRoles for platform ${platform.platformName}`)
      });
    }).catch(function(e){
      log('ERROR: Could not find the message for Matchmaking Role assignment')
    });
  })
  try { //try to find the matchmaking channel
    surveysTextChannel = bot.channels.cache.get(textChannelIDForSurveys)
    log('found the Surveys channel')
  }
  catch (e) {
    log('ERROR: Could not find the surveys channel')
    errorCount += 1;
  }
  try { //try to find the matchmaking channel
    streamAlertsChannel = bot.channels.cache.get(channelIDStreamAlerts)
    log('found the stream-alerts channel')
  }
  catch (e) {
    log('ERROR: Could not find the stream-alerts channel')
    errorCount += 1;
  }
  try { //try to find the matchmaking channel
    skillVerificationTextChannel = bot.channels.cache.get(textChannelIDForSkillVerification)
    log('found the skill-verification channel')
  }
  catch (e) {
    log('ERROR: Could not find the skill-verification channel')
    errorCount += 1;
  }
  //one time, send the skillSurveyMessage.  We'll comment this out after it's been added once
  /*
  let surveysChannel = bot.channels.cache.get(textChannelIDForSurveys)
  surveysChannel.send(skillSurveyMessage)
  log('added skillSurveyMessage  to ' + surveysChannel)
  */
  //update the skillSurveyMessage


  // place reactions on the SkillSurveyMessage
  surveysTextChannel.messages.fetch(messageIDForSkillSurvey).then(function(fetchedMessage2){
    log('found the message for the Skill Survey')
    messageForSkillSurvey = fetchedMessage2
    try{
      messageForSkillSurvey.reactions.cache.forEach(function(skillSurveyReaction){
        skillSurveyReaction.users.fetch()
      });
      log('fetched users who had previously reacted to the skill survey')
    }
    catch (err){
      log('ERROR fetching users who had previously reacted to the skill survey')
      log(err)
    }

    sleep(1).then(async function(){
      //also (when uncommented) update the Skill Survey message content.
      //await messageForSkillSurvey.edit(skillSurveyMessageContent)
      await messageForSkillSurvey.react(reactionIdentBronze);
      await messageForSkillSurvey.react(reactionIdentSilver);
      await messageForSkillSurvey.react(reactionIdentGold);
      await messageForSkillSurvey.react(reactionIdentPlatinum);
      await messageForSkillSurvey.react(reactionIdentDiamond);
      await messageForSkillSurvey.react(reactionIdentMaster);

      log('reactions added to the message for Skill Survey')
      //Run these only once, then comment them out
      //bot.channels.cache.get(platform.textChannelIDForMatchmaking).send(`Click a reaction to change your matchmaking status\n:white_check_mark: Looking for Opponent\n:bell: Potentially Available\n:no_entry: In-Game\n:no_bell: Do Not Notify / Can't play right now\n\nIf a player is already looking for an opponent, you can offer to play with them by clicking the :crossed_swords:\nThey can then accept by clicking :ok:\nNote: You can also add a custom message to your match request by sending a message in here.\n:lock: or :unlock: indicate whether a match's channels are locked.\nIf unlocked, you can click the :microphone2: to get access to the match's channels as a "spectator."\n:eyes: Toggles on/off pings for new spectatable matches. (@Spectators role)\n\nNeed help?  See <#${textChannelIDForWelcome}> or ask in <#${textChannelIDForSetupHelp}>`)

      //bot.channels.cache.get(textChannelIDForSurveys).send(skillSurveyMessageContent)

      //optional:
      //update messageForMatchmakingRoles Note: this adds "(edited)" to the end of the message :(
      //messageForMatchmakingRoles.edit("")
      log('READY')
    });
  }).catch(function(e){
    log(e)
    log('ERROR: Could not find the message for the Skill Survey Message')
  });

  sleep(1).then(async function(){
    lastMatchmakingActivity = JSON.parse(fs.readFileSync("./lastMatchmakingActivity.json", "utf8"));
    log(`Successfully read lastMatchmakingActivity.json`)
  }).catch(function(e){
    log(e)
    log(`Error reading lastMatchmakingActivity.json. That's OK, we'll create a new file.`)
    lastMatchmakingActivity= {}
  });
  sleep(3000).then(async function(){ //wait a few seconds to ensure enough time to read the file
    //doMaintenance()  //hmm, running doMaintenance() here seems to break matchmaking, I may look at resolving that later.
      //Do stuff every so often:
      setInterval (function () {
        doMaintenance()
      }, maintenanceIntervalInMin * 60 * 1000) //every maintenanceIntervalInMin minutes
  }).catch(function(e){
    log(e)
    log('ERROR in Maintenance section.')
  });
});

function doMaintenance(){
  //log(`Maintenance:`)
  //Note: this looks like the bot might support multiple guilds.  It doesn't, currently.
  bot.guilds.cache.map((guild) => {
    //move members to less active roles over time
    matchmakingPlatforms.forEach(platform =>{
      //log(`for platform ${platform.platformName}`)
      var platformIndex = findIndexOfRelatedPlatform(platform.platformName)
      inactivityActions.forEach(action =>{
        //log(`for roleType ${action.roleType}`)
        guild.roles.cache.get(matchmakingPlatforms[platformIndex][action.roleType]).members.map(member =>{
          //log(`for member ${member.user.username}`)
          if (!lastMatchmakingActivity[platformIndex]){
            //log(`Platform not found in lastMatchmakingActivity, adding it`)
            lastMatchmakingActivity[platformIndex] = {}
          }
          if (!lastMatchmakingActivity[platformIndex][member.id]){
            //log(`${member.user.username} not found in lastMatchmakingActivity[platformIndex for ${lastMatchmakingActivity[platformIndex].platformName}]`)
            //log(`lastMatchmakingActivity[platformIndex for ${lastMatchmakingActivity[platformIndex].platformName}][${member.user.username}'s member.id] = now`)
            lastMatchmakingActivity[platformIndex][member.id] = Date.now()
          }else if (action.timeoutInMin && Date.now() - action.timeoutInMin * 60 * 1000 >= lastMatchmakingActivity[platformIndex][member.id]){
            //log(`time to change matchmaking role for ${member.user.username}`)
            changeMatchmakingRole(member, matchmakingPlatforms[platformIndex][action.nextRoleType])
            if (action.message && action.message != "") {
              member.send(action.message)
            }
          }else {
            //log(`nothing to do here`)
          }
        })
      })
    })
  })
  writeLastMatchmakingActivity()
}

function writeLastMatchmakingActivity(){
  fs.writeFile("./lastMatchmakingActivity.json", JSON.stringify(lastMatchmakingActivity), (err) => {
    if (err) log(err)
  });
}

bot.on('disconnect', event => {
  log('Disconnected from Internet')
});

// Listener Event: user joining the discord server.
bot.on('guildMemberAdd', member => {

  log('User ' + member.user.username + ' has joined the server!')

  // Add a role when they join: the role is 'member'.  This searches roles by role name
  var role = member.guild.roles.cache.find(x => x.id === roleIDNewMember);
  member.roles.add(role);
});

// Listener Event: a user left or joined a voice channel, or otherwise changed their voice state (mute/unmute..)
bot.on('voiceStateUpdate', (oldState, newState) => {
  let newMemberName = newState.member.user.username
  let joinedMatchVoiceChannel = false
  let joinedSomeVoiceChannel = false
  let sentVoiceChatInvite = false
  //log(`voiceStateUpdate for ${newMemberName}`)
  if(newState.channel){
    //log('member is in a voice channel in this server')
    if (!oldState.channel || oldState.channelID !== newState.channelID){
      //log('member was not previously in a voice channel or was in a different voice channel')
      //log('Therefore, we can say the member joined a channel')
      log(`${newMemberName} joined voice channel: ${newState.channel.name}`)
      joinedSomeVoiceChannel = true
      //now check through our Match list to see if the member joined a match channel
      matchmaker.matchSet.forEach(match =>{
        if (newState.channelID === match.voiceChannel.id){
          //log(`the channel joined is a match voice channel`)
          joinedMatchVoiceChannel = true
          if(match.memberIsAPlayerInMatch(newState.member)){
            let otherPlayer = match.otherPlayer(newState.member)
            let otherPlayerVoiceChannel
            if (otherPlayer) otherPlayerVoiceChannel = otherPlayer.voiceChannel
            if(!otherPlayerVoiceChannel || (otherPlayerVoiceChannel && otherPlayerVoiceChannel.id !== match.voiceChannel.id)){
              //log('other player is not in a voice channel, or is in a voice channel other than the match channel.')
              log(`inviting opponent ${otherPlayer.user.username} to the match voice channel`)
              match.textChannel.send(`${otherPlayer}, ${newMemberName} offers to voice chat in the channel: ${newState.member.voice.channel.name} \n\n Click :keyboard: if you can't or would rather not right now.`)
              .then(sentMessage => {
                sentVoiceChatInvite = true
                if (match.voiceChatInvite){
                  match.voiceChatInvite.delete()
                  .then(function(){
                    match.voiceChatInvite = null
                    log('deleted old voice chat invite')
                  }).catch(err =>{
                    log('Error deleting old voice chat invite')
                    log(err)
                  })
                }
                match.voiceChatInvite = sentMessage
                match.voiceChatInvite.react(reactionIdentNoMike)
              }).catch(err =>{
                log('Error sending voice chat invite')
                log(err)
              })


            }else if (!sentVoiceChatInvite){
              if (match.voiceChatInvite){
                match.voiceChatInvite.delete()
                .then(function(){
                  match.voiceChatInvite = null
                  log('both players have joined')
                  log('deleted voice chat invite')
                }).catch(err =>{
                  log('Error deleting voice chat invite')
                  log(err)
                })
              }
            }
          }

        }
      })
    }
  }else{
    log(`${newMemberName} disconnected from voice chat`)
  }
  /* //not interested in logging this right now
  //check mute/unmute
  if (newMember.selfMute && !oldMember.selfMute){
  log(`${newMemberName} muted themself`)
}else if(!newMember.selfMute && oldMember.selfMute){
log(`${newMemberName} unmuted themself`)
}
//check deafened/undefened
if (newMember.selfDeaf && !oldMember.selfDeaf){
log(`${newMemberName} deafened themself`)
}else if(!newMember.selfDeaf && oldMember.selfDeaf){
log(`${newMemberName} undeafended themself`)
}*/
})
bot.on('presenceUpdate', (oldPresence, newPresence) => {
  let member = newPresence.member
  matchmaker.matchSet.forEach(match =>{
    if (member.user.id === match.player1.user.id || member.user.id === match.player2.user.id) {
      if (newPresence.activities && newPresence.activities.some(activity => activity.type === "STREAMING")){
        log(`${member.user.username}'s presence changed, and they are currently streaming`)
        log(`oldPresence.activities is: ${oldPresence.activities}`)
        if (oldPresence.activities === null || !oldPresence.activities.some(activity => activity.type === "STREAMING")){
          log(`${member.user.username} was not previously streaming and now is.\nWe're having the matchmaker update the stream links.`)
          matchmaker.checkAndUpdateStreamsForMatch(match)
        }
      }
    }
  })
})

// Listener Event: user added a reaction
bot.on('messageReactionAdd', (messageReaction, user) => {
  messageReaction.message.guild.members.fetch(user).then(memberThatReacted => {
    // do stuff with memberThatReacted
    var emoji = messageReaction.emoji.identifier
    //check that the user making the reaction is not a bot
    if (!user.bot){
      //log('member reacting is not a bot')
      //log(`a user reacted to a message. messageReaction.emoji.name = ${messageReaction.emoji.name}`)
      let reactionIsToAMatchControlPanelMessage = false
      let matchOfControlPanelMessage = null
      //check if the reaction was to a match in progress or if it was to a message related to the match
      matchmaker.matchSet.forEach(match => {
        if (messageReaction.message.id === match.controlPanelMessage.id) {
          log(`${user.username}'s Reaction was to a Match Control Panel Message`)
          reactionIsToAMatchControlPanelMessage = true
          matchOfControlPanelMessage = match

        }
        if(messageReaction.message.id === match.matchAnnouncement.id){
          log(`${memberThatReacted.user.username} reacted to a match announcment`)
          if (messageReaction.emoji.identifier === reactionIdentGetMatchChannelPermissions) {
            log(`${memberThatReacted.user.username} requests permissions to join/view that match's channels`)
            if (!match.allowOthersToJoinDelayDone){
              memberThatReacted.send(`Joining the chat is not allowed yet.\nYou can join as soon as a player explicitly unlocks it, or if it has been ${delayInSecBeforeNonPlayersCanJoinChat} seconds since the start of the match and the players haven't locked it.`)
              log(`Denied them permission. Reason:  Joining the chat is not allowed yet.\nYou can join as soon as a player explicitly unlocks it, or if it has been ${delayInSecBeforeNonPlayersCanJoinChat} seconds since the start of the match and the players haven't locked it.`)
            }
            else if(!match.locked){
              //apply permissions to the match channels such that memberThatReacted gets permission to view them.
              match.addMemberAsSpectator(memberThatReacted)
            }
            else if(match.locked){
              log(`${memberThatReacted.user.username} tried to join a locked chat and was denied.  Channels are locked.`)
              memberThatReacted.send("Access Denied.  This match's chat channels are currently locked")
            }
            messageReaction.users.remove(memberThatReacted)
          }
        }
        if (messageReaction.emoji.name === unicodeBoot){
          match.spectators.forEach(spectator => {
            if (messageReaction.message.id === spectator.spectatorAnnouncement.id){
              log(`${memberThatReacted.user.username} tried to boot ${spectator.member.user.username} from a match`)
              if (memberThatReacted.id === match.player1.id || memberThatReacted.id === match.player2.id){
                match.removeMemberAsSpectator(spectator.member)
                match.textChannel.send(`${spectator.member} was booted by ${memberThatReacted}`)
                spectator.member.send(`${memberThatReacted.user.username} booted you from the match`)
                log(`spectator ${spectator.member.user.username} was booted by ${memberThatReacted.user.username}`)
                messageReaction.users.remove(memberThatReacted)
              }
              else if (memberThatReacted.id === spectator.member.id){
                //spectator is booting themself (leaving)
                match.removeMemberAsSpectator(spectator.member)
                match.textChannel.send(`${spectator.member} left`)
                log(`spectator ${spectator.member.user.username} left match ${match.textChannel.name}`)
                messageReaction.users.remove(memberThatReacted)
              }
              else {
                memberThatReacted.user.send(`Spectators are not allowed to boot people from matches`)
                log(`notified ${memberThatReacted.user.username} they aren't allowed to boot people from this match`)
                messageReaction.users.remove(memberThatReacted)
              }
            }
          })
        }
      })
      if (reactionIsToAMatchControlPanelMessage){
        if (emoji === reactionIdentLock){
          // they reacted to lock the chat
          log(matchOfControlPanelMessage)
          if (!matchOfControlPanelMessage.locked){
            if (!matchOfControlPanelMessage.memberIsAPlayerInMatch(memberThatReacted)){
              log(`${memberThatReacted.user.username} tried to lock the chat channels and was denied because they are not one of the original 2 players in the match`)
              memberThatReacted.user.send(`Spectators are not allowed to lock the chat`)
              messageReaction.users.remove(memberThatReacted)
            }
            else{
              matchOfControlPanelMessage.lockChat()
              matchOfControlPanelMessage.textChannel.send(`${memberThatReacted} locked the match chat channels`)
              log(`${user.username} locked their match chat channels`)
              //then also remove any reactions for /:lock:
              unlockReaction = matchOfControlPanelMessage.controlPanelMessage.reactions.cache.get("🔓")
              unlockReaction.users.cache.forEach(reactionUser => {
                if (reactionUser.id !== bot.user.id){
                  unlockReaction.users.remove(reactionUser)
                }
              })
              //add reaction(s) to the match announcment indicating chat is locked, and remove buttons for people to join and that indicate the match is not locked.
              sleep(1).then(async () => {
                unlockReaction = matchOfControlPanelMessage.matchAnnouncement.reactions.cache.get(unicodeUnlock)
                if (unlockReaction) {
                  unlockReaction.users.cache.forEach(reactionUser => {
                    unlockReaction.users.remove(reactionUser)
                  })
                }
                getMatchChannelPermissionsReaction = matchOfControlPanelMessage.matchAnnouncement.reactions.cache.get(unicodeGetMatchChannelPermissions)
                if (getMatchChannelPermissionsReaction) {
                  getMatchChannelPermissionsReaction.users.cache.forEach(reactionUser => {
                    getMatchChannelPermissionsReaction.users.remove(reactionUser)
                  })
                }
                await matchOfControlPanelMessage.matchAnnouncement.react(reactionIdentLock)
              })
            }

          }
          else{
            matchOfControlPanelMessage.textChannel.send(`${memberThatReacted}, the chat is already locked`)
          }
          return
        }
        else if (emoji === reactionIdentUnlock){
          //they reacted to unlock the chat
          if (!matchOfControlPanelMessage.memberIsAPlayerInMatch(memberThatReacted)){
            log(`${memberThatReacted.user.username} tried to unlock the chat channels and was denied because they are not one of the original 2 players in the match`)
            memberThatReacted.user.send(`Spectators are not allowed to unlock the chat`)
            messageReaction.users.remove(memberThatReacted)
          }
          else{
            if (!matchOfControlPanelMessage.locked){
              matchOfControlPanelMessage.textChannel.send(`${memberThatReacted}, the chat is already unlocked.\nPlayers can get permissions to view the channels by clicking the :microphone2: on your match announcement in <#${match.announceChannel}>`)
            }
            else{
              matchOfControlPanelMessage.unlockChat()
              matchOfControlPanelMessage.textChannel.send(`${memberThatReacted} unlocked the match chat channels`)
              log(`${user.username} unlocked the match chat channels`)
              //then also remove any reactions for /:lock: from the control panel message
              lockReaction = matchOfControlPanelMessage.controlPanelMessage.reactions.cache.get("🔒")
              lockReaction.users.cache.forEach(reactionUser => {
                if (reactionUser.id !== bot.user.id){
                  lockReaction.users.remove(reactionUser)
                }
              })
              //add reaction(s) to the match announcment indicating chat is unlocked, and a button for people to join.
              sleep(1).then(async () => {
                lockReaction = matchOfControlPanelMessage.matchAnnouncement.reactions.cache.get(unicodeLock)
                if (lockReaction) {
                  lockReaction.users.cache.forEach(reactionUser => {
                    lockReaction.users.remove(reactionUser)
                  })
                }
                await matchOfControlPanelMessage.matchAnnouncement.react(reactionIdentUnlock)
                await matchOfControlPanelMessage.matchAnnouncement.react(reactionIdentGetMatchChannelPermissions)

              })
            }
          }
          return
        }
      }
      matchmakingPlatforms.forEach(platform =>{
        //check if the message they reacted to the one for changing matchmaking status/role
        if (messageReaction.message.id === platform.messageIDForMatchmakingRoles || (reactionIsToAMatchControlPanelMessage && (matchmakingPlatforms[matchOfControlPanelMessage.platformIndex].platformName == platform.platformName))) {
          log('A user reacted with ' + emoji + ' to the matchmakingRoles or Match Control Panel Message');
          //Looking reaction
          if(emoji === platform.reactionIdentLookingForOpponent){
            if (matchOfControlPanelMessage && matchOfControlPanelMessage.memberIsASpectatorInMatch(memberThatReacted)){
              matchOfControlPanelMessage.textChannel.send(`${memberThatReacted} left`)
              matchOfControlPanelMessage.removeMemberAsSpectator(memberThatReacted)
            }
            changeMatchmakingRole(memberThatReacted, platform.roleIDLookingForOpponent);
          }
          else if(emoji === platform.reactionIdentPotentiallyAvailable){
            if (matchOfControlPanelMessage && matchOfControlPanelMessage.memberIsASpectatorInMatch(memberThatReacted)){
              matchOfControlPanelMessage.textChannel.send(`${memberThatReacted} left`)
              matchOfControlPanelMessage.removeMemberAsSpectator(memberThatReacted)
            }
            changeMatchmakingRole(memberThatReacted, platform.roleIDPotentiallyAvailable);
          }
          else if(emoji === platform.reactionIdentInGame){
            if (matchOfControlPanelMessage && matchOfControlPanelMessage.memberIsASpectatorInMatch(memberThatReacted)){
              matchOfControlPanelMessage.textChannel.send(`${memberThatReacted} left`)
              matchOfControlPanelMessage.removeMemberAsSpectator(memberThatReacted)
            }
            changeMatchmakingRole(memberThatReacted, platform.roleIDInGame);
          }
          else if(emoji === platform.reactionIdentDND){
            if (matchOfControlPanelMessage && matchOfControlPanelMessage.memberIsASpectatorInMatch(memberThatReacted)){
              matchOfControlPanelMessage.textChannel.send(`${memberThatReacted} left`)
              matchOfControlPanelMessage.removeMemberAsSpectator(memberThatReacted)
            }
            log(memberThatReacted.user.username + ' reacted Do Not Notify')
            changeMatchmakingRole(memberThatReacted, platform.roleIDDoNotNotify);
          }
          else if(emoji === platform.reactionIdentSpectator){
            log(`${memberThatReacted.user.username} reacted with the spectator role emoji`)
            var role = memberThatReacted.guild.roles.cache.get(platform.roleIDSpectators);
            if(memberThatReacted.roles.cache.has(platform.roleIDSpectators)) {
              memberThatReacted.roles.remove(role)
              memberThatReacted.send(`I've removed your ${role.name} role for ${platform.platformName}`)
            }
            else{
              memberThatReacted.roles.remove([roleIDNewMember,roleIDInactive])
              memberThatReacted.roles.add(role)
              memberThatReacted.send(`I've assigned you the ${role.name} role for ${platform.platformName}`)
            }

          }
          else if(emoji === reactionIdentLogMatchSeeks){
            log('matchSeeks:')
            matchmaker.matchSeekSet.forEach(function(matchSeek){
              log('matchSeek seeker: ' + matchSeek.seeker.user.username)
              log('challenges: ')
              matchSeek.challenges.forEach(function(challenge){
                log('challenger: ' + challenge.challenger.user.username)
              })
            })
            matchmaker.matchSet.forEach(match =>{
              matchmaker.checkAndUpdateStreamsForMatch(match)
            })
          }else log(memberThatReacted.user.username + ' reacted to messageForMatchmakingRoles with an invalid emoji')
          //remove the user's reaction
          messageReaction.users.remove(memberThatReacted)
        }
      })

      //if the message is the SkillSurveyMessage
      if (messageReaction.message.id === messageIDForSkillSurvey){
        log(memberThatReacted.user.username + ' reacted to messageForSkillSurvey with emoji with Identifier: ' + emoji)
        let reactionWasValid = true
        switch(emoji){
          case reactionIdentBronze:
          changeSkillRole(memberThatReacted, 'Bronze')
          break;
          case reactionIdentSilver:
          changeSkillRole(memberThatReacted, 'Silver')
          break;
          case reactionIdentGold:
          changeSkillRole(memberThatReacted, 'Gold')
          break;
          case reactionIdentPlatinum:
          changeSkillRole(memberThatReacted, 'Platinum (pending verification)')
          break;
          case reactionIdentDiamond:
          changeSkillRole(memberThatReacted, 'Diamond (pending verification)')
          break;
          case reactionIdentMaster:
          changeSkillRole(memberThatReacted, 'Master (pending verification)')
          break;
          default:
          log(memberThatReacted.user.username + ' reacted to the Skill Survey with an invalid emoji')
          messageReaction.users.remove(memberThatReacted)
          reactionWasValid = false
          break;
        }
        //remove any other Skill Survey answers they've posted
        messageForSkillSurvey.reactions.cache.forEach(function(skillSurveyReaction) {
          if(reactionWasValid && skillSurveyReaction.users.cache.some( user => user.id === memberThatReacted.user.id) && skillSurveyReaction !== messageReaction){
            skillSurveyReaction.users.remove(memberThatReacted)

          }
        });
      }

      // check if the reaction was on a MatchSeek message or challenge message
      else{
        matchmaker.matchSeekSet.forEach(function(matchSeek){
          if (matchSeek.message.id === messageReaction.message.id) {
            //log('the reaction was to a matchSeek')
            if (messageReaction.emoji.identifier === reactionIdentChallenge){
              if(memberThatReacted === matchSeek.seeker){
                memberThatReacted.send('You can\'t challenge yourself.  Please challenge another looking player, or wait for someone to challenge you.')
                log(memberThatReacted.user.username + ' tried to challenge themselves.  We DM\'ed them that they couldn\'t');
                messageReaction.users.remove(memberThatReacted);
              }
              else {
                sleep(1).then(async function(){
                  const challengeToAdd = new Challenge(memberThatReacted, matchSeek);
                  //add a challenge to that matchSeek's Challenge set
                  await challengeToAdd.challengeMatchSeek();
                });
              }
            }
          }
          else{
            //check if the reaction was on a challenge for the current matchSeek we are looking at.
            matchSeek.challenges.forEach(async function(challenge){
              if (challenge.message === messageReaction.message){
                log(`${memberThatReacted.user.username} reacted to a challenge message`)
                if (memberThatReacted !== challenge.matchSeek.seeker){
                  memberThatReacted.send('Only the person being challenged can accept the challenge.')
                  log(`Advised ${memberThatReacted.user.username} only the person being challenged can accept the challenge.`)
                  messageReaction.users.remove(memberThatReacted)
                }
                //this next check may be unnecessary
                else if (memberThatReacted === challenge.matchSeek.seeker){
                  // the challenge is accepted.  Remove the matchseek from the list, and create a match with the two players
                  //currentMatchSeekSet.delete(matchSeek)
                  //create a new match with ID the same as the matchseek message ID
                  let match = await new Match(matchSeek.message.id, matchSeek.seeker, challenge.challenger, matchSeek.textChannel)
                  log('new match:\n' + match)
                  await matchmaker.addMatch(match)
                }
              }
            })
          }
        })
      }
      //check if the reaction was to a match's voice chat invite
      matchmaker.matchSet.forEach(match => {
        if (match.voiceChatInvite && messageReaction.message === match.voiceChatInvite){
          log(`${memberThatReacted.user.username} reacted to a voice chat invite with ${messageReaction.emoji}`)
          if (emoji === reactionIdentNoMike && match.memberIsAPlayerInMatch(memberThatReacted)){
            log(`${memberThatReacted.user.username} declined the voice chat invite`)
            match.textChannel.send(`${match.otherPlayer(memberThatReacted)}, ${memberThatReacted.user.username} declined/canceled the voice chat invite`)
            match.voiceChatInvite.delete()
            .then(function(){
              match.voiceChatInvite = null
              log('deleted voice chat invite')
            }).catch(err =>{
              log('Error deleting voice chat invite')
              log(err)
            })
          }
        }
      })
    }

  })//.catch(function(err){
    //  log(err)
    //  log('ERROR in messageReactionAdd or could not resolve memberThatReacted from messageReactionAdd')
    //})
  });

  /* bot.on('messageReactionRemove', (messageReaction, user) => {
    messageReaction.message.guild.fetchMember(user).then(memberRemovingReaction => {

    });
  }); */


  if (true) {
    bot.login(botSettings.token);
  }
