const qs = require('qs');
const request = require('request-promise-native');

function socketHandler(io, port) {
  const users = new Map();

  io.on('connection', (socket) => {
    socket.on('message', async (data) => {
      // Client socket.send 요청 (인자 : JSON { sender, text })

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
      socket.broadcast.send(data);
      // 새로온 메세지 모두에게 전달(인자 : JSON { sender, text, source })
    });

    socket.on('disconnect', () => {
      users.delete(socket.id);
      io.send(
        JSON.stringify({ sender: null, text: 'Someone Left the Chat Room' }),
      );
    });

    // eslint-disable-next-line
    socket.emit('connected', Object.values(Object.fromEntries(users)));

    const { id, request: connectionRequest } = socket;
    const query = qs.parse(connectionRequest.url.split('?')[1]);
    users.set(id, { id, ...query });

    socket.broadcast.emit('hello', users.get(id));
  });
}

module.exports = socketHandler;
