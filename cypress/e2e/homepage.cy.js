describe('Homepage E2E Tests', () => {
  beforeEach(() => {
    // Visitar la página principal antes de cada test
    cy.visitApp('/')
  })

  it('should load the homepage successfully', () => {
    // Esperar que la página cargue completamente con más tiempo
    cy.get('body', { timeout: 30000 }).should('be.visible')
  })

  it('shuld login invalid credentials', () => {
    cy.get('[name="username"]').click().type('test@diveco.com')

    cy.get('[name="password"]').click().type('123456')

    cy.get('.amplify-button--primary').click()

    cy.get('.amplify-alert').should('be.visible').contains('Nombre de usuario o contraseña incorrecta')
  })

  it('shuld login valid credentials', () => {
    cy.get('[name="username"]').click().type('jrodas4044@gmail.com')
      cy.get('[name="password"]').click().type('58909624aA@')

    cy.get('.amplify-button--primary').click()

    cy.get(':nth-child(2) > .text-2xl').should('be.visible').contains('Bienvenido')

  })
})
