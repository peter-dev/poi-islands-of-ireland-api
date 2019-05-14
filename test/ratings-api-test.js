'use strict';
const suite = require('mocha').suite;
const assert = require('chai').assert;
const ApiService = require('./api-service');
const fixtures = require('./fixtures.json');
const { init } = require('../server');

suite('Ratings API endpoints', function() {
  let newRating = fixtures.newRating;
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
    await apiService.deleteAllResources(apiService.ratingsEndpoint);
    await apiService.deleteAllResources(apiService.usersEndpoint);
    apiService.clearAuth();
  });

  teardown(async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    await apiService.deleteAllResources(apiService.ratingsEndpoint);
    await apiService.deleteAllResources(apiService.usersEndpoint);
    apiService.clearAuth();
  });

  test('POST /ratings | valid rating -> 201 Created', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const responseIsland = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const payloadIsland = JSON.parse(responseIsland.payload);
    const islandId = payloadIsland._id;
    const newRatingRequest = Object.assign({}, newRating, {island: islandId, user: userId});
    const response = await apiService.createResource(apiService.ratingsEndpoint, newRatingRequest);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 201);
    assert.isDefined(payload._id);
    assert.deepOwnInclude(payload, newRatingRequest);
  });

  test('POST /ratings | duplicate rating -> 400 Bad Request', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const responseIsland = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const payloadIsland = JSON.parse(responseIsland.payload);
    const islandId = payloadIsland._id;
    const newRatingRequest = Object.assign({}, newRating, {island: islandId, user: userId});
    await apiService.createResource(apiService.ratingsEndpoint, newRatingRequest);
    const response = await apiService.createResource(apiService.ratingsEndpoint, newRatingRequest);
    assert.equal(response.statusCode, 400);
  });

  test('POST /ratings | invalid rating -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const newRatingRequest = Object.assign({}, newRating);
    const response = await apiService.createResource(apiService.ratingsEndpoint, newRatingRequest);
    assert.equal(response.statusCode, 400);
  });

  test('POST /ratings | valid rating (unknown user id) -> 404 Not Found', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const newRatingRequest = Object.assign({}, newRating, {island: '012345678901234567890123', user: '012345678901234567890123'});
    const response = await apiService.createResource(apiService.ratingsEndpoint, newRatingRequest);
    assert.equal(response.statusCode, 404);
  });

  test('POST /ratings | valid rating (unknown island id) -> 404 Not Found', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newRatingRequest = Object.assign({}, newRating, {island: '012345678901234567890123', user: userId});
    const response = await apiService.createResource(apiService.ratingsEndpoint, newRatingRequest);
    assert.equal(response.statusCode, 404);
  });

  test('GET /ratings/{id} | valid id -> 200 OK', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const responseIsland = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const payloadIsland = JSON.parse(responseIsland.payload);
    const islandId = payloadIsland._id;
    const newRatingRequest = Object.assign({}, newRating, {island: islandId, user: userId});
    const responseCreate = await apiService.createResource(apiService.ratingsEndpoint, newRatingRequest);
    const payloadCreate = JSON.parse(responseCreate.payload);
    const response = await apiService.getResource(apiService.ratingsEndpoint, payloadCreate._id);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepOwnInclude(payloadCreate, payload);
  });

  test('GET /ratings/{id} | invalid id -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getResource(apiService.ratingsEndpoint, '1234');
    assert.equal(response.statusCode, 400);
  });

  test('GET /ratings/{id} | valid id -> 404 Not Found', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getResource(apiService.ratingsEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('GET /islands/{id}/ratings | valid island id -> 200 OK', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const responseIsland = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const payloadIsland = JSON.parse(responseIsland.payload);
    const islandId = payloadIsland._id;
    const newRatingRequest = Object.assign({}, newRating, {island: islandId, user: userId});
    await apiService.createResource(apiService.ratingsEndpoint, newRatingRequest);
    const response = await apiService.getAllResourcesForParent(apiService.islandsAndRatingsEndpoint, islandId);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payload.length, 1);
  });

  test('GET /islands/{id}/ratings | invalid island id -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getAllResourcesForParent(apiService.islandsAndRatingsEndpoint, '1234');
    assert.equal(response.statusCode, 400);
  });

  test('GET /islands/{id}/ratings | valid island id -> 404 Not Found', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getAllResourcesForParent(apiService.islandsAndRatingsEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('GET /users/{id}/ratings | valid users id -> 200 OK', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const responseIsland = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const payloadIsland = JSON.parse(responseIsland.payload);
    const islandId = payloadIsland._id;
    const newRatingRequest = Object.assign({}, newRating, {island: islandId, user: userId});
    await apiService.createResource(apiService.ratingsEndpoint, newRatingRequest);
    const response = await apiService.getAllResourcesForParent(apiService.usersAndRatingsEndpoint, userId);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payload.length, 1);
  });

  test('GET /users/{id}/ratings | invalid users id -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getAllResourcesForParent(apiService.usersAndRatingsEndpoint, '1234');
    assert.equal(response.statusCode, 400);
  });

  test('GET /users/{id}/ratings | valid users id -> 404 Not Found', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.getAllResourcesForParent(apiService.usersAndRatingsEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('PUT /ratings/{id} | valid rating -> 200 OK', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const responseIsland = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const payloadIsland = JSON.parse(responseIsland.payload);
    const islandId = payloadIsland._id;
    const newRatingRequest = Object.assign({}, newRating, {island: islandId, user: userId});
    const responseCreate = await apiService.createResource(apiService.ratingsEndpoint, newRatingRequest);
    const payloadCreate = JSON.parse(responseCreate.payload);
    const response = await apiService.updateResource(apiService.ratingsEndpoint, payloadCreate._id, newRatingRequest);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.equal(payloadCreate._id, payload._id);
  });

  test('PUT /ratings/{id} | invalid rating -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.updateResource(apiService.ratingsEndpoint, '012345678901234567890123', {});
    assert.equal(response.statusCode, 400);
  });

  test('PUT /ratings/{id} | invalid rating id -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const newRatingRequest = Object.assign({}, newRating, {island: '012345678901234567890123', user: '012345678901234567890123'});
    const response = await apiService.updateResource(apiService.ratingsEndpoint, '1234', newRatingRequest);
    assert.equal(response.statusCode, 400);
  });

  test('PUT /ratings/{id} | valid rating id -> 404 Not Found', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const newRatingRequest = Object.assign({}, newRating, {island: '012345678901234567890123', user: '012345678901234567890123'});
    const response = await apiService.updateResource(apiService.ratingsEndpoint, '012345678901234567890123', newRatingRequest);
    assert.equal(response.statusCode, 404);
  });

  test('PUT /ratings/{id} | valid rating (unknown user id) -> 404 Not Found', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const responseIsland = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const payloadIsland = JSON.parse(responseIsland.payload);
    const islandId = payloadIsland._id;
    const newRatingRequest = Object.assign({}, newRating, {island: islandId, user: userId});
    const responseCreate = await apiService.createResource(apiService.ratingsEndpoint, newRatingRequest);
    const payloadCreate = JSON.parse(responseCreate.payload);
    const modifiedRatingRequest = Object.assign({}, newRating, {island: islandId, user: '012345678901234567890123'});
    const response = await apiService.updateResource(apiService.ratingsEndpoint, payloadCreate._id, modifiedRatingRequest);
    assert.equal(response.statusCode, 404);
  });

  test('PUT /ratings/{id} | valid rating (unknown island id) -> 404 Not Found', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, newUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(newUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const responseIsland = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const payloadIsland = JSON.parse(responseIsland.payload);
    const islandId = payloadIsland._id;
    const newRatingRequest = Object.assign({}, newRating, {island: islandId, user: userId});
    const responseCreate = await apiService.createResource(apiService.ratingsEndpoint, newRatingRequest);
    const payloadCreate = JSON.parse(responseCreate.payload);
    const modifiedRatingRequest = Object.assign({}, newRating, {island: '012345678901234567890123', user: userId});
    const response = await apiService.updateResource(apiService.ratingsEndpoint, payloadCreate._id, modifiedRatingRequest);
    assert.equal(response.statusCode, 404);
  });

  test('DELETE /ratings | all ratings -> 200 OK', async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteAllResources(apiService.ratingsEndpoint);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(payload, { success: true });
  });

  test('DELETE /ratings | all ratings -> 403 Forbidden', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.deleteAllResources(apiService.ratingsEndpoint);
    assert.equal(response.statusCode, 403);
  });

  test('DELETE /ratings/{id} | valid id -> 200 OK', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, authUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(authUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const responseIsland = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const payloadIsland = JSON.parse(responseIsland.payload);
    const islandId = payloadIsland._id;
    const newRatingRequest = Object.assign({}, newRating, {island: islandId, user: userId});
    const responseCreate = await apiService.createResource(apiService.ratingsEndpoint, newRatingRequest);
    const payloadCreate = JSON.parse(responseCreate.payload);
    const response = await apiService.deleteOneResource(apiService.ratingsEndpoint, payloadCreate._id);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(payload, { success: true });
  });

  test('DELETE /ratings/{id} | invalid id -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteOneResource(apiService.usersEndpoint, '1234');
    assert.equal(response.statusCode, 400);
  });

  test('DELETE /ratings/{id} | valid id -> 404 Not Found', async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteOneResource(apiService.usersEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('DELETE /ratings/{id} | valid id -> 403 Forbidden', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.deleteOneResource(apiService.usersEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 403);
  });

  test('DELETE /islands/{id}/ratings | valid island id -> 200 OK', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, authUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(authUser);
    const newIslandRequest = Object.assign({}, newIsland, {createdBy: userId});
    const responseRegions = await apiService.getAllResources(apiService.regionsEndpoint);
    const payloadRegions = JSON.parse(responseRegions.payload);
    const regionId = payloadRegions[0]._id;
    const responseIsland = await apiService.createResourceForParent(apiService.regionsAndIslandsEndpoint, regionId, newIslandRequest);
    const payloadIsland = JSON.parse(responseIsland.payload);
    const islandId = payloadIsland._id;
    const response = await apiService.deleteAllResourcesForParent(apiService.islandsAndRatingsEndpoint, islandId);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(payload, { success: true });
  });

  test('DELETE /islands/{id}/ratings | invalid island id -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteAllResourcesForParent(apiService.islandsAndRatingsEndpoint, '1234');
    assert.equal(response.statusCode, 400);
  });

  test('DELETE /islands/{id}/ratings | valid island id -> 404 Not Found', async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteAllResourcesForParent(apiService.islandsAndRatingsEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('DELETE /islands/{id}/ratings | valid island id -> 403 Forbidden', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.deleteAllResourcesForParent(apiService.islandsAndRatingsEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 403);
  });

  test('DELETE /users/{id}/ratings | valid user id -> 200 OK', async function() {
    const responseUser = await apiService.createResource(apiService.usersEndpoint, authUser);
    const payloadUser = JSON.parse(responseUser.payload);
    const userId = payloadUser._id;
    await apiService.authenticate(authUser);
    const response = await apiService.deleteAllResourcesForParent(apiService.usersAndRatingsEndpoint, userId);
    const payload = JSON.parse(response.payload);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(payload, { success: true });
  });

  test('DELETE /users/{id}/ratings | invalid user id -> 400 Bad Request', async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteAllResourcesForParent(apiService.usersAndRatingsEndpoint, '1234');
    assert.equal(response.statusCode, 400);
  });

  test('DELETE /users/{id}/ratings | valid user id -> 404 Not Found', async function() {
    await apiService.createResource(apiService.usersEndpoint, authUser);
    await apiService.authenticate(authUser);
    const response = await apiService.deleteAllResourcesForParent(apiService.usersAndRatingsEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 404);
  });

  test('DELETE /users/{id}/ratings | valid user id -> 403 Forbidden', async function() {
    await apiService.createResource(apiService.usersEndpoint, newUser);
    await apiService.authenticate(newUser);
    const response = await apiService.deleteAllResourcesForParent(apiService.usersAndRatingsEndpoint, '012345678901234567890123');
    assert.equal(response.statusCode, 403);
  });
});
