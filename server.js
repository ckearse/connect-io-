const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const socket = require('socket.io');
const randomColor = require('randomcolor');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/static'));
app.use(bodyparser.urlencoded({extended: true}));

app.post('/chat', (req, res) => {
  var chat_color  = randomColor();

  //add slight opacity via alpha channel ~20%
  chat_color += "33";

  res.render('chat', {
    'username': req.body.username,
    'unq_color': chat_color  
  });
});

const server = app.listen(7777, function() {
  console.log('Express app running on port 7777');
});

var io = socket(server);
var users = {};
var users_typing = [];

io.on('connection', socket => {
  console.log('socket connection established!');

  socket.on('connected', user => {

    users[socket.id] = user.username;
    io.emit('connected', user);
    console.log(user.username + ' has connected')
  }),

  socket.on('disconnecting', function(){

    //emit message that user has left chat by referencing users[socket.id]
    if(users[socket.id] !== null){
      io.emit('disconnected', users[socket.id]);
      console.log(users[socket.id] + ' has disconnected')
    } 
  });

  socket.on('typing', user => {
    if(!users_typing.includes(user.username)){
      users_typing.push(user.username);
    }

    socket.broadcast.emit('typing', users_typing);
    console.log(user.username + ' is typing');
    console.log(users_typing);
  });

  socket.on('chat', data => {
    users_typing = [];
    io.emit('chat', data);
  });

})


