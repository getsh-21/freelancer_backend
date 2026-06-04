const chatSocket = (io) => {
  const onlineUsers = {};

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId) => {
      onlineUsers[userId] = socket.id;
      io.emit('onlineUsers', Object.keys(onlineUsers));
    });

    socket.on('sendMessage', (data) => {
      const receiverSocketId = onlineUsers[data.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', data);
      }
    });

    socket.on('typing', (data) => {
      const receiverSocketId = onlineUsers[data.receiverId];
      if (receiverSocketId) io.to(receiverSocketId).emit('typing', data);
    });

    socket.on('stopTyping', (data) => {
      const receiverSocketId = onlineUsers[data.receiverId];
      if (receiverSocketId) io.to(receiverSocketId).emit('stopTyping', data);
    });

    socket.on('disconnect', () => {
      for (const userId in onlineUsers) {
        if (onlineUsers[userId] === socket.id) {
          delete onlineUsers[userId];
          break;
        }
      }
      io.emit('onlineUsers', Object.keys(onlineUsers));
    });
  });
};

module.exports = chatSocket;