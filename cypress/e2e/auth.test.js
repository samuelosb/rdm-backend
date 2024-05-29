// TODO: Update the endpoint URLs to match your application's actual routes.
// TODO: Ensure the payload structure aligns with your application's requirements.
// TODO: If using the Edamam API, update the tests to reflect the authentication and data requirements of that API.

const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
chai.use(chaiHttp);

const app = require('../app'); // Assuming you have an Express app in app.js
let jwtToken;

describe('Authentication and Authorization', () => {
  describe('User Registration', () => {
    it('should register a new user with valid details', done => {
      chai.request(app)
        .post('/api/register') // TODO: Update this endpoint to match your site's registration endpoint
        .send({
          username: 'admin', // TODO: Ensure this matches the expected registration payload for your site
          email: 'recetasdelmundo@gmail.com',
          password: 'password123'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message').eql('User registered successfully');
          done();
        });
    });

    it('should not register a user with an existing email', done => {
      chai.request(app)
        .post('/api/register') // TODO: Update this endpoint to match your site's registration endpoint
        .send({
          username: 'admin',
          email: 'recetasdelmundo@gmail.com', // Same email as before
          password: 'password123'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('message').eql('Email already in use');
          done();
        });
    });
  });

  describe('User Login', () => {
    it('should login with valid credentials', done => {
      chai.request(app)
        .post('/api/login') // TODO: Update this endpoint to match your site's login endpoint
        .send({
          email: 'recetasdelmundo@gmail.com',
          password: 'password123'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          jwtToken = res.body.token; // Save the token for subsequent tests
          done();
        });
    });

    it('should not login with invalid credentials', done => {
      chai.request(app)
        .post('/api/login') // TODO: Update this endpoint to match your site's login endpoint
        .send({
          email: 'recetasdelmundo@gmail.com',
          password: 'WrongPassword'
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('message').eql('Invalid credentials');
          done();
        });
    });
  });

  describe('Access Token Validation', () => {
    it('should access protected route with valid token', done => {
      chai.request(app)
        .get('/api/protected') // TODO: Update this endpoint to match your site's protected route
        .set('Authorization', `Bearer ${jwtToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message').eql('Access granted');
          done();
        });
    });

    it('should not access protected route without token', done => {
      chai.request(app)
        .get('/api/protected') // TODO: Update this endpoint to match your site's protected route
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('message').eql('No token provided');
          done();
        });
    });

    it('should not access protected route with invalid token', done => {
      chai.request(app)
        .get('/api/protected') // TODO: Update this endpoint to match your site's protected route
        .set('Authorization', 'Bearer invalidtoken')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('message').eql('Invalid token');
          done();
        });
    });
  });
});

/* 
Explanation of the Tests

User Registration:
   - Test registering a new user with valid details, expecting a 201 status and a success message.
   - Test registering a user with an email that already exists, expecting a 400 status and an error message.

User Login:
   - Test logging in with valid credentials, expecting a 200 status and a token in the response.
   - Test logging in with invalid credentials, expecting a 401 status and an error message.

Access Token Validation:
   - Test accessing a protected route with a valid token, expecting a 200 status and a success message.
   - Test accessing a protected route without a token, expecting a 401 status and an error message.
   - Test accessing a protected route with an invalid token, expecting a 401 status and an error message.
*/
