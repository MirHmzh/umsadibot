const { Telegraf } = require('telegraf')
// const extra = require('telegraf/extra')
// const markup = extra.markdown()

const util = require('util')
const bot = new Telegraf(process.env.BOT_TOKEN)
let mysql      = require('mysql');
let connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});
let owner_id = process.env.OWNER_ID;

function log(obj) {
	console.log(util.inspect(obj, {showHidden: false, depth: null}))
}

console.log(new Date()+' | Bot started');

bot.start((ctx) => ctx.reply('Anda kesini mau dapet notif SIPRESMAWA ya? Kalo iya langsung /subscribe. Kalo mau unsubscribe langsung /unsubscribe. Scrapper jalan setiap 5 menit sekali, notifikasi meliputi perubahan nama event, jumlah event, kuota event, tarif event & gambar event'))

bot.command('subscribe', (ctx) => {
	console.log(new Date()+" | "+ctx.chat.id+` | ${ctx.from.first_name} ${ctx.from.last_name} | ${ctx.from.username}`+' joined ');
	let subscriber = {subscriber : ctx.chat.id}
	let check = connection.query('SELECT subscriber FROM subscriber WHERE ?', subscriber, function (error, results, fields) {
	  if (error) console.log(new Date()+" | "+error);
	  if (results.length > 0) {
	  	subscriber = {
	  		subscriber : ctx.chat.id,
	  		join_date: new Date(),
	  		first_name : "first_name" in ctx.from ? ctx.from.first_name : null,
	  		last_name : "last_name" in ctx.from ? ctx.from.last_name : null,
	  		username : "username" in ctx.from ? ctx.from.username : null
	  	}
	  	let query = connection.query('UPDATE subscriber SET first_name = ?, last_name = ?, username = ? WHERE subscriber = ?', [subscriber.first_name, subscriber.last_name, subscriber.username, subscriber.subscriber], function (error, results, fields) {
		  if (error) console.log(new Date()+" | "+error);
		  // Neat!
		  ctx.reply('Anda sudah saskreb & data telah diupdate')
		});
	  }else{
	  	ctx.reply('Oke siap. Notif akan diberi tiap ada event baru di roomchat ini. Cheers🍻')
	  	subscriber = {
	  		subscriber : ctx.chat.id,
	  		join_date: new Date(),
	  		first_name : "first_name" in ctx.from ? ctx.from.first_name : null,
	  		last_name : "last_name" in ctx.from ? ctx.from.last_name : null,
	  		username : "username" in ctx.from ? ctx.from.username : null
	  	}
	  	let query = connection.query('INSERT INTO subscriber SET ?', subscriber, function (error, results, fields) {
		  if (error) console.log(new Date()+" | "+error);
		  // Neat!
		});
	  }
	});
});

bot.command('unsubscribe', (ctx) => {
	ctx.reply('Oke siap. Selamat tinggal. Cheers🍻')
	console.log(new Date()+" | "+ctx.chat.id+` |${ctx.from.first_name} ${ctx.from.last_name} | ${ctx.from.username}`+' unsubed '+new Date());
	let subscriber = {subscriber : ctx.chat.id}
	var query = connection.query('DELETE FROM subscriber WHERE ?', subscriber, function (error, results, fields) {
	  if (error) throw error;
	  // Neat!
	});
});

