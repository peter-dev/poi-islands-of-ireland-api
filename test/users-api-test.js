'use strict';
const suite = require('mocha').suite;
const assert = require('chai').assert;
const UsersService = require('./users-service');
const fixtures = require('./fixtures.json');
const { init } = require('../server');

suite('Users API endpoints', async function() {
  let users = fixtures.users;
  let newUser = fixtures.newUser;
  let authUser = fixtures.authUser;

  let server;
  let usersService;

  suiteSetup(async function() {
    server = await init();
    usersService = new UsersService(server);
  });

  suiteTeardown(async function() {
    await server.stop();
  });

  setup(async function() {
    // no initial setup
  });

  teardown(async function() {
    await usersService.createUser(authUser);
    await usersService.authenticate(authUser);
    await usersService.deleteAllUsers();
    await usersService.clearAuth();
  });

  test('POST /users/authenticate | valid user -> 201 Created', async function() {
    await usersService.createUser(newUser);
    const response = await usersService.authenticate(newUser);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 201);
    assert.isDefined(payload.token);
  });

  test('POST /users/authenticate | invalid user -> 404 Not Found', async function() {
    const response = await usersService.authenticate(newUser);
    assert.equal(response.statusCode, 404);
  });

  test('POST /users | valid user -> 201 Created', async function() {
    const response = await usersService.createUser(newUser);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 201);
    assert.isDefined(payload._id);
  });

  test('POST /users | duplicate user -> 400 Bad Request', async function() {
    await usersService.createUser(newUser);
    const response = await usersService.createUser(newUser);
    assert.equal(response.statusCode, 400);
  });

  test('POST /users | invalid user -> 400 Bad Request', async function() {
    const response = await usersService.createUser({});
    assert.equal(response.statusCode, 400);
  });

  test('GET /users | all users -> 200 OK', async function() {
    await usersService.createUser(authUser);
    await usersService.authenticate(authUser);
    for (let u of users) {
      await usersService.createUser(u);
    }
    const response = await usersService.getUsers();
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payload.length, users.length + 1);
  });

  test('GET /users/{id} | valid id -> 200 OK', async function() {
    const responseCreate = await usersService.createUser(newUser);
    const payloadCreate = JSON.parse(responseCreate.payload);
    await usersService.authenticate(newUser);
    const response = await usersService.getUser(payloadCreate._id);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepOwnInclude(payloadCreate, payload);
  });

  test('GET /users/{id} | invalid id -> 400 Bad Request', async function() {
    await usersService.createUser(newUser);
    await usersService.authenticate(newUser);
    const response = await usersService.getUser('1234');
    assert.equal(response.statusCode, 400);
  });

  test('GET /users/{id} | invalid id -> 404 Not Found', async function() {
    await usersService.createUser(newUser);
    await usersService.authenticate(newUser);
    const response = await usersService.getUser('012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('PUT /users/{id} | valid user -> 200 OK', async function() {
    const responseCreate = await usersService.createUser(newUser);
    const payloadCreate = JSON.parse(responseCreate.payload);
    await usersService.authenticate(newUser);
    const response = await usersService.updateUser(payloadCreate._id, newUser);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payloadCreate._id, payload._id);
  });

  test('PUT /users/{id} | invalid user -> 400 Bad Request', async function() {
    await usersService.createUser(newUser);
    await usersService.authenticate(newUser);
    const response = await usersService.updateUser('1234', newUser);
    assert.equal(response.statusCode, 400);
  });

  test('PUT /users/{id} | invalid user -> 404 Not Found', async function() {
    await usersService.createUser(newUser);
    await usersService.authenticate(newUser);
    const response = await usersService.updateUser('012345678901234567890123', newUser);
    assert.equal(response.statusCode, 404);
  });

  test('DELETE /users | all users -> 200 OK', async function() {
    await usersService.createUser(authUser);
    await usersService.authenticate(authUser);
    for (let u of users) {
      await usersService.createUser(u);
    }
    const response = await usersService.deleteAllUsers();
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(payload, { success: true });
  });

  test('DELETE /users | all users -> 403 Forbidden', async function() {
    await usersService.createUser(newUser);
    await usersService.authenticate(newUser);
    const response = await usersService.deleteAllUsers();
    assert.equal(response.statusCode, 403);
  });

  test('DELETE /users/{id} | valid id -> 200 OK', async function() {
    const responseCreate = await usersService.createUser(authUser);
    const payloadCreate = JSON.parse(responseCreate.payload);
    await usersService.authenticate(authUser);
    const response = await usersService.deleteOneUser(payloadCreate._id);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(payload, { success: true });
  });

  test('DELETE /users/{id} | invalid id -> 400 Bad Request', async function() {
    await usersService.createUser(authUser);
    await usersService.authenticate(authUser);
    const response = await usersService.deleteOneUser('1234');
    assert.equal(response.statusCode, 400);
  });

  test('DELETE /users/{id} | invalid id -> 404 Not Found', async function() {
    await usersService.createUser(authUser);
    await usersService.authenticate(authUser);
    const response = await usersService.deleteOneUser('012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('DELETE /users/{id} | valid id -> 403 Forbidden', async function() {
    await usersService.createUser(newUser);
    await usersService.authenticate(newUser);
    const response = await usersService.deleteOneUser('012345678901234567890123');
    assert.equal(response.statusCode, 403);
  });
});
