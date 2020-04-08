// Init
var Discord = require("discord.js");
var bot = new Discord.Client();
var handlerMsg = require("./handlerMsg");

const {
    token
} = require("./config.json");

// Listener: Init Bot
bot.on("ready", async () => {
    console.log("Arch Music by CDNievas");
    console.log("Node Version: " + process.version);
    console.log("Discord.js Version: " + Discord.version);

    await bot.user.setActivity((bot.guilds.cache.size).toString() + " servers !help", {type: "PLAYING"});
});

// Listener: Bot added to another server
bot.on("guildCreate", async () => {
    await bot.user.setActivity((bot.guilds.cache.size).toString() + " servers !help", {type: "PLAYING"});
});

// Listener: Receive Messages
bot.on("message", async message => {
    handlerMsg.analizar(message);
});

// Listener: Presence of member update
bot.on("presenceUpdate", async () => {
    await bot.user.setActivity((bot.guilds.cache.size).toString() + " servers !help", {type: "PLAYING"});
});

// Listener: When someones change voice channel
bot.on("voiceStateUpdate", async (oldMember, newMember) => {

    if(oldMember != undefined && oldMember != null){

        voiceChannel = oldMember.channel;

        if(voiceChannel != undefined && voiceChannel != null){
            handlerMsg.checkEmptyChannel(voiceChannel);
        }
        
    }

    await bot.user.setActivity((bot.guilds.cache.size).toString() + " servers !help", {type: "PLAYING"});
    
});

bot.login(token);
