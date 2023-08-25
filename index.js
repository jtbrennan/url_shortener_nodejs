const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({
  limit: '10mb',
  extended: true
}));

const originalURLs = [];
const shortURLs = [];

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;
  var pattern = new RegExp('^(https?:\\/\\/)?' +
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
    '((\\d{1,3}\\.){3}\\d{1,3}))' +
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
    '(\\?[;&a-z\\d%_.~+=-]*)?' +
    '(\\#[-a-z\\d_]*)?$', 'i');
  if (!pattern.test(url)) return res.json({ error: 'invalid url' });

  const foundIndex = originalURLs.indexOf(url);

  if (foundIndex < 0) {
    originalURLs.push(url);
    shortURLs.push(shortURLs.length);
    return res.json({
      original_url: url,
      short_url: shortURLs.length - 1
    });
  }

  return res.json({
    original_url: url,
    short_url: shortURLs[foundIndex]
  });
});

app.get("/api/shorturl/:value", (req, res) => {
  const shortenedURL = Number(req.params.value);
  if (Number.isNaN(shortenedURL)) return res.json({ "error": "Wrong format" });

  const foundIndex = shortURLs.indexOf(shortenedURL);

  if (foundIndex < 0) return res.json({ "error": "No short URL found for the given input" });

  res.redirect(originalURLs[foundIndex]);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
