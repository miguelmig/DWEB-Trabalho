/* 
 *
 */


var Messages = require('../controllers/chat_message')
var socket_io = require('socket.io');
var io       = socket_io();
var socketio = {};
socketio.io  = io;
var users = [];
io.on('connection', function(socket){
    
    console.log('A user connected');
    console.log(`Socket connected ${socket.id}`)

    Messages.getpreviousMsgs()
        .then(dados =>socket.emit('previousMessage', dados))
        .catch(erro =>res.status(500).jsonp(erro)) 
        
        socket.on('sendMessage', data => {
            console.log(data);
            Messages.create(data)
                .then(dados =>console.log("Saved"))
                .catch(erro =>res.status(500).jsonp(erro))
        });

    socket.on('join', function (user) {
       socket.username = user.username;
       users.push(socket.username);
       io.emit('user joined', { 'username': user.username, users:users });
    });

    
    socket.on('typing', function (msg) {
        io.emit('typing', { 'message': msg.message, 'username': msg.username });
    });

    socket.on('new_message', function (msg) {
    	if (msg.username.length && msg.message.length){
                        var messageObject = {
                            author:msg.username,
                            message: msg.message,
                        };
               Messages.create(messageObject)
                .then(dados =>console.log("Saved"))
                .catch(erro =>res.status(500).jsonp(erro))
                ;}
         io.emit('chat message', { 'message': msg.message, 'username': msg.username });
         
    });
    
    socket.on('disconnect', function(){
        console.log('user disconnected');
        users.splice(users.indexOf(socket.username), 1);
        io.emit('user disconnected', { 'username': socket.username });
    });
     
});
 
module.exports = socketio;