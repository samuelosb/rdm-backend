const chai = require('chai');
const chaiHttp = require('chai-http');
const nock = require('nock');
const { expect } = chai;
chai.use(chaiHttp);

const app = require('../app'); // Assuming you have an Express app in app.js

describe('External Service Integrations', () => {
  // TODO: Replace the external service base URL with Edamam API base URL
  const externalServiceBaseURL = 'https://api.external-service.com';
  
  describe('API Calls', () => {
    //it('should successfully call the external payment service', done => {
      // TODO: Adapt the mock endpoint and payload to match Edamam API requirements
      //nock(externalServiceBaseURL)
        //.post('/payments', { amount: 100, currency: 'USD' })
        //.reply(200, { status: 'success', transactionId: '12345' });
      
      //chai.request(app)
        //.post('/api/payments')
        //.send({ amount: 100, currency: 'USD' })
        //.end((err, res) => {
          //expect(res).to.have.status(200);
          //expect(res.body).to.have.property('status').eql('success');
          //expect(res.body).to.have.property('transactionId').eql('12345');
          //done();
        //});
    //});

    it('should successfully call the external notification service', done => {
      // TODO: Adapt the mock endpoint and payload to match Edamam API requirements
      nock(externalServiceBaseURL)
        .post('/notifications', { userId: 'user123', message: 'Your order has been shipped' })
        .reply(200, { status: 'sent' });
      
      chai.request(app)
        .post('/api/notifications')
        .send({ userId: 'user123', message: 'Your order has been shipped' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('status').eql('sent');
          done();
        });
    });
  });

  describe('Error Handling', () => {
    /*it('should handle errors from the external payment service', done => {
      // TODO: Adapt the mock endpoint and payload to match Edamam API requirements
      nock(externalServiceBaseURL)
        .post('/payments', { amount: 100, currency: 'USD' })
        .reply(500, { error: 'Internal Server Error' });
      
      chai.request(app)
        .post('/api/payments')
        .send({ amount: 100, currency: 'USD' })
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property('error').eql('Failed to process payment');
          done();
        });
    });*/

    it('should handle errors from the external notification service', done => {
      // TODO: Adapt the mock endpoint and payload to match Edamam API requirements
      nock(externalServiceBaseURL)
        .post('/notifications', { userId: 'user123', message: 'Your order has been shipped' })
        .reply(400, { error: 'Bad Request' });
      
      chai.request(app)
        .post('/api/notifications')
        .send({ userId: 'user123', message: 'Your order has been shipped' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error').eql('Failed to send notification');
          done();
        });
    });
  });
});

/* 
Explanation of the Tests

API Calls:
   - Payment Service: Test a successful API call to an external payment service, expecting a 200 status and properties like `status` and `transactionId`.
   - Notification Service: Test a successful API call to an external notification service, expecting a 200 status and properties like `status`.

Error Handling:
   - Payment Service Error: Simulate an error response from the payment service and test that the application handles it correctly, expecting a 500 status and an appropriate error message.
   - Notification Service Error: Simulate an error response from the notification service and test that the application handles it correctly, expecting a 400 status and an appropriate error message.
*/
