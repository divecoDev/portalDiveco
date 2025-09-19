describe('Homepage E2E Tests', () => {
  beforeEach(() => {
    // Visitar la página principal antes de cada test
    cy.visitApp('/')
  })

  it('should load the homepage successfully', () => {
    // Esperar que la página cargue completamente con más tiempo
    cy.get('body', { timeout: 30000 }).should('be.visible')

    // Esperar a que el contenido se cargue completamente
    cy.wait(1000) // Pausa adicional para PCs lentas

    // Verificar que hay contenido HTML
    cy.get('.amplify-button--primary')

    cy.get('[data-testid="diveco-button"]').click()

  })
})
