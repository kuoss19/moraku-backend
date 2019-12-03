const express = require('express');

const router = express.Router();

/* GET chat page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Moraku' });
});

module.exports = router;
