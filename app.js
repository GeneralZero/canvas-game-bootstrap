var http_port    = 3000
	, https_port = 3001
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
	, _       = require('underscore')
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
  	client.hgetall('scores', function (err, value) {
  		if (err) {
            console.error("error");
        }
        else{
        	var ret = [data];
        	value = eval(value);
        	for (var j in value){
        		ret.push(parseInt(value[j]));
        	}
        	//console.log(ret);
        	ret = ret.sort(function(a,b){return b-a}).slice(0,5);
        	//console.log(ret);
        	socket.emit('Get Scores', ret);
        }
  	});

  	  	if (client.hexists('scores', socket.id)){
  		client.hget('scores', socket.id, function (err, score) {
  			if (score < data)
  				client.hset('scores', socket.id, data);
  		});
  	}

  	console.log(client.hexists('scores', socket.id));
  	console.log(client.hget('scores', socket.id));
  	console.log(data);
  	//console.log(socket.id);
    //console.log(data);
  });

  socket
});