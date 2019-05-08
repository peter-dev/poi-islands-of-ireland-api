'use strict';
const suite = require('mocha').suite;
const assert = require('chai').assert;
const UsersService = require('./users-service');
const fixtures = require('./fixtures.json');

suite('Users api', function() {
  let users = fixtures.users;
  let newUser = fixtures.newUser;
  let authUser = fixtures.authUser;

  const usersService = new UsersService(fixtures.apiUrl);

  setup(async function() {
    // no initial setup
  });

  teardown(async function() {
    await usersService.createUser(authUser);
    await usersService.authenticate(authUser);
    await usersService.deleteAllUsers();
    await usersService.clearAuth();
  });

  test('authenticate', async function () {
    await usersService.createUser(newUser);
    const response = await usersService.authenticate(newUser);
    assert.equal(response.status, 201);
    assert.isDefined(response.data.token);
  });

  test('create user', async function() {
    const response = await usersService.createUser(newUser);
    assert.equal(response.status, 201);
    assert.isDefined(response.data._id);
  });

  test('create user email exist', async function() {
    await usersService.createUser(newUser);
    const response = await usersService.createUser(newUser);
    assert.equal(response.status, 400);
    assert.isUndefined(response.data._id);
  });

  test('create invalid user', async function() {
    const response = await usersService.createUser({});
    assert.equal(response.status, 400);
    assert.isUndefined(response.data._id);
  });

  test('get all users', async function() {
    await usersService.createUser(authUser);
    await usersService.authenticate(authUser);
    for (let u of users) {
      await usersService.createUser(u);
    }
    const response = await usersService.getUsers();
    assert.equal(response.status, 200);
    assert.equal(response.data.length, users.length + 1);
  });

  test('get user', async function() {
    await usersService.createUser(authUser);
    await usersService.authenticate(authUser);
    const responseCreate = await usersService.createUser(newUser);
    const response = await usersService.getUser(responseCreate.data._id);
    assert.equal(response.status, 200);
    assert.deepEqual(responseCreate.data, response.data);
  });

  test('get invalid user', async function() {
    await usersService.createUser(authUser);
    await usersService.authenticate(authUser);
    const response1 = await usersService.getUser('1234');
    assert.equal(response1.status, 400);
    const response2 = await usersService.getUser('012345678901234567890123');
    assert.equal(response2.status, 404);
  });

  test('update user', async function() {
    await usersService.createUser(authUser);
    await usersService.authenticate(authUser);
    const responseCreate = await usersService.createUser(newUser);
    const response = await usersService.updateUser(responseCreate.data._id, newUser);
    assert.equal(response.status, 200);
    assert.equal(responseCreate.data._id, response.data._id);
  });

  test('update invalid user', async function() {
    await usersService.createUser(authUser);
    await usersService.authenticate(authUser);
    const response1 = await usersService.updateUser('1234', newUser);
    assert.equal(response1.status, 400);
    const response2 = await usersService.updateUser('012345678901234567890123', newUser);
    assert.equal(response2.status, 404);
  });

  test('delete all users', async function() {
    await usersService.createUser(authUser);
    await usersService.authenticate(authUser);
    for (let u of users) {
      await usersService.createUser(u);
    }
    const response = await usersService.deleteAllUsers();
    assert.equal(response.status, 200);
    assert.deepEqual(response.data, { success: true });
  });

  test('delete all users empty', async function() {
    await usersService.createUser(authUser);
    await usersService.authenticate(authUser);
    const response = await usersService.deleteAllUsers();
    assert.equal(response.status, 200);
    assert.deepEqual(response.data, { success: true });
  });

  test('delete user', async function() {
    await usersService.createUser(authUser);
    await usersService.authenticate(authUser);
    const responseCreate = await usersService.createUser(newUser);
    const response = await usersService.deleteOneUser(responseCreate.data._id);
    assert.equal(response.status, 200);
    assert.deepEqual(response.data, { success: true });
  });

  test('delete invalid user', async function() {
    await usersService.createUser(authUser);
    await usersService.authenticate(authUser);
    const response = await usersService.deleteOneUser('1234');
    assert.equal(response.status, 400);
  });

  test('delete all users forbidden', async function() {
    await usersService.createUser(newUser);
    await usersService.authenticate(newUser);
    const response = await usersService.deleteAllUsers();
    assert.equal(response.status, 403);
  });

  test('delete user forbidden', async function() {
    await usersService.createUser(newUser);
    await usersService.authenticate(newUser);
    const responseCreate = await usersService.createUser(newUser);
    const response = await usersService.deleteOneUser(responseCreate.data._id);
    assert.equal(response.status, 403);
  });
});
