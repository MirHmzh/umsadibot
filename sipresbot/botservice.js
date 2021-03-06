const { Telegraf } = require('telegraf')
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,
  database : process.env.DB_NAME
});

console.log(new Date()+' | Bot started');
const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start((ctx) => ctx.reply('Anda kesini mau dapet notif SIPRESMAWA ya? Kalo iya langsung /subscribe. Kalo mau unsubscribe langsung /unsubscribe. Scrapper jalan setiap 5 menit sekali, notifikasi meliputi perubahan nama event, jumlah event, kuota event, tarif event & gambar event'))
bot.command('subscribe', (ctx) => {
	console.log(new Date()+" | "+ctx.chat.id+` | ${ctx.from.first_name} ${ctx.from.last_name} | ${ctx.from.username}`+' joined ');
	let subscriber = {subscriber : ctx.chat.id}
	let check = connection.query('SELECT subscriber FROM subscriber WHERE ?', subscriber, function (error, results, fields) {
	  if (error) console.log(new Date()+" | "+error);
	  if (results.length > 0) {
	  	ctx.reply('Anda sudah saskreb ya..')
	  }else{
	  	ctx.reply('Oke siap. Notif akan diberi tiap ada event baru di roomchat ini. Cheers🍻')
	  	subscriber = {subscriber : ctx.chat.id, join_date: new Date()}
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
	ctx.reply('Gausah ngechat.. aku bot duduk gebetanmu')
})
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))