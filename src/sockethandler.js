const request = require("request-promise-native");

const client_id = '2nTku5e6Eal6QARD_RVh'; // 이준우꺼
const client_secret = '0hpWMiFf2p';

let messageMap = new Map();
let messageCount = 0;
const MAX_MSG = 50; // 최대 메세지 유지갯수

function setHandler(io){
    io.on('connection',socket=>{
        socket.on('message',async jsonData=>{ // Client socket.send 요청 (인자 : JSON)
            jsonData = JSON.parse(jsonData);
            console.log(`message : ${jsonData.text} received!`); // TEST CODE
            // 언어감지
              const options = {
                method: "post",
                url: "https://openapi.naver.com/v1/papago/detectLangs",
                form: { query: jsonData.text },
                headers: {
                    "X-Naver-Client-Id": client_id,
                      "X-Naver-Client-Secret": client_secret
                },
                json: true
              };
            
            let result;
              try {
                result = await request(options);
                result = result.langCode; // 이게 감지결과
            } catch (e) {
                console.log(e);
              }
            messageMap.set(messageCount, {sender : jsonData.sender, text : jsonData.text, lang : result});
            socket.broadcast.emit('newMessage',messageCount); // 새 메세지 왔다고 신호(메세지 번호를 보냄)
            messageCount = (messageCount + 1) % MAX_MSG;
        });
        
        socket.on('ready',async jsonData=>{ // 받을준비 됬다고 신호
            jsonData = JSON.parse(jsonData);
            const message = messageMap.get(jsonData.msgID);
            let data = {
                sender : message.sender, // 나중에 처리
                originalText : message.text, // 나중에 처리
                translatedText : null
            }
            
            // 번역
            if(jsonData.langCode != message.lang){
                const options = {
                    method: "post",
                    url: "https://openapi.naver.com/v1/papago/n2mt",
                    form: {
                        source: message.lang,
                        target: jsonData.langCode,
                        text: message.text
                    },
                    headers: {
                      "X-Naver-Client-Id": client_id,
                      "X-Naver-Client-Secret": client_secret
                    },
                    json: true
                  };
                const transResult = await request(options); // 번역결과 JSON객체
                  data.translatedText = transResult.message.result.translatedText;
            }
            socket.send(JSON.stringify(data));
        });
    });    
}

module.exports = setHandler;