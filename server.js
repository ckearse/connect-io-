const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const socket = require('socket.io');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/static'));
app.use(bodyparser.urlencoded({extended: true}));

app.post('/chat', (req, res) => {
  res.render('chat', {'username': req.body.username});
});

const server = app.listen(7777, function() {
  console.log('Express app running on port 7777');
});

var io = socket(server);

io.on('connection', socket => {
  console.log('socket connection established!');

  socket.on('chat', data => {
    io.emit('chat', {
      username: data.username,
      message: data.message
    });

    console.log("message: " + data.message);

  })

})


