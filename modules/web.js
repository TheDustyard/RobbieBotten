const Mechan       = require("mechan.js");
const express      = require("express");
const app          = express();
const https        = require("https");
const helmet       = require('helmet');
const fs           = require('fs');
const getRoutes    = require('get-routes');
const bodyParser   = require('body-parser');
const chalk        = require('chalk');

var configuration;

module.exports = (client, config, youtubechannel, feedbackchannel, database) => {
    configuration = config;

    const guild = client.guilds.find('id', config.guild);
    
    //const responses = new Mechan.Discord.WebhookClient('372486252546752518', '1HcfV24CP3IYCZEASOBNmYKiRsAVn-lF7vGT37bTGdum47C6AZpZr6eG9qaeptT-OVxT');
    
    var privateKey = fs.readFileSync('key.crt');
    var certificate = fs.readFileSync('certificate.crt');
    
    app.use(helmet());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    })); 

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    
    app.get('/', (req, res) => {
        res.send(error(`This is the endpoint for accessing and sending data to and from @Robbie Botten#3585`,
                       `You may be looking for ${url('https://grandayy.github.io/')}`));
    });

    app.get('/endpoints', (req, res) => {
        var contype = req.headers['content-type'];

        if (contype === 'application/json') {
            res.contentType('json').send(getRoutes(app));
        } else {
            let html = "<h1>Endpoints</h1>";
            
            let routes = getRoutes(app);
            for (method in routes) {
                if (method === 'acl')
                   continue;
                html += `<h2 style="margin-bottom: -5px;">${method.toUpperCase()}</h2><hr>`;
                for (endpoint of routes[method]) {
                    //console.log(method.toUpperCase() + " " + endpoint);
                    html += "&emsp;" + method.toUpperCase() + " " + url(endpoint) + "<br>"
                }
                html += `<br><br>`;
            }
            res.send(html);
        }
    });
    
    app.get('/guild', (req, res) => {
        res.contentType('text').send(trimGuild(guild));
    });
    
    // app.get('/users', (req, res) => {
    //     guild.fetchMembers();
    //     res.contentType('json').send(guild.members.map(x => x.user.id));
    // });

    app.get('/users', (req, res) => {
        guild.fetchMembers();

        let members = guild.members;
        let params = [
            "role", 
            "status", 
            "displayName", 
            "username", 
            "nickname",
            "bot",
            "level",
            "underLevel",
            "aboveLevel"
        ];
        
        if (req.query.role) {
            if (typeof req.query.role === typeof []) {
                members = members.filter(x => req.query.role.every(v => x.roles.array().map(x => x.id).includes(v)));
            } else {
                members = members.filter(x => x.roles.array().map(x => x.id).includes(req.query.role));
            }
        }
        if (req.query.status) {
            if (typeof req.query.status === typeof []) {
                members = members.filter(x => req.query.status.every(v => trimMember(x).statuses.includes(v)));
            } else {
                members = members.filter(x => trimMember(x).statuses.includes(req.query.status));
            }
        }
        if (req.query.displayName) {
            members = members.filter(x => x.displayName.toLowerCase().includes(req.query.displayName.toLowerCase()));
        }
        if (req.query.username) {
            members = members.filter(x => x.user.username.toLowerCase().includes(req.query.username.toLowerCase()));
        }
        if (req.query.nickname) {
            members = members.filter(x => x.nickname.toLowerCase().includes(req.query.nickname.toLowerCase()));
        }
        if (req.query.bot !== undefined) {
            members = members.filter(x => (req.query.bot.toLowerCase() == 'true') === x.user.bot);
        }
        if (req.query.level) {
            members = members.filter(x => parseInt(trimMember(x).level) === parseInt(req.query.level));
        }
        if (req.query.underLevel) {
            members = members.filter(x => parseInt(trimMember(x).level) < parseInt(req.query.underLevel));
        }
        if (req.query.aboveLevel) {
            members = members.filter(x => parseInt(trimMember(x).level) > parseInt(req.query.aboveLevel));            
        }
        

        if (!Object.keys(req.query).some(x => params.includes(x)))
            res.send({error: "missing GET parameters", parameters: params})
        else
            res.send(members.map(trimMember));
    });
    app.get('/user/:userid', (req, res) => {
        guild.fetchMembers();
        let member = guild.members.find(x => x.id === req.params.userid);
        res.contentType('json').send(trimMember(member));
    });

    app.get('/bans', (req, res) => {
        // guild.fetchAuditLogs({type: [22, 23]}).then(audits => {
        //     res.contentType('json').send(audits);
        //     console.log(audits);
        // });
        res.send('WHERE WE STOOR');
    });

    app.get('/warns', (req, res) => {
        res.send('HECCING DO');
    });
    
    app.get('/roles', (req, res) => {
        guild.fetchMembers();
        res.contentType('json').send(guild.roles.map(trimRole));
    });
    app.get('/role/:roleid', (req, res) => {
        guild.fetchMembers();
        let role = guild.roles.find(x => x.id === req.params.roleid);
        res.contentType('json').send(trimRole(role));
    });

    app.get('/statuses', (req, res) => {
        guild.fetchMembers();
        res.contentType('json').send(Object.keys(config.statuses));
    });

    app.get('/info', (req, res) => {
        res.send({
            member: trimMember(guild.me),
            guild: trimGuild(guild),
            uptime: process.uptime()
        });
    });

    app.get('/me', (req, res) => {
        if (!req.query.token_type || !req.query.access_token) {
            res.contentType('json').send({error: "missing GET parameters", parameters: ["token_type", "access_token"]});
            return;
        }

        https.request({
            host: "discordapp.com",
            path: "/api/v6/users/@me",
            headers: {
                Authorization: req.query.token_type + " " + req.query.access_token
            }
        }, (response) => {
            let data = "";
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                data = JSON.parse(data);
                
                let member = guild.members.find(x => x.id === data.id);
                res.contentType('json').send(trimMember(member));
            })
        }).end();
    });

    app.post('/feedback', (req, res) => {
        if (!req.body.token || !req.body.type || !req.body.title || !req.body.content) {
            res.status(400);
            res.end(`YOU ARE MISSING THE FOLLOWING 'POST' PARAMETERS:\n` +
                    (req.body.token   ? "" : " - token\n") +
                    (req.body.type    ? "" : " - type\n")  +
                    (req.body.title   ? "" : " - title\n") +
                    (req.body.content ? "" : " - content\n"));
            return;
        }

        guild.fetchMembers();

        https.get({
            hostname: 'discordapp.com',
            path: '/api/v6/users/@me',
            headers: {
                Authorization: req.body.token + " " + req.body.type
            }
        }, (response) => {
            let body = "";

            if (response.statusCode === 401) {
                res.status(401).end('Invalid credentials');
                return;
            }

            response.on('data', (chunk) => {
                body += chunk;
            });
            response.on('end', () => {
                body = JSON.parse(body);
                console.log(body);

                let member = client.guilds.find('id', '306061550693777409').members.find((member) => member.user.tag.toLowerCase() === body.tag.toLowerCase());
                
                if (!member) {
                    res.status(401).end('You must be in the server to submit feedback')
                    return;
                }
        
                res.writeHead(303, {
                    Location: req.headers.referer
                });
                res.end();
        
                
                feedbackchannel.send("", new Mechan.Discord.RichEmbed()
                    .setTitle("TITLE: " + req.body.title)
                    .setDescription(req.body.content)
                    .setColor(13380104)
                    .setTimestamp()
                    .setThumbnail(member.user.avatarURL)
                    .addField('Author', `${member.user.tag}`)
                    .addField('User-Agent', req.headers["user-agent"])
                    .addField('IP', req.connection.remoteAddress.replace('::ffff:', "")));
        
                member.send("The admins of " + client.guilds.find('id', '306061550693777409').name + " have recieved your feedback\nBelow is an example of what they received\n\nIF YOU DID NOT SEND THIS MESSAGE, PLEASE CONTACT THE ADMINS", 
                    new Mechan.Discord.RichEmbed()
                    .setTitle("TITLE: " + req.body.title)
                    .setDescription(req.body.content)
                    .setColor(13380104)
                    .setTimestamp()
                    .setThumbnail(member.user.avatarURL)
                    .addField('Author', `${member.user.tag}`))
            });
        });
    });
    
    app.all('*', (req, res) => {
        res.status(404).contentType('html').send(error(`404, endpoint does not exist or invalid method used`,
                                    `see ${url('/endpoints')} for all endpoints`));
    });

    app.use((err, req, res, next) => {
        console.error(chalk.red(err.stack));
        res.status(500).contentType('html').send(error("500, Internal error", `${err.name}: ${err.message}`));
    })
    
    require('./youtube')(config, app);

    let server = https.createServer({
        key: privateKey,
        cert: certificate
    }, app);
    
    server.listen(8080);
}

