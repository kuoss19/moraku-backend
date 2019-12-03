const express = require('express');
const request = require('request-promise-native');

const clientId = '2nTku5e6Eal6QARD_RVh'; // 이준우꺼
const clientSecret = '0hpWMiFf2p';

const router = express.Router();

/* GET languageDetect */
router.get('/', async (req, res) => {
  const textToTranslate = req.query.text;
  const options = {
    method: 'post',
    url: 'https://openapi.naver.com/v1/papago/detectLangs',
    form: { query: textToTranslate },
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
    json: true,
  };

  let result;
  try {
    result = await request(options);
    result = result.langCode; // 이게 언어감지결과
    res.json({ status: 200, result });
  } catch (e) {
    res.status(500);
    res.json({ status: 500 });
  }
});


/* POST translate Text */
router.post('/', async (req, res) => {
  // body 잘못오는거 처리 어케함??
  const options = {
    method: 'post',
    url: 'https://openapi.naver.com/v1/papago/n2mt',
    form: req.body, // 번역할 텍스트, 감지된 언어코드와 받는 사람의 langCode
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
    json: true,
  };

  try {
    const transResult = await request(options); // 번역결과 JSON객체
    res.status(200);
    res.json({
      status: 200,
      translatedText: transResult.message.result.translatedText,
    });
  } catch (e) {
    res.status(500);
    res.json({ status: 500 });
  }
});

module.exports = router;
