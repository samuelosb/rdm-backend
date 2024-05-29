/*
Functionality test: This test verifies the proper functionality of the 
application's APIs, both front-end and back-end. It ensures that API calls provide 
the expected responses and that the application interacts correctly with backend services to 
retrieve and store data.
*/

describe('Test connection to Edamam API and data verification', () => {
    it('Should verify connection to Edamam API and returned data', () => {

    // This test aims to verify that the Edamam API responds correctly and that the returned data meets our expectations.
  
      // Make a GET request to fetch sample recipes from the Edamam API
      cy.request('GET', 'https://api.edamam.com/search?q=chicken&app_id=recetasdelmundounizar@gmail.com&app_key=rdmzaragoza')
        .then((response) => {
          // Verify that the response has a status code of 200 (OK)
          expect(response.status).to.eq(200)
          
          // Verify that the response body is not empty
          expect(response.body).to.not.be.empty
          
          // Verify that the response contains an array of objects (recipes)
          expect(response.body.hits).to.be.an('array')
          
          // Verify that each recipe contains the expected fields
          response.body.hits.forEach(recipe => {
            expect(recipe).to.have.property('recipe')
            expect(recipe.recipe).to.have.property('label')
            expect(recipe.recipe).to.have.property('url')
            // Add further assertions for expected fields if necessary
          })
        })
    })
  })
  