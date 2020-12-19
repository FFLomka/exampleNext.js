const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')
const sqlite3 = require('sqlite3')

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()
let port = 3000

var db = new sqlite3.Database('./database.db', (err) => {
	if (err) {
		console.log(err.message);
	}
	console.log('connected to db');
});

db.serialize(() => {
	db.run("CREATE TABLE IF NOT EXISTS query (info TEXT)");
});

io.sockets.on('connect', function (socket) {
	console.log('client connected', socket.id)
	socket.send('DRAWQQ!')

	socket.on('disconnect', function() {
		console.log('client disconnected')
	})

	socket.on('query', function(data) {
		console.log('client requery => ' + data)
		db.run("INSERT INTO query (info) VALUES ('" + data + "')");
		fetch(process.env.DADATA_URL, {
			method: "POST",
			mode: "cors",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Token " + process.env.TOKEN,
				"X-Secret": process.env.SECRET
			},
			body: JSON.stringify([data])
		})
		.then(response => response.text())
		.then(result => {
			console.log(result)
			socket.emit("result", {"data": result})
		})
		.catch(error => {
			console.log("error", error)
			socket.emit("err", {"data": error})
		});
	})
})

nextApp.prepare().then(() => {

	app.get('/api/random', (req, res) => {
		db.all("SELECT * FROM query", function(err, row) {
			res.send(row[Math.floor(Math.random() * row.length)].info)
			res.end()
		});
	})

	app.get('*', (req, res) => {
		return nextHandler(req, res)
	})

	server.listen(port, (err) => {
		if (err) throw err
		console.log(`> Ready on http://localhost:${port}`);
	})
})