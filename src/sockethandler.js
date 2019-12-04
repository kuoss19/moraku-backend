const request = require('request-promise-native');

function setHandler(io, port) {
  io.on('connection', (socket) => {
    socket.on('message', async (jsonData) => {
      // Client socket.send 요청 (인자 : JSON { sender, text })
      const data = JSON.parse(jsonData);

      const options = {
        method: 'get',
        url: `http://localhost:${port}/translate`,
        qs: { text: data.text },
        json: true,
      };

      let langCode;
      try {
        langCode = await request(options); // GET /translate
        langCode = langCode.result;
        data.source = langCode;
      } catch (e) {
        data.source = null;
      }
      socket.broadcast.send(JSON.stringify(data));
      // 새로온 메세지 모두에게 전달(인자 : JSON { sender, text, source })
    });

    socket.on('disconnect', () => {
      io.send(
        JSON.stringify({ sender: null, text: 'Someone Left the Chat Room' }),
      );
    });

    io.send(
      JSON.stringify({ sender: null, text: 'New Person Entered the Chat Room' }),
    );
  });
}

module.exports = setHandler;
