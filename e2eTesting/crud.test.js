// TODO: Adapt the endpoint URLs and payloads to match the Edamam API structure.
// TODO: Ensure the application routes and the data structures align with the requirements of Edamam API.
// TODO: Adapt the endpoints and the test data to fit your site's specific API and data structure requirements.

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
chai.use(chaiHttp);

const app = require('../app'); // Assuming you have an Express app in app.js

describe('CRUD Operations', () => {
  let resourceId;

  describe('Create Operation', () => {
    it('should create a new resource', done => {
      chai.request(app)
        .post('/api/resources') // TODO: Update this endpoint to match your site's API for creating a resource
        .send({
          name: 'New Resource', // TODO: Adapt the payload to match the Edamam API structure if needed
          description: 'This is a new resource'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('name').eql('New Resource');
          expect(res.body).to.have.property('description').eql('This is a new resource');
          resourceId = res.body.id; // Save the resource ID for subsequent tests
          done();
        });
    });
  });

  describe('Read Operation', () => {
    it('should read a resource by ID', done => {
      chai.request(app)
        .get(`/api/resources/${resourceId}`) // TODO: Update this endpoint to match your site's API for reading a resource by ID
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('id').eql(resourceId);
          expect(res.body).to.have.property('name').eql('New Resource');
          expect(res.body).to.have.property('description').eql('This is a new resource');
          done();
        });
    });

    it('should read all resources', done => {
      chai.request(app)
        .get('/api/resources') // TODO: Update this endpoint to match your site's API for reading all resources
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf.at.least(1);
          done();
        });
    });
  });

  describe('Update Operation', () => {
    it('should update a resource by ID', done => {
      chai.request(app)
        .put(`/api/resources/${resourceId}`) // TODO: Update this endpoint to match your site's API for updating a resource by ID
        .send({
          name: 'Updated Resource', // TODO: Adapt the payload to match the Edamam API structure if needed
          description: 'This is an updated resource'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('id').eql(resourceId);
          expect(res.body).to.have.property('name').eql('Updated Resource');
          expect(res.body).to.have.property('description').eql('This is an updated resource');
          done();
        });
    });
  });

  describe('Delete Operation', () => {
    it('should delete a resource by ID', done => {
      chai.request(app)
        .delete(`/api/resources/${resourceId}`) // TODO: Update this endpoint to match your site's API for deleting a resource by ID
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message').eql('Resource deleted successfully');
          done();
        });
    });

    it('should return 404 for a non-existent resource', done => {
      chai.request(app)
        .get(`/api/resources/${resourceId}`) // TODO: Update this endpoint to match your site's API for reading a resource by ID
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('message').eql('Resource not found');
          done();
        });
    });
  });
});

/* 
Explanation of the Tests

Create Operation:
   - Test creating a new resource, expecting a 201 status and properties like `id`, `name`, and `description` in the response. Save the resource ID for subsequent tests.

Read Operation:
   - Test reading the created resource by its ID, expecting a 200 status and the correct properties.
   - Test reading all resources, expecting a 200 status and an array with at least one resource.

Update Operation:
   - Test updating the resource by its ID, expecting a 200 status and the updated properties.

Delete Operation:
   - Test deleting the resource by its ID, expecting a 200 status and a success message.
   - Test accessing the deleted resource, expecting a 404 status and a not found message.

*/