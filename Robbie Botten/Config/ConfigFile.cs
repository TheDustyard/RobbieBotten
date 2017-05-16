﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RobbieBotten.Config {
    public class ConfigFile {
        [JsonProperty("bot_token")]
        public string BotToken { get; set; }
        [JsonProperty("command_prefix")]
        public char CommandPrefix { get; set; }

        [JsonProperty("announcements_channel")]
        public ulong AnnouncementsChannel { get; set; }

        [JsonProperty("twitter_accounts")]
        public List<long> TwitterAccouts { get; set; }
        [JsonProperty("youtube_accounts")]
        public Dictionary<string, string> YoutubeAccounts { get; set; }

        [JsonProperty("media_refresh")]
        public uint SocialTick { get; set; }

        [JsonProperty("twitter_api")]
        public TwitterAPI TwitterAPI { get; set; }
        [JsonProperty("youtube_api")]
        public YoutubeAPI YoutubeAPI { get; set; }

        [JsonProperty("1k")]
        public bool OneK { get; set; }

        public ConfigFile() {
            BotToken = "";
            CommandPrefix = '\\';

            TwitterAccouts = new List<long>();
            YoutubeAccounts = new Dictionary<string, string>();

            SocialTick = 15000;

            TwitterAPI = new TwitterAPI();
            YoutubeAPI = new YoutubeAPI();

            OneK = false;
        }
    }

    public class TwitterAPI {
        [JsonProperty("consumer_key")]
        public string ConsumerKey { get; set; }
        [JsonProperty("consumer_secret")]
        public string ConsumerSecret { get; set; }
        [JsonProperty("user_access_token")]
        public string UserAccessToken { get; set; }
        [JsonProperty("user_access_secret")]
        public string UserAccessSeceret { get; set; }

        public TwitterAPI() {
            ConsumerKey = "";
            ConsumerSecret = "";
            UserAccessToken = "";
            UserAccessSeceret = "";
        }
    }

    public class YoutubeAPI {
        [JsonProperty("key")]
        public string APIKey { get; set; }

        public YoutubeAPI() {
            APIKey = "";
        }
    }
}
