// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
//var sub = require('redis').createClient(6379,'limeychat.redis.cache.windows.net', {auth_pass: 'nmwWVd0T08awiPTqPi+Ngft3sefHQeUmLaQQD5eNfJo=', return_buffers: true});
//var pub = require('redis').createClient(6379,'limeychat.redis.cache.windows.net', {auth_pass: 'nmwWVd0T08awiPTqPi+Ngft3sefHQeUmLaQQD5eNfJo=', return_buffers: true});

//var redis = require('socket.io-redis');
//io.adapter(redis({pubClient: pub, subClient: sub}));



var port = process.env.PORT || 3000;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;
var special = {
    penis: ["%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6._%C2%B8%E2%80%9E%E2%80%9E%E2%80%9E%E2%80%9E_", "%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6.%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6...%E2%80%9E--%7E*%5C'%C2%AF%E2%80%A6%E2%80%A6.%5C'%5C", "%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6.%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6 (%E2%80%9E-%7E%7E--%E2%80%9E%C2%B8_%E2%80%A6.,/%C3%AC%5C'%C3%8C", "%E2%80%A6%E2%80%A6.%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6.%C2%B8%E2%80%9E-%5E%22%C2%AF%20:%20:%20:%20:%20:%C2%B8-%C2%AF%22%C2%AF/%5C'", "%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%C2%B8%E2%80%9E%E2%80%9E-%5E%22%C2%AF%20:%20:%20:%20:%20:%20:%20:%20%5C'%5C%C2%B8%E2%80%9E%E2%80%9E,-%22", "**%C2%AF%C2%AF%C2%AF%5C'%5E%5E%7E-%E2%80%9E%E2%80%9E%E2%80%9E----%7E%5E*%5C'%22%C2%AF%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%C2%B8-%22", ".:.:.:.:.%E2%80%9E-%5E%22%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%E2%80%9E-%22", ":.:.:.:.:.:.:.:.:.:.:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20%C2%B8%E2%80%9E-%5E%C2%AF", ".::.:.:.:.:.:.:.:.%20:%20:%20:%20:%20:%20:%20:%20%C2%B8%E2%80%9E%E2%80%9E-%5E%C2%AF", ":.%5C'%20:%20:%20%5C'%5C%20:%20:%20:%20:%20:%20:%20:%20;%C2%B8%E2%80%9E%E2%80%9E-%7E%22", ":.:.::%20:%22-%E2%80%9E%22%22***/*%5C'%C3%AC%C2%B8%5C'%C2%AF", ":.%5C':%20:%20:%20:%20:%22-%E2%80%9E%20:%20:%20:%22%5C", ".:.:.:%20:%20:%20:%20:%22%20:%20:%20:%20:%20%5C,", ":.:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20%5C'%C3%8C", ":%20:%20:%20:%20:%20:%20:,%20:%20:%20:%20:%20:%20:/", "%22-%E2%80%9E_::::_%E2%80%9E-*__%E2%80%9E%E2%80%9E%7E%22"],
    bros: ["..._%E2%80%9E%E2%80%9E%E2%80%9E%E2%80%9E%C2%B8_...%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6._%C2%B8%E2%80%9E%E2%80%9E%E2%80%9E%E2%80%9E_", "./'.%E2%80%A6%E2%80%A6%C2%AF'*%7E--%E2%80%9E%E2%80%A6%E2%80%A6.%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6...%E2%80%9E--%7E*'%C2%AF%E2%80%A6%E2%80%A6.'%5C", "%C3%8C'%C3%AC%5C,.%E2%80%A6_%C2%B8%E2%80%9E--%7E%7E-%E2%80%9E)%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%E2%80%A6%20(%E2%80%9E-%7E%7E--%E2%80%9E%C2%B8_%E2%80%A6.,/%C3%AC'%C3%8C", "...'%5C%C2%AF%22%C2%AF-%C2%B8:%20:%20:%20:%20:%20%C2%AF%22%5E-%E2%80%9E%C2%B8%E2%80%A6.%C2%B8%E2%80%9E-%5E%22%C2%AF%20:%20:%20:%20:%20:%C2%B8-%C2%AF%22%C2%AF/'...", "%E2%80%A6%22-,%E2%80%9E%E2%80%9E%C2%B8/'%20:%20:%20:%20:%20:%20:%20:%20%C2%B8%E2%80%9E%E2%80%9E-%5E%22%C2%AF%20:%20:%20:%20:%20:%20:%20:%20'%5C%C2%B8%E2%80%9E%E2%80%9E,-%22......", "**%C2%AF%C2%AF%C2%AF'%5E%5E%7E-%E2%80%9E%E2%80%9E%E2%80%9E----%7E%5E*'%22%C2%AF%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%C2%B8-%22..........", ".:.:.:.:.%E2%80%9E-%5E%22%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20:%E2%80%9E-%22%20%22%5E-%E2%80%9E.:.:.:.:.", ":.:.:.:.:.:.:.:.:.:.:%20:%20:%20:%20:%20:%20:%20:%20:%20:%20%C2%B8%E2%80%9E-%5E%C2%AF:.:.:.:.:.:.:.:.:.:.:", ".::.:.:.:.:.:.:.:.%20:%20:%20:%20:%20:%20:%20:%20%C2%B8%E2%80%9E%E2%80%9E-%5E%C2%AF%20:%20:%20:%20:%20.:.:.:.:.:.:.:.::.", ":.'%20:%20:%20'%5C%20:%20:%20:%20:%20:%20:%20:%20;%C2%B8%E2%80%9E%E2%80%9E-%7E%22%C2%AF%7E-%E2%80%9E%E2%80%9E%C2%B8;%20:%20:%20:%20:%20:%20:%20:%20%5C'%20:%20:%20'.:", ":.:.::%20:%22-%E2%80%9E%22%22***/*'%C3%AC%C2%B8'%C2%AF.%20.%20.%20.%20.%20.%20.%20.%20%C2%AF'%C2%B8%C3%AC'*%5C***%22%22%E2%80%9E-%22:%20::.:.:", ":.':%20:%20:%20:%20:%22-%E2%80%9E%20:%20:%20:%22%5C%20.%20.Brothers.%20.%20/%22:%20:%20:%20%E2%80%9E-%22:%20:%20:%20:%20:'.:", ".:.:.:%20:%20:%20:%20:%22%20:%20:%20:%20:%20%5C,%20.%20.%20.In%20.%20.%20.%20,/%20:%20:%20:%20:%20%22:%20:%20:%20:%20:.:.:.", ":%20:%20:%20:%20:%20:%20:,%20:%20:%20:%20:%20:/%20.%20.%20Arms.%20.%20.%20%5C:%20:%20:%20:%20:%20:,:%20:%20:%20:%20:%20:"],
    dont: [" %2F     %5C             %5C            %2F    %5C       ","%7C       %7C             %5C          %7C      %7C      ","%7C       %60.             %7C         %7C       %3","     ","%60        %7C             %7C        %5C%7C       %7C     "," %5C       %7C %2F       %2F  %5C%5C%5C   --__ %5C%5C       %3","    ","  %5C      %5C%2F   _--%7E%7E          %7E--__%7C %5C     %7C      ","   %5C      %5C_-%7E                    %7E-_%5C    %7C    ","    %5C_     %5C        _.--------.______%5C%7C   %7C    ","      %5C     %5C______%2F%2F _ ___ _ (_(__%3E  %5C   %7C    ","       %5C   .  C ___)  ______ (_(____%3E  %7C  %2F    ","       %2F%5C %7C   C ____)%2F      %5C (_____%3E  %7C_%2F     ","      %2F %2F%5C%7C   C_____)       %7C  (___%3E   %2F  %5C    ","     %7C   (   _C_____)%5C______%2F  %2F%2F _%2F %2F     %5C   ","     %7C    %5C  %7C__   %5C%5C_________%2F%2F (__%2F       %7C  ","    %7C %5C    %5C____)   %60----   --'             %7C  ","    %7C  %5C_          ___%5C       %2F_          _%2F %7C ","   %7C              %2F    %7C     %7C  %5C            %7C ","   %7C             %7C    %2F       %5C  %5C           %7C ","   %7C          %2F %2F    %7C         %7C  %5C           %7C","   %7C         %2F %2F      %5C__%2F%5C___%2F    %7C          %7C","  %7C           %2F        %7C    %7C       %7C         %7C","  %7C          %7C         %7C    %7C       %7C         %7C"]
}
io.on('connection', function (socket) {
    var addedUser = false;

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        // we store the username in the socket session for this client
        socket.username = username;
        // add the client's username to the global list
        usernames[username] = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers,
            ip: socket.handshake.address
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('special', function (data) {
        if (data.name && special[data.name]) {
            special[data.name].forEach(function (value) {
                socket.broadcast.emit('typing', {
                    username: socket.username,
                    message: decodeURI(value)
                });
                socket.broadcast.emit('stop typing', {
                    username: socket.username
                });
            });
        }
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function (data) {
        socket.broadcast.emit('typing', {
            username: socket.username,
            message: data
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        // remove the username from global usernames list
        if (addedUser) {
            delete usernames[socket.username];
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});
