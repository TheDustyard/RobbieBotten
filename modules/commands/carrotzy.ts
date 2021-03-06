import { CommandHandler, ParameterType } from "mechan.js";
import { Collection, Client } from "discord.js";
import * as Jimp from "jimp";
import { Database } from "sqlite";

module.exports.init = (handler: CommandHandler, database: Database, client: Client, config: Config) => {
    handler.createCommand("carrotzy")
        .addParameter("image url", ParameterType.Optional)
        .setDescription("Carrotzify the image from the url or the attached image")
        .setCategory("Fun Commands")
        .setCallback(async (context) => {
            context.channel.startTyping();
            let image = context.message.attachments.first() ? context.message.attachments.first() : { url: context.params.get("image url") };

            let imageurl = image.url;

            if (!imageurl) {
                context.channel.send("**Please attach an image, or give a url to an image**");
                context.channel.stopTyping();
                return;
            }

            let inputtedimage = await Jimp.read(imageurl).catch((reason) => {
                if (reason instanceof Error && reason.message.includes("no such file or directory,")) context.message.channel.send(`**Invalid URL**`);
                else context.message.channel.send(`**${reason}**`);
                context.channel.stopTyping();
                return;
            });
            if (inputtedimage) {
                (inputtedimage as any).pixelate(inputtedimage.bitmap.height/20)
                    .getBuffer(Jimp.MIME_PNG, (error: Error, buffer: Buffer) => {
                        context.channel.send("", {
                            files: [{
                                attachment: buffer,
                                name: "carrot.png"
                            }]
                        });
                        context.channel.stopTyping();
                    });
            }
        });
};