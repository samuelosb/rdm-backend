/*
Login Test: This test verifies that users can successfully 
log into the application using valid usernames and passwords. It ensures that the 
authentication process functions smoothly and that users can access appropriate resources 
after logging in.
*/
describe('Login Test', () => {
  it('Should successfully login with correct username and password', () => {
    // Visit the login page
    cy.visit('/login')

    // Type the username and password into the corresponding fields
    cy.get('#username').type('username')
    cy.get('#password').type('password')

    // Submit the login form
    cy.get('form').submit()

    // Check if the user is redirected to the dashboard page
    cy.url().should('include', '/dashboard')

    // Check if the welcome text is present on the dashboard page
    cy.contains('Welcome, username').should('be.visible')
  })

  it('Should display an error message with incorrect credentials', () => {
    // Visit the login page
    cy.visit('/login')

    // Type incorrect credentials
    cy.get('#username').type('incorrectuser')
    cy.get('#password').type('incorrectpassword')

    // Submit the login form
    cy.get('form').submit()

    // Check if an error message is displayed
    cy.contains('Invalid credentials').should('be.visible')
  })
})