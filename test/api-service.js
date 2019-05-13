'use strict';
// define service class
class ApiService {
  constructor(server) {
    this.server = server;
    this.usersEndpoint = '/api/users';
    this.regionsEndpoint = '/api/regions';
    this.islandsEndpoint = '/api/islands';
    this.regionsAndIslandsEndpoint = '/api/regions/{regionId}/islands';
    this.headers = {
      Authorization: ''
    };
  }

  setAuth(token) {
    this.headers.Authorization = 'Bearer ' + token;
  }

  clearAuth() {
    this.headers.Authorization = '';
  }

  async authenticate(user) {
    const postRequest = {
      method: 'post',
      url: this.usersEndpoint + '/authenticate',
      payload: user,
      headers: this.headers
    };
    const response = await this.server.inject(postRequest);
    // retrieve token from payload
    const payload = JSON.parse(response.payload);
    this.setAuth(payload.token);
    // return original response
    return response;
  }

  async createUser(user) {
    const postRequest = {
      method: 'post',
      url: this.usersEndpoint,
      payload: user,
      headers: this.headers
    };
    return await this.server.inject(postRequest);
  }

  async getUsers() {
    const getRequest = {
      method: 'get',
      url: this.usersEndpoint,
      headers: this.headers
    };
    return await this.server.inject(getRequest);
  }

  async getUser(id) {
    const getRequest = {
      method: 'get',
      url: this.usersEndpoint + '/' + id,
      headers: this.headers
    };
    return await this.server.inject(getRequest);
  }

  async updateUser(id, user) {
    const putRequest = {
      method: 'put',
      url: this.usersEndpoint + '/' + id,
      payload: user,
      headers: this.headers
    };
    return await this.server.inject(putRequest);
  }

  async deleteAllUsers() {
    const deleteRequest = {
      method: 'delete',
      url: this.usersEndpoint,
      headers: this.headers
    };
    return await this.server.inject(deleteRequest);
  }

  async deleteOneUser(id) {
    const deleteRequest = {
      method: 'delete',
      url: this.usersEndpoint + '/' + id,
      headers: this.headers
    };
    return await this.server.inject(deleteRequest);
  }

  async getRegions() {
    const getRequest = {
      method: 'get',
      url: this.regionsEndpoint,
      headers: this.headers
    };
    return await this.server.inject(getRequest);
  }

  async getRegion(id) {
    const getRequest = {
      method: 'get',
      url: this.regionsEndpoint + '/' + id,
      headers: this.headers
    };
    return await this.server.inject(getRequest);
  }

  async createIsland(island, regionId) {
    const postRequest = {
      method: 'post',
      url: this.regionsAndIslandsEndpoint.replace("{regionId}", regionId),
      payload: island,
      headers: this.headers
    };
    return await this.server.inject(postRequest);
  }

  async getIslands() {
    const getRequest = {
      method: 'get',
      url: this.islandsEndpoint,
      headers: this.headers
    };
    return await this.server.inject(getRequest);
  }

  async getIslandsByRegion(regionId) {
    const getRequest = {
      method: 'get',
      url: this.regionsAndIslandsEndpoint.replace("{regionId}", regionId),
      headers: this.headers
    };
    return await this.server.inject(getRequest);
  }

  async updateIsland(island, regionId, islandId) {
    const putRequest = {
      method: 'put',
      url: this.regionsAndIslandsEndpoint.replace("{regionId}", regionId) + "/" + islandId,
      payload: island,
      headers: this.headers
    };
    return await this.server.inject(putRequest);
  }

  async deleteAllIslands() {
    const deleteRequest = {
      method: 'delete',
      url: this.islandsEndpoint,
      headers: this.headers
    };
    return await this.server.inject(deleteRequest);
  }

  async deleteIslandsByRegion(regionId) {
    const getRequest = {
      method: 'delete',
      url: this.regionsAndIslandsEndpoint.replace("{regionId}", regionId),
      headers: this.headers
    };
    return await this.server.inject(getRequest);
  }
}

module.exports = ApiService;