function error(error, body) {
    return `<h1>${error}</h1>${body}<br><hr><center>Robbie Botten</center>`;
}
function url(url) {
    return `<a href="${url}">${url}</a>`;
}


function trimRole(role) {
    if (!role)
        return {};

    return {
        id:         role.id, 
        color:      role.color, 
        hexColor:   role.hexColor,
        name:       role.name,
        hoist:      role.hoist
    };
}

function trimMember(member) {
    if (!member)
        return {};

    let userLevel = "0";
    let levelColor = undefined;
    for (level of Object.keys(configuration.levels).reverse()) {
        if (member.roles.array().map(x => x.id).includes(configuration.levels[level])) {
            userLevel = level;
            levelColor = member.roles.find(x => x.id === configuration.levels[level]).hexColor;
            break;
        }
    }
    let userStatus = [];
    let topStatus;
    for (status in configuration.statuses) {
        for (statusrole of configuration.statuses[status]) {
            if (member.roles.array().map(x => x.id).includes(statusrole)) {
                userStatus.push(status);

                if (!topStatus)
                    topStatus = status;

                break;
            }
        }
    }

    return {
        tag:            member.user.tag,
        discriminator:  member.user.discriminator,
        username:       member.user.username,
        nickname:       member.nickname,
        displayName:    member.displayName,
        id:             member.id, 
        presence:       member.presence,
        color:          member.displayColor,
        colorHex:       member.displayHexColor,
        avatar:         member.user.displayAvatarURL,
        roles:          member.roles.array().map(trimRole),
        highestRole:    member.highestRole.id,
        hoistRole:      member.hoistRole ? member.hoistRole.id : undefined,
        joined:         member.joinedAt,
        created:        member.user.createdAt,
        bot:            member.user.bot,
        level:          userLevel,
        levelColor:     levelColor,
        statuses:       userStatus,
        displayStatus:  topStatus
    };
}

function trimGuild(guild) {
    if (!guild) 
        return {}

    return {
        id:             guild.id,
        name:           guild.name,
        icon:           guild.iconURL,
        createdAt:      guild.createdAt,
        //emoji:        guild.emoji,
        membercount:    guild.members.array().length,
        region:         guild.region
    };
}