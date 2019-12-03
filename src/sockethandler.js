function setHandler(io) {
  io.on('connection', socket => {
    socket.on('message', jsonData => {
      // Client socket.send 요청 (인자 : JSON { sender, text })
      jsonData = JSON.parse(jsonData);
      console.log(`message : ${jsonData.text} / received!`); // TEST CODE

      socket.broadcast.send(JSON.stringify(jsonData)); // 새로온 메세지 모두에게 전달
    });

    socket.on('disconnect', () => {
      io.send(
        JSON.stringify({ sender: null, text: 'Someone Left the Chat Room' })
      );
    });

    io.send(
      JSON.stringify({ sender: null, text: 'New Person Entered the Chat Room' })
    );
  });
}

module.exports = setHandler;
