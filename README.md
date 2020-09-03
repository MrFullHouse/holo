![holo](https://images-na.ssl-images-amazon.com/images/I/91FzI9qedLL._AC_SX425_.jpg)

# Holo-girl bot
A Discord bot that logs reactions and shows statistics for users and emoji's

Holo is extended version of reacty-bot https://github.com/SvDvorak/reacty (credits for @SvDvorak)

## Description
Created for the Храм света Пустоты #dank-memes

Anytime a reaction is made to a message it is logged and any user can call out to get the statistics for a specific emoji.

## Usage
Any time a message is reacted to the emoji-count for that emoji and that message owner is updated. Decreases counter when emoji is removed as well.


### Comands

Show statistics an emoji
```
!holo :emoji:
```
![Example emoji](https://i.imgur.com/KbLjZ6I.jpg)

```
!holo @username
```
![Example username](https://i.imgur.com/UGvGqA6.jpg)

customize your Holo-messages in reacty.js functions - getUserScores; getEmojiScores

## Setup
Install Docker if you don't already have it.

While in project root, run
```
docker-compose up
```
That will build the container and then start it. To run it detached run
```
docker-compose up -d
```

A QUICK NOTE: Bot currently can't handle multiple guilds

## Technical details
Bot is built using Discord.js with a SQLite backend for persistance. Docker is used to keep bot management easy, database is kept in a volume called database.
