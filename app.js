// Init
var Discord = require("discord.js");
var bot = new Discord.Client();
var handlerMsg = require("./handlerMsg");

const {
    token
} = require("./config.json");

// Listener: Init Bot
bot.on("ready", () => {
    console.log("Arch Music by CDNievas");
    console.log("Node Version: " + process.version);
    console.log("Discord.js Version: " + Discord.version);
});

// Listener: Receive Messages
bot.on("message", async message => {
    handlerMsg.analizar(message);
});

bot.login(token);
