/*
 *  Made by Ethan Lee (@ethanlee16) and Kushal Tirumala (@kushaltirumala)
 *  Licensed under the MIT License.
 */

/* Change this to your Slack bot's OAuth token,
* found in the Integrations tab */
var SLACK_TOKEN = require('./config').slackToken;
var https = require('https');
var  _ws = require('ws');
var r = require('./quiet');
var pewSaved = false;
var counter = 1;
var ws, slackID;
/*
https.get("https://slack.com/api/channels.create?token=" 
+ SLACK_TOKEN + "&name=trump", function(res) {
    var data = "";
    res.on('data', function(chunk) {
        data += chunk;
    }).on('error', function(err) {
        console.log("Failed to create #trump channel. Verify "
            + "that you added your API key.");
    }).on('end', function() {
        console.log(data);
    });
});
*/


https.get("https://slack.com/api/rtm.start?token=" + SLACK_TOKEN, function(res) {
    console.log("Connecting to Slack API...");
    var data = "";
    res.on('data', function(chunk) {
	data += chunk;
    }).on('error', function(err) {
    console.log("Failed to connect to Slack. "
        + "Did you put in your Slack bot's token in app.js?");
    }).on('end', function() {
        var rtm = JSON.parse(data);
	ws = new _ws(rtm.url);
        slackId = rtm.self.id;
        console.log("Logging into " + rtm.team.name + "'s Slack...");
        ws.on('open', function() {
            	var pleasure_pavillion = rtm.groups.filter(function(gp){
			return gp.name === 'pleasure-pavilion';
		})
		var group = pleasure_pavillion[0].id;
		goTrump(rtm.team.name, group);
		setInterval(function(){ chron(group)}, 900000);
        });
    })
});

function chron(group){
	var hour = (new Date().getHours()+8)%24;
	console.log(hour);
	counter++;
	if (hour>=9 || hour <=2) {
		https.get('https://pew-back.herokuapp.com/');
		if (hour!=2) {
			pewSaved = false;
		}
		if (hour===2 && !pewSaved){	
   			ws.send(JSON.stringify({
        			"id": counter,
        			"type": "message",
        			"channel": group,
        			"text": "@qinenbitch: save yourself"
   	 		}));
		}
	}
}


function goTrump(teamName, channelID) {
    console.log("Lianbot has joined " + teamName + "!");
    ws.send(JSON.stringify({
        "id": counter,
        "type": "message",
        "channel": channelID,
	"text": "Hullo ma boys, kurvy Kat is in da house. Meow! :-os: :looi: :seah: Glints wishes you Happy Chinese New Year! :2::0::1::6:"
    }));
    counter++;

    console.log("Listening for new messages...");
    ws.on('message', function(data) {
        var event = JSON.parse(data);
        if(event.type === "message" && event.user !== slackID) {
            ws.send(JSON.stringify({
                "id": counter,
                "type": "message",
                "channel": channelID,
                "text": getResponse(event.text)
            }))
        }
        counter++;
    });
}

function getResponse(message) {
    console.log(message);
    if (message.match(/<@U0D53C04X>|wake/)){
	https.get('https://pew-back.herokuapp.com/');
    }
    if (message.match(/Thanks, My mind is safe now!/)){
	pewSaved = true;
	return 'Good to know';
    }
    for(var i = 0; i < r.length; i++) {
        for(var j = 0; j < r[i].keywords.length; j++) {
            if(message.toLowerCase().indexOf(r[i].keywords[j]) != -1) {
                console.log("Responding to message: " + message);
                return r[i].messages[Math.floor(Math.random() * r[i].messages.length)];
            }
        }
    }
}

