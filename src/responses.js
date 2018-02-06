const fs = require('fs'); // pull in the file system module
const query = require('querystring');

const index = fs.readFileSync('$ {__dirname}/../client/client.html');
const css = fs.readFileSync('$ {__dirname}/../client/style.css');

const users = {};

const respond = (request, response, content, contentType, status) => {
  response.writeHead(status, { 'Content-Type': contentType });
  response.write(content);
  response.end();
};

const respondHead = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// creates a json response string, with an id if provided
const createJSON = (msg, id) => {
  const json = { msg };
  if (id) {
    json.id = id;
  }

  return JSON.stringify(json);
};

const respondJson = (request, response, content, status) => {
  respond(request, response, content, 'application/json', status);
};

const methodNotAllowed = (request, response, method, pathname) => {
  const msg = `The ${method} method is not allowed for the path ${pathname}`;
  const content = createJSON(msg, 'MethodNotAllowed');

  respondJson(request, response, content, 405);
};

const getIndex = (request, response) => {
  respond(request, response, index, 'text/html', 200);
};

const getCSS = (request, response) => {
  respond(request, response, css, 'text/css', 200);
};

const notFound = (request, response) => {
  const msg = 'Error 404: resource not found';
  const id = 'notFound';

  const resp = createJSON(msg, id);

  return respondJson(request, response, resp, 404);
};


const getUsers = (request, response, method) => {
  if (method === 'GET') {
    const content = JSON.stringify({ users });
    return respondJson(request, response, content, 200);
  } else if (method === 'HEAD') {
    return respondHead(request, response, 200);
  }
  return methodNotAllowed(request, response, method, '/getUsers');
};

const notReal = (request, response, method) => {
  if (method === 'GET') {
    const content = createJSON(
      'The requested resource was not found!',
      'notFound');
    return respondJson(request, response, content, 404);
  } else if (method === 'HEAD') {
    return respondHead(request, response, 404);
  }
  return methodNotAllowed(request, response, method, '/notReal');
};


// Handles user body param reading, to break up addUser method
// probably should have left the byte reading to server.js
const userPostHandler = (request, response, body) => {
  let message = 'Name and age(integer) are required';
  if (!body.name || !body.age || !Number.isInteger(+body.age)) {
    const msg = createJSON(message, 'missingParams');
    return respondJson(request, response, msg, 400);
  }

  let rcode = 201;

  if (users[body.name]) {
    rcode = 204;
  } else {
    users[body.name] = {};
  }


  users[body.name].name = body.name;
  users[body.name].age = +body.age;

  if (rcode === 201) {
    message = createJSON('Created Successfuly!');
    return respondJson(request, response, message, rcode);
  }

  return respondHead(request, response, rcode);
};


const addUser = (request, response, method) => {
  if (method !== 'POST') {
    return methodNotAllowed(request, response, method, '/addUser');
  }

  const body = [];

  // I feel like, in the future, I should leave handling mothod resolving
  // and post reading to the server file, for organization
  request.on('err', (err) => {
    console.dir(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();

    const bodyParams = query.parse(bodyString);

    return userPostHandler(request, response, bodyParams);
  });
  return true;
};

module.exports = {
  getIndex,
  getCSS,
  getUsers,
  notReal,
  addUser,
  notFound,
};
