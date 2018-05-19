var socket = io.connect('http://ec2-18-218-46-245.us-east-2.compute.amazonaws.com:7777');
//Local
//192.168.1.3:7777

//AWS server instance
//ec2-18-218-46-245.us-east-2.compute.amazonaws.com

//send message to server console to monitor user logins
socket.emit('connected', {
  socket_id: socket.id,
  username: document.getElementById('username').value
});

var chat_area = document.getElementById("chat-area");
var chat_container = document.getElementById("chat-container");
var message_out = document.getElementById("message_input").value;
var message_input = document.getElementById("message_input");
var btn = document.getElementById('send_btn');
var chat_indicator = document.getElementById('chat-indicator');
var side_content = document.getElementById('side-content');

//auto scroll newest messages into view
function chat_auto_scroll(element_to_scroll) {
  element_to_scroll.scrollIntoView(false);

};

//Send message
function sendMessage() {
  socket.emit('chat', {
    username: document.getElementById("username").value,
    message: document.getElementById("message_input").value,
    unique_chat_color: document.getElementById("unq_color").value,
  });

  document.getElementById("message_input").value = "";
};

//Send message on Enter
message_input.addEventListener('keydown', key => {

  if (key.keyCode === 13) {
    sendMessage();
  }
});

btn.addEventListener('click', function () {
  sendMessage();
});

socket.on('connected', user => {
  //query users list to populate side_content pane with all active users
  for (var active_user in user.users) {
    var user_name = user.users[active_user];
    var active_user_tag;

    try {
      active_user_tag = document.getElementById(user_name);

      if (!side_content.contains(document.getElementById(active_user_tag.id))) {
        side_content.appendChild(active_user_tag);
      };

    } catch {
      //doenst exist yet? then create it!
      var status_tag = document.createElement("div");
      status_tag.classList.add("user_activity");
      status_tag.classList.add("users_div");
      status_tag.id = user_name;

      var img_tag = document.createElement("img");
      img_tag.id = user_name + "_typing_indicator";
      console.log('trying to get to: ' + img_tag.id);

      img_tag.classList.add("activity_bubble");

      var name_tag = document.createElement("p");
      name_tag.classList.add("user_activity");
      name_tag.innerHTML = user_name;

      status_tag.appendChild(img_tag);
      status_tag.appendChild(name_tag);

      side_content.appendChild(status_tag);
    }

  }

  var p_tag = document.createElement("p");
  p_tag.classList.add("chat_message_p");
  p_tag.classList.add("connected_notification");
  p_tag.innerHTML += user.username + " has joined the chat!";
  chat_area.appendChild(p_tag);

  chat_auto_scroll(chat_area);

});

socket.on('disconnecting', user => {
  console.log(user + 'is leaving');
  socket.emit('disconnecting', username);
});

socket.on('disconnected', user => {

  var disc_user = user;

  var p_tag = document.createElement("p");
  p_tag.classList.add("chat_message_p");
  p_tag.classList.add("disconnect_notification");
  p_tag.innerHTML = (disc_user + " has left the chat..");
  chat_area.appendChild(p_tag);

  var status_tag = document.getElementById(disc_user);
  console.log("Deleting: " + disc_user);

  try {
    status_tag.remove();
  } catch {
    console.log('Element not found');
  }

  chat_auto_scroll(chat_area);
});

socket.on('chat', data => {
  //add typing animation to user activity bubble
  for (var typing_user in users_typing) {
    var typing_indicator = document.getElementById(users_typing[typing_user] + '_typing_indicator');

    typing_indicator.classList.remove("typing");

  }

  users_typing = [];

  var chat_color = data.unique_chat_color;

  var p_tag = document.createElement("p");
  p_tag.style.backgroundColor = chat_color;
  p_tag.classList.add("chat_message_p");
  p_tag.innerHTML += data.username + ': ' + data.message;
  chat_area.appendChild(p_tag);

  chat_indicator.innerHTML = '';

  //auto scroll chat
  chat_auto_scroll(chat_area);

});

message_input.addEventListener('keypress', (key) => {

  if (key.keyCode !== 13) {
    socket.emit('typing', {
      username: username.value
    })
  }
});

var users_typing = [];

socket.on('typing', users => {
  if (users.includes(username.value)) {
    var indexOfVal = users.indexOf(username.value);
    users.splice(indexOfVal, 1);
  }

  users_typing = users;

  var typing_msg;

  if (users_typing.length === 1) {
    typing_msg = users_typing[0] + ' is typing..';
  } else if (users_typing.length === 2) {
    typing_msg = users_typing[0] + ' and ' + users_typing[1] + ' are typing..';
  } else if (users_typing.length > 2) {
    typing_msg = 'multiple users typing..';
  }

  chat_indicator.innerHTML = typing_msg;

  //add typing animation to user activity bubble
  for (var typing_user in users_typing) {
    var typing_indicator = document.getElementById(users_typing[typing_user] + '_typing_indicator');

    console.log(typing_user);
    console.log(typing_indicator);

    typing_indicator.classList.add("typing");
  }
});