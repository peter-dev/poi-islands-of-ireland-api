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
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    await apiService.deleteAllResources(apiService.islandsEndpoint);
    await apiService.deleteAllResources(apiService.usersEndpoint);
    apiService.clearAuth();
  });

  teardown(async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    await apiService.deleteAllResources(apiService.islandsEndpoint);
    await apiService.deleteAllResources(apiService.usersEndpoint);
    apiService.clearAuth();
  });

  test('POST /regions/{id}/islands | valid island, valid region id -> 201 Created', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const response = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 201);
    assert.isDefined(payload._id);
    assert.isDefined(payload.region);
    assert.equal(payload.region, regionId);
  });

  test('POST /regions/{id}/islands | valid island, valid region id -> 404 Not found', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const response = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, '012345678901234567890123', newIslandRequest);
    assert.equal(response.statusCode, 404);
  });

  test('POST /regions/{id}/islands | valid island, invalid region id -> 400 Bad Request', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const response = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, '1234', newIslandRequest);
    assert.equal(response.statusCode, 400);
  });

  test('POST /regions/{id}/islands | invalid island, valid region id -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland);
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const response = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    assert.equal(response.statusCode, 400);
  });

  test('GET /islands | all islands -> 200 OK', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const response = await apiService.getAllResources(apiService.islandsEndpoint);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payload.length, 1);
  });

  test('GET /islands/{id} | valid id -> 200 OK', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const responseCreate = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const payloadCreate = JSON.parse(responseCreate.payload);
    const response = await apiService.getResource(apiService.islandsEndpoint, payloadCreate._id);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepOwnInclude(payloadCreate, payload);
  });

  test('GET /islands/{id} | invalid id -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getResource(apiService.islandsEndpoint, '1234');
    assert.equal(response.statusCode, 400);
  });

  test('GET /islands/{id} | valid id -> 404 Not Found', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getResource(apiService.islandsEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('GET /regions/{id}/islands | valid region id -> 200 OK', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const response = await apiService.getAllResourcesForParent(apiService.regionsAndIslandsEndpoint, regionId);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payload.length, 1);
  });

  test('GET /regions/{id}/islands | invalid region id -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getAllResourcesForParent(apiService.regionsAndIslandsEndpoint, '1234');
    assert.equal(response.statusCode, 400);
  });

  test('GET /regions/{id}/islands | valid region id -> 404 Not Found', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getAllResourcesForParent(apiService.regionsAndIslandsEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('PUT /regions/{id}/islands/{id} | valid island, valid region id, valid island id -> 200 OK', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const responseCreate = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const payloadCreate = JSON.parse(responseCreate.payload);
    const islandId = payloadCreate._id;
    const response = await apiService.updateResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, islandId, newIslandRequest);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payloadCreate._id, payload._id);
  });

  test('PUT /regions/{id}/islands/{id} | invalid island, valid region id, valid island id -> 400 Bad Request', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const responseCreate = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const payloadCreate = JSON.parse(responseCreate.payload);
    const islandId = payloadCreate._id;
    const response = await apiService.updateResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, islandId, {});
    assert.equal(response.statusCode, 400);
  });

  test('PUT /regions/{id}/islands/{id} | valid island, valid region id, valid island id -> 404 Not found', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const response = await apiService.updateResourceForParent(apiService.regionsAndIslandsEndpoint, '012345678901234567890123', '012345678901234567890123', newIslandRequest);
    assert.equal(response.statusCode, 404);
  });

  test('PUT /regions/{id}/islands/{id} | valid island, valid region id, valid island id -> 404 Not found', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const response = await apiService.updateResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, '012345678901234567890123', newIslandRequest);
    assert.equal(response.statusCode, 404);
  });

  test('PUT /regions/{id}/islands/{id} | valid island, valid region id, invalid island id -> 400 Bad Request', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const response = await apiService.updateResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, '1234', newIslandRequest);
    assert.equal(response.statusCode, 400);
  });

  test('DELETE /islands | all islands -> 200 OK', async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteAllResources(apiService.islandsEndpoint);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(payload, { success: true });
  });

  test('DELETE /islands | all islands -> 403 Forbidden', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.deleteAllResources(apiService.islandsEndpoint);
    assert.equal(response.statusCode, 403);
  });

  test('DELETE /regions/{id}/islands | valid region id -> 200 OK', async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const response = await apiService.deleteAllResourcesForParent(apiService.regionsAndIslandsEndpoint, regionId);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(payload, { success: true });
  });

  test('DELETE /regions/{id}/islands | invalid region id -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteAllResourcesForParent(apiService.regionsAndIslandsEndpoint, '1234');
    assert.equal(response.statusCode, 400);
  });

  test('DELETE /regions/{id}/islands | valid region id -> 404 Not Found', async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteAllResourcesForParent(apiService.regionsAndIslandsEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('DELETE /regions/{id}/islands | valid region id -> 403 Forbidden', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.deleteAllResourcesForParent(apiService.regionsAndIslandsEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 403);
  });
});
