var http_port    = 3333
	, https_port = 3332
	, fs         = require('fs')
	, options    = {
		key: fs.readFileSync('./ssl/node.key'),
		cert: fs.readFileSync('./ssl/node.crt')
	};

var express   = require('express')
	, app     = express()
	, apps    = express()
	, http    = require('http').createServer(app)
	, https   = require('https').createServer(options, apps)
	, redis   = require('redis')
	, io      = require('socket.io').listen(https);
/*
Finished Declaring varables
*/

io.configure( function() {
	io.set('close timeout', 60*60*24); // 24h time out
});
// Set Timeout

app.get('*', function (req,res) {
	res.redirect('https://127.0.0.1:'+ https_port +req.url)
})

//Fowards over HTTPS

http.listen(http_port);
https.listen(https_port);

//If not matched by routes defaults to static folder

apps.use(express.static(__dirname + '/static'));

//If not matched by routes defaults to static folder

apps.get('/', function (req, res) {
  res.sendfile(__dirname + '/static/index.html');
});

/*
Redis Client
*/

var client = redis.createClient();
 
client.on('error', function (err) {
    console.log('Error ' + err);
});

/*
Socket IO 
*/

io.sockets.on('connection', function (socket) {
  socket.on('Game Over', function (data) {
  	if (client.hexists('scores', socket.id) && client.hget('scores', socket.id) < data){
  		client.hset('scores', socket.id, data);
  	}


    client.hmset('scores', socket.id, data);
    //console.log(socket.id);
    //console.log(data);
  });
});