bot.on('text', (ctx) => {
	// Handle owner to reply user input
	if (ctx.update.message.from.id == owner_id) {
		if ("reply_to_message" in ctx.update.message) {
			let message = `${ctx.update.message.text}`,
				replied_message = ctx.update.message.reply_to_message.text,
				parser_replied = replied_message.split("\n"),
				parsed_replied = parser_replied[0].split(","),
				replied_usr_id = parsed_replied[2],
				replied_msg_id = parsed_replied[3];
			bot.telegram.sendMessage(
				replied_usr_id,
				message, {
					reply_to_message_id : replied_msg_id
				}
			);
		}

		if (ctx.update.message.text.includes("!broadcast")) {
			let raw_msg = ctx.update.message.text.split("\n"),
				shift_command = raw_msg.shift(),
				mat_msg = raw_msg.join("\n");
			connection.query("SELECT subscriber, first_name, last_name FROM subscriber", (e, res, f) => {
				if (e) console.log(new Date()+" | "+e);
				res.forEach(function(idx) {
					let chatid = idx.subscriber,
						first_name = idx.first_name,
						last_name = idx.last_name,
						msg = mat_msg.replace("!name", first_name+' '+last_name);
					bot.telegram.sendMessage(chatid, msg);
				});
			});
		}
		if (ctx.update.message.text.includes("!chatid")) {
			let raw_pay = ctx.update.message.text.split("\n");
			let raw_chatid = raw_pay[0].split(" ");
			let chat_id = raw_chatid[1];
			raw_pay.shift();
			let mat_msg = raw_pay.join("\n");
			connection.query(`SELECT subscriber, first_name, last_name FROM subscriber WHERE subscriber = '${chat_id}'`, (e, res, f) => {
				if (e) console.log(new Date()+" | "+e);
				res.forEach(function(idx) {
					let first_name = idx.first_name,
						last_name = idx.last_name,
						msg = mat_msg.replace("!name", first_name+' '+last_name);
					bot.telegram.sendMessage(chat_id, msg);
				});
			});
		}

		if (ctx.update.message.text.includes("!name")) {
			let raw_pay = ctx.update.message.text.split("\n");
			let raw_name = raw_pay[0].split(" ");
			let chat_name = raw_name[1];
			raw_pay.shift();
			let mat_msg = raw_pay.join("\n");
			connection.query(`SELECT subscriber, first_name, last_name FROM subscriber WHERE first_name LIKE '%${chat_name}%' OR last_name LIKE '%${chat_name}%' `, (e, res, f) => {
				if (e) console.log(new Date()+" | "+e);
				res.forEach(function(idx) {
					let first_name = idx.first_name,
						last_name = idx.last_name,
						msg = mat_msg.replace("!name", first_name+' '+last_name);
					bot.telegram.sendMessage(idx.subscriber, msg);
				});
			});
		}

		if (ctx.update.message.text.includes("!users")) {
			connection.query(`SELECT subscriber, first_name, last_name FROM subscriber`, (e, res, f) => {
				if (e) console.log(new Date()+" | "+e);
				let msg = ``;
				res.forEach(function(idx) {
					let first_name = idx.first_name,
						last_name = idx.last_name,
						chatid = idx.subscriber;
					msg += `${first_name} ${last_name} - ${chatid}`;
				});
				bot.telegram.sendMessage(owner_id, msg);
			});
		}

		if (ctx.update.message.text.includes("!find")) {
			let raw_com = ctx.update.message.text.split(" "),
				name = raw_com[1];
			connection.query(`SELECT subscriber, first_name, last_name FROM subscriber WHERE first_name LIKE '%${name}%' OR last_name LIKE '%${name}%'`, (e, res, f) => {
				if (e) console.log(new Date()+" | "+e);
				let msg = ``;
				if (res.length == 0) {
					msg += 'No data found';
				}else{
					res.forEach(function(idx) {
						let first_name = idx.first_name,
							last_name = idx.last_name,
							chatid = idx.subscriber;
						msg += `${first_name} ${last_name} - ${chatid}`;
					});
				}
				bot.telegram.sendMessage(owner_id, msg);
			});
		}

		if (ctx.update.message.text == "!command") {
			let msg = `
				<b>Broadcast message</b>\n!broadcast\n[TEXT MESSAGE]\nParameter : !name - to add users name\n\n<b>Sent message to specific users</b>\n!chatid [CHATID]\n[TEXT MESSAGE]\nSent message to sepcific user by its ChatID\n!chatid [NAME]\n[TEXT MESSAGE]\nSent message to specific user by its name a like. Use !find first to get list users name\nParameter : !name - to add users name\n\n<b>Find users</b>\n!find [NAME]\nFind users by its name\n\n<b>Get all users</b>\n!users\nGet all registered users\n
			`;
			bot.telegram.sendMessage(owner_id, msg, {parse_mode : 'HTML'});
		}
	}

	// Handle user input
	if (ctx.update.message.from.id != owner_id) {
		let message = `
			Meta Message : ${"first_name" in ctx.update.message.from ? ctx.update.message.from.first_name : 'First Name not available'} ${"last_name" in ctx.update.message.from ? ctx.update.message.from.last_name : 'Last Name not available'},${"username" in ctx.update.message.from ? ctx.update.message.from.username : "Username not available"},${ctx.update.message.from.id},${ctx.update.message.message_id}\nText : <br>${ctx.update.message.text}</b>
		`;
		bot.telegram.sendMessage(owner_id, message, { parse_mode: 'HTML' });
	}
})
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))