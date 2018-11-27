const socketIo = require('socket.io');

module.exports = function socketInit(server){
    const io = socketIo(server);
    io.use(function(socket, next) {
        /*
        console.log(socket.handshake.query);
        if (socket.handshake.query && socket.handshake.query.token) {
          console.log("verify");
          jwt.verify(socket.handshake.query.token, config.secret, function(err, decoded) {
            console.log(err);
            if (err) return next(new Error('Authentication error'));
            socket.decoded = decoded;
  
            next();
          });
        } else {
          next(new Error('Authentication error'));
        }*/
        next();
      }).on('connect', (socket) => {
        console.log('Connected client');

        // socket.on('contactlist');
    
    
    
    }    
        );
}