const Discord = require('discord.js');
const sql = require("sqlite");
const Database = require("./database");
const config = require("./config.json");

const db = new Database(sql);

const client = new Discord.Client();

client.on("message", async (message) => {
    try {
        await onMessage(message);
    }
    catch (ex) {
        logException("Unable to parse message", ex);
    }
});

client.on("messageReactionAdd", async (reaction, user) => {
    try {
        await onAddedReaction(reaction);
    }
    catch(ex) {
        logException("Unable to parse added reaction", ex);
    }
});

client.on("messageReactionRemove", async (reaction, user) => {
    try {
        await onRemovedReaction(reaction);
    }
    catch(ex) {
        logException("Unable to parse removed reaction", ex);
    }
});

function logException(message, exception) {
    let exceptionText = exception;
    if((typeof exception === "object") && (exception !== null)) {
        exceptionText = JSON.stringify(exception);
    }

    console.log(message + ": " + exceptionText);
}

async function onMessage(message) {
    if (message.content.startsWith("!holo <@")) {
        await getUserScores(message);
    }
    if (message.content.startsWith("!holo <:")) {
        await getEmojiScores(message);
    }
    else if (message.content.startsWith("!clear-holo")) {
        await clearScores(message);
    }
    else if (message.content.startsWith("!set-pin-channel")) {
        await registerPinChannel(message);
    }
    else if (message.content.startsWith("!populate-from-pins")) {
        await populatePinsToPinChannel(message);
    }
    else if (message.content.startsWith("!help-holo")) {
        await message.channel.send(
            "Холо - девочка, которая собирает реакции на сообщения\n" +
            "Посмотреть статистику по эмоции можно \n" +
            "!holo :smile:\n" +
            "by fullhouse#6969");
        // "As an admin you can use these commands:" + 
        // "!clear-scores - clears emoji scoreboard (for all emojis)" +
        // "!set-pin-channel - sets the channel that pins will be posted to" + 
        // "!populate-from-pins - when you already have pins using Discord pins you might want to populate your pin channel from there, this does that");
    }
}

async function onAddedReaction(reaction) {
    let emoji = reaction.emoji.name;
    let author = reaction.message.author;

    if (author.bot) {
        return;
    }

    await db.addToScore(emoji, author, 1);

//    if (emoji == "📌") {
//        await pinMessage(reaction.message);
//    }
}

async function onRemovedReaction(reaction) {
    let emoji = reaction.emoji.name;
    let author = reaction.message.author;

    if (author.bot) {
        return;
    }

    await db.addToScore(emoji, author, -1);
}

async function pinMessage(message) {
    try {
        let pinChannel = await getPinChannel(message.guild);
        let date = message.createdAt;
        let pinDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        let header = "--- " + message.author.username + " at " + pinDate + " ---";
        pinChannel.send(
            header + "\n" +
            message);
    }
    catch (ex) {
        message.channel.send("Unable to pin message: " + ex);
    }
}

async function getEmojiScores(message) {
    let emoji = message.content.substring(5);
    try {
        let data = await db.getEmojiScore(emoji);
        let results = data
            .map(score => score.username + ": " + score.points)
            .join("\n");
        let response = "Почетные получатели " + emoji + "\n" + results;
        message.channel.send(response);
    }
    catch (err) {
        console.error(err);
    }
}

async function getUserScores(message) {
    let userid = message.content.substring(5);
    try {
        let data = await db.getUserScore(userid);
        let results = data
//            .map(score => score.emoji + ": " + score.points)
            .map(score => (client.emojis.find(emoji => emoji.name === score.emoji) || score.emoji) + ": " + score.points)
            .join("\n");
        let response = "Че у нас обычно кушает " + userid + "\n" + results;
        message.channel.send(response);
    }
    catch (err) {
        console.error(err);
    }
}

async function clearScores(message) {
    if (!isVerifiedAdmin(message)) {
        return;
    }

    await db.clear();
    message.channel.send("Cleared");
}

async function registerPinChannel(message) {
    if (!isVerifiedAdmin(message)) {
        return;
    }

    try {
        let channelName = message.content.substring(16);
        await db.setSetting("PinChannel", channelName);
        message.channel.send("Set pin channel to " + channelName);
    }
    catch (ex) {
        message.channel.send("Unable to register pin channel: " + ex);
    }
}

async function populatePinsToPinChannel(message) {
    if (!isVerifiedAdmin(message)) {
        return;
    }

    try {
        let pins = await message.channel.fetchPinnedMessages();
        pins.array().reverse().forEach(async pinnedMessage => {
            await pinMessage(pinnedMessage);
        });
    }
    catch (ex) {
        message.channel.send("Unable to populate pin channel: " + ex)
    }
}

async function getPinChannel(guild, pinChannelName) {
    if (!pinChannelName) {
        pinChannelName = await db.getSetting("PinChannel");
    }

    pinChannelName = pinChannelName.trim();
    let pinChannel = guild.channels.find(channel => channel.name == pinChannelName);
    if (!pinChannel) {
        throw "ERROR: channel " + pinChannelName + " does not exist";
    }

    return pinChannel;
}

function isVerifiedAdmin(message) {
    if (message.author.id !== config.ownerId) {
        message.channel.send(message.author.username + " does not have permission to clear scores");
        return false;
    }

    return true;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

client.on('error', console.error);

async function start() {
    await db.load();
    console.log("Starting login");
    await client.login(config.token);
    console.log('Logged in to Discord');
}

start();
