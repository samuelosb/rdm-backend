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
      // Simulate database downtime
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
      // Simulate network issue
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
Spiegazione dei Test

Errori di Input:
   - Campi mancanti: Testa che l'applicazione gestisca correttamente l'assenza di campi obbligatori, aspettandosi uno status 400 e un messaggio di errore appropriato.
   - Tipi di dati non validi: Testa che l'applicazione gestisca correttamente i tipi di dati non validi, aspettandosi uno status 400 e un messaggio di errore appropriato.

Errori di Sistema:
   - Downtime del database: Simula un'interruzione del database e testa che l'applicazione gestisca correttamente questa situazione, aspettandosi uno status 500 e un messaggio di errore appropriato.
   - Problemi di rete: Simula un problema di rete e testa che l'applicazione gestisca correttamente questa situazione, aspettandosi uno status 502 e un messaggio di errore appropriato.
 */