/*
Navigation and display test: This test focuses on user navigation through the 
application and the correct display of content. It verifies that navigation links 
and buttons lead to the correct elements and that pages are displayed properly with 
the appropriate content.
*/
describe('Link Navigation, HTTP Requests, and Object Checking Test', () => {
  it('Should check link navigation, HTTP requests, and object visibility', () => {
      // Visit the website's home page
      cy.visit('/')

      // Create an array of objects representing links and their respective destinations
      const links = {
          'categories': [
              { name: 'Categories - Create', url: '/create', objectSelector: '.category-create-form' },
              { name: 'Categories - Delete', url: '/delete', objectSelector: '.category-delete-button' },
              { name: 'Categories - GetAll', url: '/getAll', objectSelector: '.category-list' }
          ],
          'posts': [
              { name: 'Posts - Create', url: '/create', objectSelector: '.post-create-form' },
              { name: 'Posts - Delete', url: '/delete', objectSelector: '.post-delete-button' },
              { name: 'Posts - GetAll', url: '/getAll', objectSelector: '.post-list' }
          ],
          'recipes': [
              { name: 'Recipes - Search', url: '/search', objectSelector: '.recipe-search-form' },
              { name: 'Recipes - Get', url: '/get', objectSelector: '.recipe-details' },
              { name: 'Recipes - Add Favorite', url: '/addFav', objectSelector: '.add-favorite-button' },
              { name: 'Recipes - Delete Favorite', url: '/delFav', objectSelector: '.delete-favorite-button' }
          ],
          'users': [
              { name: 'Users - Register', url: '/register', objectSelector: '.register-form' },
              { name: 'Users - Login', url: '/login', objectSelector: '.login-form' },
              { name: 'Users - Update', url: '/update', objectSelector: '.update-form' },
              { name: 'Users - Delete', url: '/deleteUser', objectSelector: '.delete-user-button' }
          ]
      }

      // Iterate through the link categories
      Object.keys(links).forEach(category => {
          // Iterate through links of the current category
          links[category].forEach(link => {
              // Click on the link
              cy.contains(link.name).click()

              // Verify that the current URL includes the link destination
              cy.url().should('include', link.url)

              // Make an HTTP request to the link and verify that the status code is 200 (OK)
              cy.request(link.url).then(response => {
                  expect(response.status).to.eq(200)
              })

              // Verify that the object present on the page is loaded correctly
              cy.get(link.objectSelector).should('be.visible')

              // Go back to the home page
              cy.contains('Home').click()

              // Verify that the navigation link is still present after returning to the home page
              cy.contains(link.name).should('be.visible')
          })
      })
  })
})
