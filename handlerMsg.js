
// YTDL
const ytdl = require("ytdl-core");

// YT Map List
const ytMapList = require("./ytMapList");

// Prefix commands
const prefix = "!";

// Servers Queue
const queues = new Map();

// Handler
exports.analizar = function (message){

    if (message.author.bot) return;

    serverQueue = queues.get(message.guild.id);

    if (checkComm(message,"play")){
        add(message, serverQueue);
    } else if (checkComm(message,"skip")){
        skip(message, serverQueue);
    } else if (checkComm(message,"clear")){
        clear(message, serverQueue);
    } else if (checkComm(message,"stop")){
        stop(message, serverQueue);
    } else if (checkComm(message,"resume")){
        resume(message, serverQueue);
    } else if (checkComm(message,"list")){
        list(message, serverQueue);
    } else if (checkComm(message,"shuffle")){
        shuffle(message, serverQueue);
    } else if (checkComm(message,"purge")){
        purge(message);
    } else if (checkComm(message,"help")){
        help(message);
    } else if (checkComm(message,"")){
        message.channel.send("A los autistas los atiendo con !help");
    }

}

function checkComm(message,str){
    return message.content.startsWith(prefix + str);
}

// Functions

async function add(message, serverQueue){

    let source = message.content.split(" ")[1];

    let voiceChannel = message.member.voice.channel;
    
    if(!voiceChannel){
        message.channel.send("Primero te tenes que meter en un canal de voz. Paso un down y te dijo mogolico");
        return;
    }

    // TO DO ?playlist=asd
    if(!ytdl.validateURL(source)){
        message.channel.send("Ni una URL de YouTube sabes pegar d0wn del orto");
        return;
    }

    // Creo cola si no existe
    if(!serverQueue){

        serverQueue = {

            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: false

        }

        queues.set(message.guild.id, serverQueue);

        try{

            var connection = await voiceChannel.join();
            serverQueue.connection = connection;

        } catch(err){
            console.log(err);
            queues.delete(message.guild.id);
        }

    }

    let songs = [];

    if(source.includes("list")){
        
        let regex = /list=(.*?)(&|$)/g;
        let match = regex.exec(source);

        songs = await ytMapList.toList(match[1]);

        if (songs.length == 0) {
            message.channel.send("Ocurrio un error y no puedo agregar los temas");
            return;
        } else {
            message.channel.send(songs.length + " temardos a la lista. Para ver todos los temas usa !list");
        }


    } else {

        let songInfo = await ytdl.getInfo(source);
        let song = {
            title: songInfo.title,
            url: songInfo.video_url
        }

        songs.push(song);

        message.channel.send(song.title + " meti2 en la lista");

    }

    for (var i in songs){
        serverQueue.songs.push(songs[i]);
    }

    if(!serverQueue.playing){
        play(message.guild, serverQueue.songs[0]);
    }

}


function play(guild, song){

    let serverQueue = queues.get(guild.id);
    if(!serverQueue) return;

    if(!song){
        serverQueue.voiceChannel.leave();
        queues.delete(guild.id);
        return;
    }

    serverQueue.playing = true;


    const dispatcher = serverQueue.connection.play(ytdl(song.url))
        .on("start", () =>{
            serverQueue.textChannel.send("Estas escuchando: " + song.title);
        })
        .on("finish", () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on("error", error => {
            serverQueue.songs.shift();
            serverQueue.textChannel.send("No puedo reproducir '" + song.title + "' debido a " + error);
            serverQueue.textChannel.send("Saltando la song con autismo");
            play(guild, serverQueue.songs[0]);
        });

    dispatcher.setVolumeLogarithmic(serverQueue.volume/5);

}


function clear(message, serverQueue){

    if(!serverQueue) return;

    serverQueue.voiceChannel.leave();
    queues.delete(message.guild.id);

    serverQueue.textChannel.send("Playlist vacia como tu vida, al lobby pt");

}

function skip(message, serverQueue){

    if(!serverQueue) return;

    let args = message.content.split(" ");
    let songPos = 1;
    
    if(args.length >= 2){
        songPos = Number(args[1]);
    } 

    if(songPos > serverQueue.songs.length-1){
        serverQueue.textChannel.send("No existe esa cancion autista de mierda");
        return;
    }

    let nextSong = serverQueue.songs[songPos-1];

    if(!nextSong){
        serverQueue.textChannel.send("No hay otra cancion despues rey");
    } else {

        serverQueue.songs = serverQueue.songs.slice(songPos-1, serverQueue.songs.length);
        serverQueue.connection.dispatcher.end();
        serverQueue.textChannel.send("Saltando la song br0");

    }

}


function stop(message, serverQueue){


    if(!serverQueue) return;
    if(!serverQueue.connection) return;
    serverQueue.connection.dispatcher.pause();

    serverQueue.textChannel.send("Parando el carro b0eeeee");

}


function resume(message, serverQueue){

    if(!serverQueue) return;
    if(!serverQueue.connection) return;
    serverQueue.connection.dispatcher.resume();

    serverQueue.textChannel.send("Resumiendo lo que se daba, ndeaaaaaaah");

}

function list(message, serverQueue){

    if(!serverQueue){
        message.channel.send("No hay nada en la playlist");
        return;
    } 

    let msg = "";

    let songs = serverQueue.songs;

    for (var i in songs){

        if(parseInt(i) === 0){
            msg = msg + "** # - " + songs[i].title + "**\n";
        } else {
           msg = msg + i + "- " + songs[i].title + "\n"; 
        }
        
    }

    message.channel.send("**__Playlist:__**");
    message.channel.send(msg);

}

function shuffle(message, serverQueue){

    if(!serverQueue){
        message.channel.send("No puedo mezclar nada si la lista esta vacia tarado mental");
        return;
    } 

    let song = serverQueue.songs.shift();
    serverQueue.songs.sort(() => Math.random() - 0.5);
    serverQueue.songs.unshift(song);

    message.channel.send("Lo deje mas mezclado que cenizas de judio en Auschwitz");

}

function purge(message){

    async function doPurge(){

        message.delete();
        let fetched = await message.channel.messages.fetch().then(messages => {

            const botMessages = messages.filter(msg => msg.author.bot);
            message.channel.bulkDelete(botMessages);

        }).catch(error => message.channel.send("Error: " + error));

    }
    doPurge();

}

function help(message){

    let msg = "!play <url_yt>: Agrega la song a la playlist\n" + 
    "!skip <nro>: Salta la song que esta sonando\n" + 
    "!clear: Para y limpia lista de reproduccion\n" +
    "!stop: Para la cancion que esta sonando\n" +
    "!resume: Vuelve a reproducir la cancion que estaba sonando\n" +
    "!list: Muestra playlist\n" +
    "!shuffle: Mezcla la playlist\n" +
    "!purge: Elimina mensajes del bot\n";

    message.channel.send(msg);

}