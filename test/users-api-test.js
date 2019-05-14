'use strict';
const suite = require('mocha').suite;
const assert = require('chai').assert;
const ApiService = require('./api-service');
const fixtures = require('./fixtures.json');
const { init } = require('../server');

suite('Users API endpoints', function() {
  let users = fixtures.users;
  let newUser = fixtures.newUser;
  let authUser = fixtures.authUser;

  let server;
  let apiService;

  suiteSetup(async function() {
    server = await init();
    apiService = new ApiService(server);
  });

  suiteTeardown(async function() {
    await server.stop();
  });

  setup(async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    await apiService.deleteAllResources(apiService.usersEndpoint);
    apiService.clearAuth();
  });

  teardown(async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    await apiService.deleteAllResources(apiService.usersEndpoint);
    apiService.clearAuth();
  });

  test('POST /users/authenticate | valid user -> 201 Created', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    const response = await apiService.authenticate(newUser);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 201);
    assert.isDefined(payload.token);
  });

  test('POST /users/authenticate | password mismatch -> 401 Unauthorized', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    const modifiedPasswordUser = Object.assign({}, newUser, {password: 'incorrect'});
    const response = await apiService.authenticate(modifiedPasswordUser);
    assert.equal(response.statusCode, 401);
  });

  test('POST /users/authenticate | unknown user -> 404 Not Found', async function() {
    const response = await apiService.authenticate(newUser);
    assert.equal(response.statusCode, 404);
  });

  test('POST /users | valid user -> 201 Created', async function() {
    const response = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 201);
    assert.isDefined(payload._id);
  });

  test('POST /users | duplicate user -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    const response = await apiService.createResource(apiService.usersEndpoint, newUser);
    assert.equal(response.statusCode, 400);
  });

  test('POST /users | invalid user -> 400 Bad Request', async function() {
    const response = await apiService.createResource(apiService.usersEndpoint, {});
    assert.equal(response.statusCode, 400);
  });

  test('GET /users | all users -> 200 OK', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    for (let u of users) {
      await apiService.createResource(apiService.usersEndpoint, u);
    }
    const response = await apiService.getAllResources(apiService.usersEndpoint);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payload.length, users.length + 1);
  });

  test('GET /users/{id} | valid id -> 200 OK', async function() {
    const responseCreate = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadCreate = JSON.parse(responseCreate.payload);
    await apiService.authenticate(newUser);
    const response = await apiService.getResource(apiService.usersEndpoint, payloadCreate._id);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepOwnInclude(payloadCreate, payload);
  });

  test('GET /users/{id} | valid id -> 401 Unauthorized', async function() {
    const response = await apiService.getResource(apiService.usersEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 401);
  });

  test('GET /users/{id} | valid id -> 401 Invalid Credentials', async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    await apiService.deleteAllResources(apiService.usersEndpoint);
    const response = await apiService.getResource(apiService.usersEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 401);
  });

  test('GET /users/{id} | invalid id -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getResource(apiService.usersEndpoint, '1234');
    assert.equal(response.statusCode, 400);
  });

  test('GET /users/{id} | valid id -> 404 Not Found', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getResource(apiService.usersEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('PUT /users/{id} | valid user -> 200 OK', async function() {
    const responseCreate = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadCreate = JSON.parse(responseCreate.payload);
    await apiService.authenticate(newUser);
    const response = await apiService.updateResource(apiService.usersEndpoint, payloadCreate._id, newUser);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payloadCreate._id, payload._id);
  });

  test('PUT /users/{id} | invalid user -> 400 Bad Request', async function() {
    const responseCreate = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadCreate = JSON.parse(responseCreate.payload);
    await apiService.authenticate(newUser);
    const response = await apiService.updateResource(apiService.usersEndpoint, payloadCreate._id, {});
    assert.equal(response.statusCode, 400);
  });

  test('PUT /users/{id} | invalid id -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.updateResource(apiService.usersEndpoint, '1234', newUser);
    assert.equal(response.statusCode, 400);
  });

  test('PUT /users/{id} | valid id -> 404 Not Found', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.updateResource(apiService.usersEndpoint, '012345678901234567890123', newUser);
    assert.equal(response.statusCode, 404);
  });

  test('DELETE /users | all users -> 200 OK', async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    for (let u of users) {
      await apiService.createResource(apiService.usersEndpoint, u);
    }
    const response = await apiService.deleteAllResources(apiService.usersEndpoint);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(payload, { success: true });
  });

  test('DELETE /users | all users -> 403 Forbidden', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.deleteAllResources(apiService.usersEndpoint);
    assert.equal(response.statusCode, 403);
  });

  test('DELETE /users/{id} | valid id -> 200 OK', async function() {
    const responseCreate = await apiService.createResource(apiService.usersEndpoint, authUser);
    const payloadCreate = JSON.parse(responseCreate.payload);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteOneResource(apiService.usersEndpoint, payloadCreate._id);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(payload, { success: true });
  });

  test('DELETE /users/{id} | invalid id -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteOneResource(apiService.usersEndpoint, '1234');
    assert.equal(response.statusCode, 400);
  });

  test('DELETE /users/{id} | valid id -> 404 Not Found', async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteOneResource(apiService.usersEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('DELETE /users/{id} | valid id -> 403 Forbidden', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.deleteOneResource(apiService.usersEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 403);
  });
});
