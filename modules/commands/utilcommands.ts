import { CommandHandler } from "mechan.js";
import { Collection, Client } from "discord.js";
import { Database } from "sqlite3";

module.exports = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    handler.createCommand('gmt')
        .setDescription('Get the current time in GMT')
        .setCategory('Utility Commands')
        .setCallback((context) => {
            context.channel.send(`It is **${new Date(Date.now()).toUTCString().replace(' GMT', '')}** in Greenwich, England`);
        });

    handler.createCommand('utc')
        .setDescription('Get the current UTC time')
        .setCategory('Utility Commands')
        .setCallback((context) => {
            context.channel.send(`The current UTC time is **${new Date(Date.now()).toUTCString().replace(' GMT', '')}**`);
        });
}