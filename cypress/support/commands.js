// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Comando personalizado para esperar que la aplicación Nuxt cargue
Cypress.Commands.add('visitApp', (path = '/') => {
  cy.visit(path)

  // Esperar que el body sea visible con timeout extendido
  cy.get('body', { timeout: 30000 }).should('be.visible')

  // Esperar que la página termine de cargar completamente
  cy.wait(2000) // Pausa para PCs lentas

  // Esperar que el documento esté listo
  cy.document().should('have.property', 'readyState').and('eq', 'complete')
})

// Comando para manejar autenticación si es necesario
Cypress.Commands.add('login', (username, password) => {
  cy.session([username, password], () => {
    cy.visit('/login')
    // Aquí puedes agregar los pasos específicos de login
    // cy.get('[data-cy="username"]').type(username)
    // cy.get('[data-cy="password"]').type(password)
    // cy.get('[data-cy="login-button"]').click()
    // cy.url().should('not.include', '/login')
  })
})
