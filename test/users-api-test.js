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
    // no initial setup
  });

  teardown(async function() {
    await apiService.createUser(authUser);
    await apiService.authenticate(authUser);
    await apiService.deleteAllUsers();
    apiService.clearAuth();
  });

  test('POST /users/authenticate | valid user -> 201 Created', async function() {
    await apiService.createUser(newUser);
    const response = await apiService.authenticate(newUser);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 201);
    assert.isDefined(payload.token);
  });

  test('POST /users/authenticate | invalid user -> 404 Not Found', async function() {
    const response = await apiService.authenticate(newUser);
    assert.equal(response.statusCode, 404);
  });

  test('POST /users | valid user -> 201 Created', async function() {
    const response = await apiService.createUser(newUser);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 201);
    assert.isDefined(payload._id);
  });

  test('POST /users | duplicate user -> 400 Bad Request', async function() {
    await apiService.createUser(newUser);
    const response = await apiService.createUser(newUser);
    assert.equal(response.statusCode, 400);
  });

  test('POST /users | invalid user -> 400 Bad Request', async function() {
    const response = await apiService.createUser({});
    assert.equal(response.statusCode, 400);
  });

  test('GET /users | all users -> 200 OK', async function() {
    await apiService.createUser(authUser);
    await apiService.authenticate(authUser);
    for (let u of users) {
      await apiService.createUser(u);
    }
    const response = await apiService.getUsers();
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payload.length, users.length + 1);
  });

  test('GET /users/{id} | valid id -> 200 OK', async function() {
    const responseCreate = await apiService.createUser(newUser);
    const payloadCreate = JSON.parse(responseCreate.payload);
    await apiService.authenticate(newUser);
    const response = await apiService.getUser(payloadCreate._id);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepOwnInclude(payloadCreate, payload);
  });

  test('GET /users/{id} | invalid id -> 400 Bad Request', async function() {
    await apiService.createUser(newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getUser('1234');
    assert.equal(response.statusCode, 400);
  });

  test('GET /users/{id} | invalid id -> 404 Not Found', async function() {
    await apiService.createUser(newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getUser('012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('PUT /users/{id} | valid user -> 200 OK', async function() {
    const responseCreate = await apiService.createUser(newUser);
    const payloadCreate = JSON.parse(responseCreate.payload);
    await apiService.authenticate(newUser);
    const response = await apiService.updateUser(payloadCreate._id, newUser);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payloadCreate._id, payload._id);
  });

  test('PUT /users/{id} | invalid user -> 400 Bad Request', async function() {
    await apiService.createUser(newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.updateUser('1234', newUser);
    assert.equal(response.statusCode, 400);
  });

  test('PUT /users/{id} | invalid user -> 404 Not Found', async function() {
    await apiService.createUser(newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.updateUser('012345678901234567890123', newUser);
    assert.equal(response.statusCode, 404);
  });

  test('DELETE /users | all users -> 200 OK', async function() {
    await apiService.createUser(authUser);
    await apiService.authenticate(authUser);
    for (let u of users) {
      await apiService.createUser(u);
    }
    const response = await apiService.deleteAllUsers();
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(payload, { success: true });
  });

  test('DELETE /users | all users -> 403 Forbidden', async function() {
    await apiService.createUser(newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.deleteAllUsers();
    assert.equal(response.statusCode, 403);
  });

  test('DELETE /users/{id} | valid id -> 200 OK', async function() {
    const responseCreate = await apiService.createUser(authUser);
    const payloadCreate = JSON.parse(responseCreate.payload);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteOneUser(payloadCreate._id);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(payload, { success: true });
  });

  test('DELETE /users/{id} | invalid id -> 400 Bad Request', async function() {
    await apiService.createUser(authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteOneUser('1234');
    assert.equal(response.statusCode, 400);
  });

  test('DELETE /users/{id} | invalid id -> 404 Not Found', async function() {
    await apiService.createUser(authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteOneUser('012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('DELETE /users/{id} | valid id -> 403 Forbidden', async function() {
    await apiService.createUser(newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.deleteOneUser('012345678901234567890123');
    assert.equal(response.statusCode, 403);
  });
});
