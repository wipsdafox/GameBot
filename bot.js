/*
 * GameBot
 *
 * WARNING: This app is in a *very* early alpha stage.
 * It is most likely unstable and should NOT BE USED.
 * Have a nice day.
 */

//dependencies and stuff
const Discord = require('discord.js'); //Discord
const client = new Discord.Client(); //Discord
const fs = require('fs'); //Filesystem
const config = require("./config.json"); //Config
const prefix = config.prefix; //Config
const MongoClient = require('mongodb').MongoClient; //MongoDB
const url = config.dburl; //MongoDB
const async = require('async'); //Needed to prevent certain errors.
var version = "0.1a" //Version message

//Help message
const helpmsg = "ping help";

//Secret generation for really dangerous things
var secret = 0;
function generateSecret()
{
	secret = Math.floor((Math.random() * 1000000000) + 10000000); //Generate a random number.
}

//Database functions that kinda work?
function addUser(userid)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		user = { uid: `${userid}`, hp: 0, xp: 0, lvl: 0, gold: 0, storypos: 0 };
		db.collection("users").insertOne(user, function(err, res) {
			if (err) throw err;
			db.close();
		});
	});
}

function removeUser(userid)
{
	MongoClient.connect(url, function(err, db) {
  if (err) throw err;
	user = { uid: `${userid}`}
  	db.collection("users").deleteOne(user, function(err, obj) {
    	if (err) throw err;
    	console.log("Removed user " + userid);
    	db.close();
  	});
	});
}

function getUserData(userid)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		user = { uid: `${userid}` };
		db.collection("users").find(user).toArray(function(err, result) {
			if (err) throw err;
			if(result[0] == undefined) console.log("User " + userid + " does not exist."); //Make sure user exists before trying to print data.
			else console.log(result[0]);
			return(result);
			db.close();
		});
	});
}

function changeUserHP(uid, nhp)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		q = { $set: { hp: `${nhp}` } };
		user = { uid: `${uid}`};
		db.collection("users").updateOne(user, q, function(err, res) {
			if (err) throw err;
			db.close();
		});
	});
}

function changeUserXP(uid, nxp)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		q = { $set: { xp: `${nxp}` } };
		user = { uid: `${uid}`};
		db.collection("users").updateOne(user, q, function(err, res) {
			if (err) throw err;
			db.close();
		});
	});
}

function changeUserLevel(uid, nlvl)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		q = { $set: { lvl: `${nlvl}` } };
		user = { uid: `${uid}`};
		db.collection("users").updateOne(user, q, function(err, res) {
			if (err) throw err;
			db.close();
		});
	});
}

function changeUserGold(uid, ngold)
{
	MongoClient.connect(url, function(err, db) {
		if (err) throw err;
		q = { $set: { gold: `${ngold}` } };
		user = { uid: `${uid}`};
		db.collection("users").updateOne(user, q, function(err, res) {
			if (err) throw err;
			db.close();
		});
	});
}

//when the bot does a start do morning things
client.on("ready", () => {
	console.log(`GameBot (Version ${version}) started.`);
});

//ooh new message
client.on("message", (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return; //Check if actually a command
	//Get the args
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	var user; //Needed later.

	//Commands
	if(command === "ping")
	{
		message.channel.send("Pong!");
	}

	else if(command === "help")
	{
		message.channel.send(helpmsg);
	}

	//Admin commands
	else if(command === "adduser")
	{
		if(message.author.id != config.ownerid) return;
		console.log(`"Adding user: ${args[0]}`); //add user
		try
		{
			addUser(args[0]);
			message.channel.send(`Added user ${args[0]} to database.`);
			console.log("Successfully added " + args[0]);
		}
		catch(e)
		{
			message.channel.send(`Error adding ${args[0]} to database. Check the log for more info.`);
			console.log(e);
		}
	}

	else if(command === "getdata")
	{
		if(message.author.id != config.ownerid) return;

		if(args[0] == undefined)
		{
			getUserData(message.author.id);
		}
		else
		{
			try
			{
				message.channel.send(`Will show all stored data for ${args[0]} in the logs.`);
				getUserData(args[0]);
			}
			catch (e)
			{
				message.channel.send("Error getting user data. Check the log for more info.");
				console.log("Error getting user data.");
				console.log(e);
			}
		}
	}

	else if(command === "wipeuserdata")
	{
		if(message.author.id != config.ownerid) return;
		if(secret == 0)
		{
			message.channel.send("Are you sure? This will wipe all user data from the database and every user will need to be added manually.");
			message.channel.send("If you are 100% sure, run this command with the secret that was just added to the log.");
			generateSecret();
			console.log(`Secret is ${secret}.`);
		}
		else if(args[0] == secret)
		{
			message.channel.send("Deleting all user data.");
			try
			{
				MongoClient.connect(url, function(err, db) {
	  			if (err) throw err;
	  			db.collection("users").drop(function(err, delOK) {
	    			if (err) throw err;
	    			if (delOK) console.log("All user data removed.");
	    			db.close();
	  			});
				});
				secret = 0; //Reset secret
			}
			catch(e)
			{
				message.channel.send("Error while deleting user data. Check the log for more info.")
				console.log(e);
				secret = 0; //Reset secret
			}
			secret = 0;
		}
		else
		{
			message.channel.send("Invalid secret. Generating a new one.");
			generateSecret();
		}
	}

	else if(command === "removeuser")
	{
		if(message.author.id != config.ownerid) return;
		try
		{
			message.channel.send(`Removing user ${args[0]} from database.`);
			removeUser(args[0]);
			message.channel.send("User removed from database.");
		}
		catch(e)
		{
			message.channel.send("Error while removing user from database. Check the logs for more info.");
			console.log(e);
		}
	}

	else if(command === "hp")
	{
		if(message.author.id != config.ownerid) return;
		if(args[0] == undefined) return;
		if(args[1] == undefined) return;
		changeUserHP(args[0], args[1]);
	}

	else if(command === "xp")
	{
		if(message.author.id != config.ownerid) return;
		if(args[0] == undefined) return;
		if(args[1] == undefined) return;
		changeUserXP(args[0], args[1]);
	}

	else if(command === "lvl")
	{
		if(message.author.id != config.ownerid) return;
		if(args[0] == undefined) return;
		if(args[1] == undefined) return;
		changeUserLevel(args[0], args[1]);
	}

	else if(command === "gold")
	{
		if(message.author.id != config.ownerid) return;
		if(args[0] == undefined) return;
		if(args[1] == undefined) return;
		changeUserGold(args[0], args[1]);
	}

});

//Run when someone joins
client.on("guildMemberAdd", (member) => {
  console.log(`New user "${member.user.username}" has joined "${member.guild.name}"` );
  member.guild.channels.get("welcome").send(`Welcome, ${member.user.username}!`);
});

//Error printing and stuff
client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
if(config.debug == 1) client.on("debug", (e) => console.info(e));

client.login(config.token);
