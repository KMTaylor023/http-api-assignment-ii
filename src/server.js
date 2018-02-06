const http = require('http');
const url = require('url');
const responseHandler = require('./responses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': responseHandler.getIndex,
  '/style.css': responseHandler.getCSS,
  '/getUsers': responseHandler.getUsers,
  '/notReal': responseHandler.notReal,
  '/addUser': responseHandler.addUser,
  notFound: responseHandler.notFound,
};

const onRequest = (request, response) => {
  const parsedURL = url.parse(request.url);


  if (urlStruct[parsedURL.pathname]) {
    urlStruct[parsedURL.pathname](request, response, request.method);
  } else {
    urlStruct.notFound(request, response);
  }
};


http.createServer(onRequest).listen(port);

console.log(`listening for requests on 127.0.0.1:${port}`);
