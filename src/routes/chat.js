const express = require("express");

const router = express.Router();

/* GET chat page. */
router.get("/", (req, res) => {
  res.render("chat", { title: "Moraku - Chat Room" });
});

module.exports = router;
