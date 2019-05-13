'use strict';
const suite = require('mocha').suite;
const assert = require('chai').assert;
const ApiService = require('./api-service');
const fixtures = require('./fixtures.json');
const { init } = require('../server');

suite('Islands API endpoints', function() {
  let newIsland = fixtures.newIsland;
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
    await apiService.createUser(authUser);
    await apiService.authenticate(authUser);
    await apiService.deleteAllIslands();
    await apiService.deleteAllUsers();
    apiService.clearAuth();
  });

  teardown(async function() {
    await apiService.createUser(authUser);
    await apiService.authenticate(authUser);
    await apiService.deleteAllIslands();
    await apiService.deleteAllUsers();
    apiService.clearAuth();
  });

  test('POST /regions/{id}/islands | valid island, valid region id -> 201 Created', async function() {
    const responseUser = await apiService.createUser(newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getRegions();
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const response = await apiService.createIsland(newIslandRequest, regionId);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 201);
    assert.isDefined(payload._id);
    assert.isDefined(payload.region);
    assert.equal(payload.region, regionId);
  });

  test('POST /regions/{id}/islands | valid island, invalid region id -> 404 Not found', async function() {
    const responseUser = await apiService.createUser(newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const response = await apiService.createIsland(newIslandRequest, '012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('POST /regions/{id}/islands | valid island, invalid region id -> 400 Bad Request', async function() {
    const responseUser = await apiService.createUser(newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const response = await apiService.createIsland(newIslandRequest, '1234');
    assert.equal(response.statusCode, 400);
  });

  test('POST /regions/{id}/islands | invalid island, valid region id -> 400 Bad Request', async function() {
    await apiService.createUser(newUser);
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland);
    const responseRegions = await apiService.getRegions();
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const response = await apiService.createIsland(newIslandRequest, regionId);
    assert.equal(response.statusCode, 400);
  });

  test('GET /islands | all islands -> 200 OK', async function() {
    const responseUser = await apiService.createUser(newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getRegions();
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    await apiService.createIsland(newIslandRequest, regionId);
    const response = await apiService.getIslands();
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payload.length, 1);
  });

  test('GET /regions/{id}/islands | valid region id -> 200 OK', async function() {
    const responseUser = await apiService.createUser(newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getRegions();
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    await apiService.createIsland(newIslandRequest, regionId);
    const response = await apiService.getIslandsByRegion(regionId);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payload.length, 1);
  });

  test('GET /regions/{id}/islands | invalid region id -> 400 Bad Request', async function() {
    await apiService.createUser(newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getIslandsByRegion('1234');
    assert.equal(response.statusCode, 400);
  });

  test('GET /regions/{id}/islands | invalid region id -> 404 Not Found', async function() {
    await apiService.createUser(newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getIslandsByRegion('012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('PUT /regions/{id}/islands/{id} | valid island, valid region id, valid island id -> 200 OK', async function() {
    const responseUser = await apiService.createUser(newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getRegions();
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const responseCreate = await apiService.createIsland(newIslandRequest, regionId);
    const payloadCreate = JSON.parse(responseCreate.payload);
    const islandId = payloadCreate._id;
    const response = await apiService.updateIsland(newIslandRequest, regionId, islandId);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payloadCreate._id, payload._id);
  });

  test('PUT /regions/{id}/islands/{id} | invalid island, valid region id, valid island id -> 400 Bad Request', async function() {
    const responseUser = await apiService.createUser(newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getRegions();
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const responseCreate = await apiService.createIsland(newIslandRequest, regionId);
    const payloadCreate = JSON.parse(responseCreate.payload);
    const islandId = payloadCreate._id;
    const response = await apiService.updateIsland({}, regionId, islandId);
    assert.equal(response.statusCode, 400);
  });

  test('PUT /regions/{id}/islands/{id} | valid island, invalid region id, valid island id -> 404 Not found', async function() {
    const responseUser = await apiService.createUser(newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const response = await apiService.updateIsland(newIslandRequest, '012345678901234567890123', '012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('PUT /regions/{id}/islands/{id} | valid island, valid region id, invalid island id -> 404 Not found', async function() {
    const responseUser = await apiService.createUser(newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getRegions();
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const response = await apiService.updateIsland(newIslandRequest, regionId, '012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('PUT /regions/{id}/islands/{id} | valid island, valid region id, invalid island id -> 400 Bad Request', async function() {
    const responseUser = await apiService.createUser(newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getRegions();
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const response = await apiService.updateIsland(newIslandRequest, regionId, '1234');
    assert.equal(response.statusCode, 400);
  });

  test('DELETE /islands | all islands -> 200 OK', async function() {
    await apiService.createUser(authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteAllIslands();
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(payload, { success: true });
  });

  test('DELETE /islands | all islands -> 403 Forbidden', async function() {
    await apiService.createUser(newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.deleteAllIslands();
    assert.equal(response.statusCode, 403);
  });

  test('DELETE /regions/{id}/islands | valid region id -> 200 OK', async function() {
    await apiService.createUser(authUser);
    await apiService.authenticate(authUser);
    const responseRegions = await apiService.getRegions();
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const response = await apiService.deleteIslandsByRegion(regionId);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(payload, { success: true });
  });

  test('DELETE /regions/{id}/islands | invalid region id -> 400 Bad Request', async function() {
    await apiService.createUser(authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteIslandsByRegion('1234');
    assert.equal(response.statusCode, 400);
  });

  test('DELETE /regions/{id}/islands | invalid region id -> 404 Not Found', async function() {
    await apiService.createUser(authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteIslandsByRegion('012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('DELETE /regions/{id}/islands | valid region id -> 403 Forbidden', async function() {
    await apiService.createUser(newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.deleteIslandsByRegion('012345678901234567890123');
    assert.equal(response.statusCode, 403);
  });
});
