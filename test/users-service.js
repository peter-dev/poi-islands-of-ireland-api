'use strict';
const axios = require('axios');

class UsersService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async createUser(newUser) {
    try {
      return await axios.post(this.baseUrl + '/api/users', newUser);
    } catch (e) {
      return e.response;
    }
  }

  async getUsers() {
    try {
      return await axios.get(this.baseUrl + '/api/users');
    } catch (e) {
      return e.response;
    }
  }

  async getUser(id) {
    try {
      return await axios.get(this.baseUrl + '/api/users/' + id);
    } catch (e) {
      return e.response;
    }
  }

  async updateUser(id, updatedUser) {
    try {
      return await axios.put(this.baseUrl + '/api/users/' + id, updatedUser);
    } catch (e) {
      return e.response;
    }
  }

  async deleteAllUsers() {
    try {
      return await axios.delete(this.baseUrl + '/api/users');
    } catch (e) {
      return e.response;
    }
  }

  async deleteOneUser(id) {
    try {
      return await axios.delete(this.baseUrl + '/api/users/' + id);
    } catch (e) {
      return e.response;
    }
  }
}

module.exports = UsersService;
