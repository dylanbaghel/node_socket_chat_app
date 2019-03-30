// BUILT-IN & THIRD PARTY MODULES
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const socketIO = require('socket.io');

// CUSTOM MODULE FILES
const { genMessage, genLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const Users = require('./utils/users');

// PUBLIC PATH FOR SERVING PUBLIC FOLDER
const publicPath = path.join(__dirname, '..', 'public');

// MIDDLEWARE TO LOAD PUBLIC FILES
app.use(express.static(publicPath));

// 
const io = socketIO(server)
const users = new Users();

// SOCKET EVENTS
io.on('connection', (socket) => {
    console.log('new user connected');

    socket.on('join', (params, callback) =>  {
        console.log(params)
        if (!isRealString(params.name) || !isRealString(params.roomName)) {
            return callback('Room & name are required');
        }

        socket.join(params.roomName);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.roomName);

        io.to(params.roomName).emit('updateUserList', users.getUserList(params.roomName));
        socket.emit('newMessage', genMessage('Admin', 'Welcome To Chat App'));
        socket.broadcast.to(params.roomName).emit('newMessage', genMessage('Admin', `${params.name} Joined`));

        callback();
    })

    socket.on('createMessage', (data, callback) => {
        const user = users.getUser(socket.id);
        if (user && isRealString(data.text)) {
            io.to(user.roomName).emit('newMessage', genMessage(user.name, data.text));
        }

        callback();
    });

    socket.on('createLocationMessage', (location) => {
        const user = users.getUser(socket.id);
        if (user) {
            io.to(user.roomName).emit('newLocationMessage', genLocationMessage(user.name, location.latitude, location.longitude));
        }

    });

    socket.on('disconnect', function() {
        console.log('disconnected client');
        const user = users.removeUser(socket.id);
        if (user) {
            io.to(user.roomName).emit('updateUserList', users.getUserList(user.roomName));
            io.to(user.roomName).emit('newMessage', genMessage('Admin', `${user.name} has Left.`));
        }
    });
});

// SERVER LISTEN
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log('server is up');
})