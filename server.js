// Хост и порт
var host = process.env.HOST || '0.0.0.0';
var port = process.env.PORT || 8080;

// Чёрный и белый списки origin (домены, с которых разрешены запросы к прокси)
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
  // 🔽🔽🔽 ДОБАВЛЯЕМ ФУНКЦИЮ ДЛЯ УСТАНОВКИ ЗАГОЛОВКОВ 🔽🔽🔽
  // Функция handleInitialRequest может быть использована для модификации запроса
  handleInitialRequest: function (req, res, location) {
    // Здесь можно проверить, куда идёт запрос, и принять решение о добавлении заголовков
    // Например, если запрос идёт к определённому домену
    if (location && location.hostname === 'example.com') { // Замените на нужный домен
      // Устанавливаем заголовок Referer
      req.headers['referer'] = 'https://expected-referer.com/'; // Желаемый Referer
      // Можно установить и другие заголовки, если нужно
      // req.headers['user-agent'] = 'My Custom User Agent';
    }
    // Возвращаем false, чтобы продолжить обработку запроса прокси
    return false;
  },
  // 🔼🔼🔼 КОНЕЦ ДОБАВЛЕНИЯ 🔼🔼🔼
  redirectSameOrigin: true,
  httpProxyOptions: {
    xfwd: false,
    // 🔽🔽🔽 ДОПОЛНИТЕЛЬНАЯ НАСТРОЙКА ЗАГОЛОВКОВ ЧЕРЕЗ httpProxyOptions 🔽🔽🔽
    // Опция selfHandleResponse может потребоваться, если нужно обработать ответ
    // selfHandleResponse: true, // Будьте осторожны с этой опцией, она требует ручной обработки ответа
    // Чтобы добавлять заголовки к запросу, можно использовать функцию onProxyReq
    onProxyReq: function(proxyReq, req, res) {
      // Добавляем заголовок Referer ко всем исходящим запросам прокси
      proxyReq.setHeader('Referer', 'https://expected-referer.com/');
      // Можно добавить другие заголовки, например, User-Agent
      // proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    }
    // 🔼🔼🔼 КОНЕЦ ДОПОЛНИТЕЛЬНОЙ НАСТРОЙКИ 🔼🔼🔼
  },
}).listen(port, host, function() {
  console.log('Running CORS Anywhere on ' + host + ':' + port);
});
