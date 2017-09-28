/**
 * This example demonstrates setting up a webook, and receiving
 * updates in your express app
 */
/* eslint-disable no-console */

const TOKEN = process.env.TELEGRAM_TOKEN;
const port = process.env.PORT || 3000;
const url = 'https://pruebanodetelegrambot.herokuapp.com';

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const $ = require('jquery');

// No need to pass any parameters as we will handle the updates with Express
const bot = new TelegramBot(TOKEN);

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot${TOKEN}`);

const app = express();

// parse the updates to JSON
app.use(bodyParser.json());

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start Express Server
app.listen(port, () => {
  console.log(`Express server is listening on ${port}`);
});

// Just to ping!
bot.on('message', msg => {
  switch(msg.text) {
	  case "/saludar":
		bot.sendMessage(msg.chat.id, "¡Hola " + msg.chat.first_name + " " + msg.chat.last_name + "!");
	  break;
	  case "/consumos":
		request(process.env.SM_CONS_URL, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var consumos = JSON.parse(body);
				bot.sendMessage(msg.chat.id, "Usted tiene " + consumos.length + " consumos en el mes de septiembre.");
			}
		})
	  break;
	  default:
		bot.sendMessage(msg.chat.id, "No reconocimos tu comando.");
		bot.sendMessage(msg.chat.id, msg);
  }
});