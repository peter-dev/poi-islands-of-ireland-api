'use strict';
const suite = require('mocha').suite;
const assert = require('chai').assert;
const ApiService = require('./api-service');
const fixtures = require('./fixtures.json');
const { init } = require('../server');

suite('Regions API endpoints', function() {
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
    await apiService.createUser(authUser);
    await apiService.authenticate(authUser);
  });

  teardown(async function() {
    await apiService.deleteAllUsers();
    apiService.clearAuth();
  });

  test('GET /regions | all regions -> 200 OK', async function() {
    const response = await apiService.getRegions();
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payload.length, 5);
  });

  test('GET /regions/{id} | valid id -> 200 OK', async function() {
    const responseRegions = await apiService.getRegions();
    const payloadRegions = JSON.parse(responseRegions.payload);
    const id = payloadRegions[0]._id;
    const response = await apiService.getRegion(id);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(id, payload._id);
  });

  test('GET /regions/{id} | invalid id -> 400 Bad Request', async function() {
    const response = await apiService.getRegion('1234');
    assert.equal(response.statusCode, 400);
  });

  test('GET /regions/{id} | invalid id -> 404 Not Found', async function() {
    const response = await apiService.getRegion('012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });
});
