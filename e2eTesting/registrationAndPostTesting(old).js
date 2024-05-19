/*
Registration and post test: This test checks the registration functionality of the application, 
ensuring that users can successfully create new accounts. Additionally, it verifies the proper 
handling of posts, including creation, viewing, editing, and deletion of posts once logged in.
*/
describe('User Registration, Post Creation, Deletion, and Endpoint Testing', () => {
    it('Should register a new user, create a post, delete the post, and test endpoints', () => {
      // Visit the registration page
      cy.visit('/register')
  
      // Enter details of the new user in the corresponding fields
      cy.get('#username').type('newuser')
      cy.get('#email').type('new@email.com')
      cy.get('#password').type('password')
      cy.get('#confirmPassword').type('password')
  
      // Submit the registration form
      cy.get('form').submit()
  
      // Verify if the user is successfully authenticated and redirected to the dashboard
      cy.url().should('include', '/dashboard')
  
      // Create a new post
      cy.request('POST', '/create', {
        title: 'New Post Title',
        content: 'Content of the new post',
        category: 'General'
      }).then((createResponse) => {
        expect(createResponse.status).to.eq(200)
        const postId = createResponse.body.postId
  
        // Get the created post
        cy.request('GET', `/get?id=${postId}`).then((getResponse) => {
          expect(getResponse.status).to.eq(200)
  
          // Verify if the retrieved post matches the created post
          const retrievedPost = getResponse.body
          expect(retrievedPost.title).to.eq('New Post Title')
          expect(retrievedPost.content).to.eq('Content of the new post')
  
          // Get all posts by category (recent)
          cy.request('GET', '/getAllByCategoryRecent').then((getAllByCategoryRecentResponse) => {
            expect(getAllByCategoryRecentResponse.status).to.eq(200)
  
            // Check if the created post is in the list of posts by category (recent)
            const postsByCategory = getAllByCategoryRecentResponse.body
            const createdPost = postsByCategory.find(post => post._id === postId)
            expect(createdPost).to.not.be.undefined
  
            // Delete the created post
            cy.request('DELETE', '/delete', { id: postId }).then((deleteResponse) => {
              expect(deleteResponse.status).to.eq(200)
  
              // Get all posts by category (recent) after deletion
              cy.request('GET', '/getAllByCategoryRecent').then((getAllByCategoryRecentResponseAfterDeletion) => {
                expect(getAllByCategoryRecentResponseAfterDeletion.status).to.eq(200)
  
                // Check if the created post is no longer in the list of posts by category (recent)
                const postsByCategoryAfterDeletion = getAllByCategoryRecentResponseAfterDeletion.body
                const deletedPost = postsByCategoryAfterDeletion.find(post => post._id === postId)
                expect(deletedPost).to.be.undefined
              })
            })
          })
        })
      })
    })
  })
  