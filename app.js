/**
 * This example demonstrates setting up a webook, and receiving
 * updates in your express app
 */
/* eslint-disable no-console */

const TOKEN = process.env.TELEGRAM_TOKEN;
const port = process.env.PORT || 3000;
const url = 'https://rodrilapentatelegrambot.herokuapp.com';

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN);

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${TOKEN}`);

const app = express();

// parse the updates to JSON
app.use(bodyParser.json());

// We are receiving updates at the route below!


var MongoClient = require('mongodb').MongoClient;
var mongoUrl = "mongodb://" + process.env.MONGO_URL;

MongoClient.connect(mongoUrl, function(err, db) {
	if (err) throw err;
	db.createCollection("bot_users", function(err, res) {
		if (err) throw err;
		console.log("'bot_users' collection created!");
		db.close();
	});
});

MongoClient.connect(mongoUrl, function(err, db) {
	if (err) throw err;
	db.createCollection("users_voice_messages", function(err, res) {
		if (err) throw err;
		console.log("'users_voice_messages' collection created!");
		db.close();
	});
});

MongoClient.connect(mongoUrl, function(err, db) {
	if (err) throw err;
	db.createCollection("users_contacts", function(err, res) {
		if (err) throw err;
		console.log("'users_contacts' collection created!");
		db.close();
	});
});

MongoClient.connect(mongoUrl, function(err, db) {
	if (err) throw err;
	db.createCollection("users_images", function(err, res) {
		if (err) throw err;
		console.log("'users_images' collection created!");
		db.close();
	});
});

app.post(`/bot${TOKEN}`, (req, res) => {
	bot.processUpdate(req.body);
	res.sendStatus(200);
});

app.post(`/notifyAll`, (req, res) => {
	MongoClient.connect(mongoUrl, function(err, db) {
		if (err) throw err;
		var cursor = db.collection('bot_users').find();
		cursor.each(function(err, item) {
			if(item == null) {
				db.close(); // you may not want to close the DB if you have more code....
				return;
			}
			bot.sendMessage(msg.chat.id, "No podemos ver tus videos, disculpas.");
		});
	});
});

// Start Express Server
app.listen(port, () => {
	console.log(`Express server levantado en el puerto ${port}`);
});

bot.on('callback_query', function onCallbackQuery(callbackQuery) {
	const action = callbackQuery.data;
	const msg = callbackQuery.message;
	const opts = {
		chat_id: msg.chat.id,
		message_id: msg.message_id,
	};
	let text;

	if (action === '1') {
		text = 'You hit button 1';
	}

	bot.editMessageText(text, opts);
});

// Just to ping!
bot.on('message', msg => {
	console.log("message", msg);
	console.log("message JSON", JSON.stringify(msg));
	bot.sendMessage(msg.chat.id, JSON.stringify(msg));

	if(msg.voice) {
		handleVoiceMessage(msg);
	}
	else if (msg.text) {
		handleTextMessage(msg);
	}
	else if (msg.document) {
		handleDocumentMessage(msg);
	}
	else if (msg.game) {
		handleGameMessage(msg);
	}
	else if (msg.video) {
		handleVideoMessage(msg);
	}
	else if (msg.video_note) {
		handleVideoNoteMessage(msg);
	}
	else if (msg.contact) {
		handleContactMessage(msg);
	}
	else if (msg.location) {
		handleLocationMessage(msg);
	}
});

function handleVoiceMessage(msg) {
	//bot.sendMessage(msg.chat.id, "No podemos escuchar tus audios, disculpas.");
	MongoClient.connect(mongoUrl, function(err, db) {
		if (err) throw err;
		db.collection("users_voice_messages").insertOne({user:msg.from.id, voice_id: msg.voice.file_id}, function(err, res) {
			if (err) throw err;
			console.log("1 voice message inserted");
			db.close();
		});
		bot.sendMessage(msg.chat.id, "Audio almacenado!");
	});
}

function handleDocumentMessage(msg) {
	bot.sendMessage(msg.chat.id, "No podemos hacer nada con tus documentos, disculpas.");
}

function handleGameMessage(msg) {
	bot.sendMessage(msg.chat.id, "No podemos jugar ahora, disculpas.");
}

function handleVideoMessage(msg) {
	bot.sendMessage(msg.chat.id, "No podemos ver tus videos, disculpas.");
}

function handleVideoNoteMessage(msg) {
	bot.sendMessage(msg.chat.id, "No podemos ver tus videos, disculpas.");
}

function handleContactMessage(msg) {
	//bot.sendMessage(msg.chat.id, "No podemos hacer nada con tus contactos, disculpas.");
	MongoClient.connect(mongoUrl, function(err, db) {
		if (err) throw err;
		db.collection('users_contacts').findOne({user: msg.from.id, contact: msg.contact}, function(err, contact) {
			if(!contact) {
				db.collection("users_contacts").insertOne({user:msg.from.id, contact: msg.contact}, function(err, res) {
					if (err) throw err;
					console.log("1 contact inserted");
					db.close();
				});
				bot.sendMessage(msg.chat.id, "Contacto almacenado!");
			}
			else {
				bot.sendMessage(msg.chat.id, "Ya existe el contacto que quieres almacenar");
			}
		});
	});
}

function handleLocationMessage(msg) {
	bot.sendMessage(msg.chat.id, "No podemos hacer nada con tu ubicación, disculpas.");
}

function handleTextMessage(msg) {
  switch(msg.text) {
		case "/start":
			MongoClient.connect(mongoUrl, function(err, db) {
				if (err) throw err;
				var user = {
					info: msg.from,
					chat_id: msg.chat.id
				}
				db.collection("bot_users").update(
					{keyword: user},
					{$inc: {visit_count: 1}},
					{upsert: true, safe: false},
					function(err, res) {
						if (err) throw err;
						if(JSON.parse(res).nModified == 1) bot.sendMessage(msg.chat.id, "¡Bienvenido de nuevo, " + msg.chat.first_name + " " + msg.chat.last_name + "!");
						else bot.sendMessage(msg.chat.id, "¡Bienvenido a mi bot, " + msg.chat.first_name + " " + msg.chat.last_name + "!");
						db.close();
					}
				);
			});
		break;
		case "/saludar":
			bot.sendMessage(msg.chat.id, "¡Hola " + msg.chat.first_name + " " + msg.chat.last_name + "!");
		break;
		case "/debug":
			bot.sendMessage(msg.chat.id, JSON.stringify(msg));
		break;
		case "/consumos":
			request(process.env.SM_CONS_URL, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					var consumos = JSON.parse(body);
					bot.sendMessage(msg.chat.id, "Usted tiene " + consumos.length + " consumos en el mes de septiembre.");
				}
			})
		break;
		case "/audios":
			MongoClient.connect(mongoUrl, function(err, db) {
				if (err) throw err;
				var cursor = db.collection('users_voice_messages').find({user: msg.from.id});
				cursor.each(function(err, item) {
					if(item == null) {
						db.close(); // you may not want to close the DB if you have more code....
						return;
					}
					bot.sendVoice(msg.chat.id, item.voice_id);
				});
			});
		break;
		case "/contactos":
			MongoClient.connect(mongoUrl, function(err, db) {
				if (err) throw err;
				var cursor = db.collection('users_contacts').find({user: msg.from.id});
				cursor.each(function(err, item) {
					if(item == null) {
						db.close(); // you may not want to close the DB if you have more code....
						return;
					}
					bot.sendContact(msg.chat.id, item.contact.phone_number, item.contact.first_name, item.contact.last_name);
				});
			});
		break;
		case "/pregunta":
			const opts = {
				reply_to_message_id: msg.message_id,
				reply_markup: JSON.stringify({
				  inline_keyboard: [
						[{ text: 'Some button text 1', callback_data: '1' }],
          	[{ text: 'Some button text 2', callback_data: '2' }],
          	[{ text: 'Some button text 3', callback_data: '3' }]
					],
					one_time_keyboard: true
				})
			  };
			bot.sendMessage(msg.chat.id, '¿Sos boludo?', opts);
		break;
		default:
			bot.sendMessage(msg.chat.id, "No reconocimos tu comando.");
		break;
	}
}
