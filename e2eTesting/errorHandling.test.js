const chai = require('chai');
const chaiHttp = require('chai-http');
const nock = require('nock');
const { expect } = chai;
chai.use(chaiHttp);

const app = require('../app'); // Assuming you have an Express app in app.js

describe('Error Handling', () => {
  describe('Input Errors', () => {
    it('should handle missing required fields', done => {
      chai.request(app)
        .post('/api/resources')
        .send({ description: 'Missing name field' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error').eql('Name is required');
          done();
        });
    });

    it('should handle invalid data types', done => {
      chai.request(app)
        .post('/api/resources')
        .send({ name: 'Valid Name', description: 12345 }) // description should be a string
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error').eql('Description must be a string');
          done();
        });
    });
  });

  describe('System Errors', () => {
    it('should handle database downtime', done => {
      // TODO: Update the mocked endpoint to match the actual API or database service URL
      nock('http://localhost:5000')
        .get('/api/resources')
        .reply(500, { error: 'Database is down' });

      chai.request(app)
        .get('/api/resources')
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property('error').eql('Database is down');
          done();
        });
    });

    it('should handle network issues', done => {
      // TODO: Update the mocked endpoint to match the actual API or network service URL
      nock('http://localhost:5000')
        .get('/api/resources')
        .replyWithError('Network error');

      chai.request(app)
        .get('/api/resources')
        .end((err, res) => {
          expect(res).to.have.status(502);
          expect(res.body).to.have.property('error').eql('Network error');
          done();
        });
    });
  });
});

/*
Explanation of the Tests

Input Errors:
   - Missing Fields: Tests that the application correctly handles the absence of required fields, expecting a 400 status and an appropriate error message.
   - Invalid Data Types: Tests that the application correctly handles invalid data types, expecting a 400 status and an appropriate error message.

System Errors:
   - Database Downtime: Simulates a database outage and tests that the application handles this situation correctly, expecting a 500 status and an appropriate error message.
   - Network Issues: Simulates a network issue and tests that the application handles this situation correctly, expecting a 502 status and an appropriate error message.
 */
