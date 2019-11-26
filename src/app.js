const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const ejs = require('ejs');

const socketio = require('socket.io');
const request = require("request-promise-native");

const app = express();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const client_id = '2nTku5e6Eal6QARD_RVh'; // 이준우꺼
const client_secret = '0hpWMiFf2p';

let messageMap = new Map();
let messageCount = 0;

app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 4000;

io.on('connection',socket=>{
	socket.on('message',async data=>{ // Client socket.send 요청 (인자 : JSON)
		data = JSON.parse(data);
		console.log(`message : ${data.text} received!`); // TEST CODE
		// 언어감지
  		const options = {
    		method: "post",
    		url: "https://openapi.naver.com/v1/papago/detectLangs",
    		form: { query: data.text },
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
		messageMap.set(messageCount, {sender : data.sender, text : data.text, lang : result});
		socket.broadcast.emit('newMessage',messageCount++); // 새 메세지 왔다고 신호(메세지 번호를 보냄)
	});
	
	socket.on('ready',async langMsg=>{ // 받을준비 됬다고 신호
		langMsg = JSON.parse(langMsg);
		const message = messageMap.get(langMsg.msgNum);
		let data = {
			sender : message.sender, // 나중에 처리
			originalText : message.text, // 나중에 처리
			translatedText : null
		}
		
		// 번역
		if(langMsg.langCode != message.lang){
			const options = {
    			method: "post",
    			url: "https://openapi.naver.com/v1/papago/n2mt",
    			form: {
					source: message.lang,
			        target: langMsg.langCode,
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

server.listen(port);
// eslint-disable-next-line no-console
console.log(`App listening at port ${port}`);
