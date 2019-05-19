# HDip in Computer Science - WIT, Enterprise Web Development - Assignment (part 1)

## A point of interest service api using Node and Hapi framework

### Installation:

- Download [node](https://nodejs.org/en/download/) for your operating system
- Create `.env` file in root project directory and add the following properties
```
db = <mongo db connection>
jwt_secret = <secret key for json web token>
```
- Execute `npm install` to install the dependencies
```
"dependencies": {
    "@hapi/boom": "^7.4.2",
    "@hapi/hapi": "^18.3.1",
    "@hapi/inert": "^5.2.0",
    "@hapi/joi": "^15.0.2",
    "@hapi/vision": "^5.5.2",
    "bcrypt": "^3.0.6",
    "dotenv": "^7.0.0",
    "hapi": "^18.1.0",
    "hapi-auth-jwt2": "^8.4.0",
    "hapi-swagger": "^9.4.2",
    "jsonwebtoken": "^8.5.1",
    "lodash": "^4.17.11",
    "mais-mongoose-seeder": "^1.0.7",
    "mongoose": "^5.4.20"
  },
  "devDependencies": {
    "chai": "^4.2.0",
    "mocha": "^6.1.4",
    "nyc": "^14.1.1",
    "prettier": "^1.16.4"
  }
```
- Execute `node index` to start the app

### Tests:

- Execute `npm run test` to run all tests
- Execute `npm run cover` to run all tests and generate test coverage report

### Comments:

- I enabled [automatic auditing](https://mongoosejs.com/docs/guide.html#timestamps) for db transactions 
  - the schema has two additional entries assigned automatically: createdAt and updatedAt
  - the fields are automatically updated on insert / update transactions
  