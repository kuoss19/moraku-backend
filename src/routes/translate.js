const express = require('express');
const request = require('request-promise-native');

const clientId = '2nTku5e6Eal6QARD_RVh'; // 이준우꺼
const clientSecret = '0hpWMiFf2p';

const router = express.Router();

/* POST translate Text */
router.post('/', async (req, res) => {
  // body 잘못오는거 처리 어케함??
  const { textToTranslate, langCode } = req.body;
  // 번역할 텍스트 와 받는 사람의 langCode

  // 먼저 언어감지
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
  } catch (e) {
    res.status(500);
    res.json({ status: 500 });
    return;
  }

  // 번역단계
  options.url = 'https://openapi.naver.com/v1/papago/n2mt';
  options.form = {
    source: result,
    target: langCode,
    text: textToTranslate,
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
