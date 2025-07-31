// Хост и порт
var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || 8080;

// Чёрный и белый списки origin (домены с которых разрешены запросы к прокси)
var originBlacklist = [];
// Тут надо указать разрешённые origin, например, ваш сайт в punycode:
// для "истрарккпрф.рф" будет "https://xn--80akdjffldm5a.xn--p1ai"
var originWhitelist = [];

// Модуль для ограничения частоты запросов
var checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

var cors_proxy = require('./lib/cors-anywhere');

cors_proxy.createServer({
  originBlacklist: originBlacklist,
  originWhitelist: originWhitelist,
  // Указываем заголовки, которые должны быть у запросов, чтобы прокси их пропускал
  requireHeader: [],
  checkRateLimit: checkRateLimit,
  removeHeaders: [
    'cookie',
    'cookie2',
    'x-request-start',
    'x-request-id',
    'via',
    'connect-time',
    'total-route-time',
  ],
  redirectSameOrigin: true,
  httpProxyOptions: {
    xfwd: false,
  },
}).listen(port, host, function() {
  console.log('Running CORS Anywhere on ' + host + ':' + port);
});
