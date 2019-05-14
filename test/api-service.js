'use strict';
// define service class
class ApiService {
  constructor(server) {
    this.server = server;
    this.usersEndpoint = '/api/users';
    this.regionsEndpoint = '/api/regions';
    this.islandsEndpoint = '/api/islands';
    this.regionsAndIslandsEndpoint = '/api/regions/{parentId}/islands';
    this.ratingsEndpoint = '/api/ratings';
    this.islandsAndRatingsEndpoint = '/api/islands/{parentId}/ratings';
    this.usersAndRatingsEndpoint = '/api/users/{parentId}/ratings';
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

  /**
   * Helper method for making post request to the api
   * @param url the endpoint of the api
   * @param resource the resource to be created
   * @returns {Promise<*|*>} api response
   */
  async createResource(url, resource) {
    const postRequest = {
      method: 'post',
      url: url,
      payload: resource,
      headers: this.headers
    };
    return await this.server.inject(postRequest);
  }

  /**
   * Helper method for making post request to the api
   * @param url the endpoint of the api
   * @param parentId the unique identifier of the parent resource
   * @param resource the resource to be created
   * @returns {Promise<*|*>} api response
   */
  async createResourceForParent(url, parentId, resource) {
    const postRequest = {
      method: 'post',
      url: url.replace('{parentId}', parentId),
      payload: resource,
      headers: this.headers
    };
    return await this.server.inject(postRequest);
  }

  /**
   * Helper method for making get request to the api
   * @param url the endpoint of the api
   * @returns {Promise<*|*>} api response
   */
  async getAllResources(url) {
    const getRequest = {
      method: 'get',
      url: url,
      headers: this.headers
    };
    return await this.server.inject(getRequest);
  }

  /**
   * Helper method for making get request to the api
   * @param url the endpoint of the api
   * @param parentId the unique identifier of the parent resource
   * @returns {Promise<*|*>}
   */
  async getAllResourcesForParent(url, parentId) {
    const getRequest = {
      method: 'get',
      url: url.replace('{parentId}', parentId),
      headers: this.headers
    };
    return await this.server.inject(getRequest);
  }

  /**
   * Helper method for making get request to the api
   * @param url the endpoint of the api
   * @param id the unique identifier of the resource
   * @returns {Promise<*|*>} api response
   */
  async getResource(url, id) {
    const getRequest = {
      method: 'get',
      url: url + '/' + id,
      headers: this.headers
    };
    return await this.server.inject(getRequest);
  }

  /**
   * Helper method for making put request to the api
   * @param url the endpoint of the api
   * @param id the unique identifier of the resource
   * @param resource the resource to be updated
   * @returns {Promise<*|*>}
   */
  async updateResource(url, id, resource) {
    const putRequest = {
      method: 'put',
      url: url + '/' + id,
      payload: resource,
      headers: this.headers
    };
    return await this.server.inject(putRequest);
  }

  /**
   * Helper method for making put request to the api
   * @param url the endpoint of the api
   * @param parentId the unique identifier of the parent resource
   * @param id the unique identifier of the resource
   * @param resource the resource to be updated
   * @returns {Promise<*|*>}
   */
  async updateResourceForParent(url, parentId, id, resource) {
    const putRequest = {
      method: 'put',
      url: url.replace('{parentId}', parentId) + '/' + id,
      payload: resource,
      headers: this.headers
    };
    return await this.server.inject(putRequest);
  }

  /**
   * Helper method for making delete request to the api
   * @param url the endpoint of the api
   * @returns {Promise<*|*>} api response
   */
  async deleteAllResources(url) {
    const deleteRequest = {
      method: 'delete',
      url: url,
      headers: this.headers
    };
    return await this.server.inject(deleteRequest);
  }

  /**
   * Helper method for making delete request to the api
   * @param url the endpoint of the api
   * @param parentId the unique identifier of the parent resource
   * @returns {Promise<*|*>}
   */
  async deleteAllResourcesForParent(url, parentId) {
    const deleteRequest = {
      method: 'delete',
      url: url.replace('{parentId}', parentId),
      headers: this.headers
    };
    return await this.server.inject(deleteRequest);
  }

  /**
   * Helper method for making delete request to the api
   * @param url the endpoint of the api
   * @param id the unique identifier of the resource
   * @returns {Promise<*|*>} api response
   */
  async deleteOneResource(url, id) {
    const deleteRequest = {
      method: 'delete',
      url: url + '/' + id,
      headers: this.headers
    };
    return await this.server.inject(deleteRequest);
  }
}

module.exports = ApiService;
