const request = require('request-promise-native');

function setHandler(io, port) {
  io.on('connection', socket => {
    socket.on('message', async jsonData => {
      // Client socket.send 요청 (인자 : JSON { sender, text })
      jsonData = JSON.parse(jsonData);

      const options = {
        method: 'get',
        url: `http://localhost:${port}/translate`,
        qs: { text: jsonData.text },
        json: true,
      };

      let langCode;
      try {
        langCode = await request(options); // GET /translate
        langCode = langCode.result;
        jsonData.source = langCode;
      } catch (e) {
        jsonData.source = null;
      }
      socket.broadcast.send(JSON.stringify(jsonData));
      // 새로온 메세지 모두에게 전달(인자 : JSON { sender, text, source })
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
