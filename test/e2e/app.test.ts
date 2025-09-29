import { test, expect } from '@nuxt/test-utils/playwright'

test('should render homepage with browser visible', async ({ page, goto }) => {
  console.log('🚀 Iniciando prueba con navegador visible...')

  // Configurar para ver errores
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Error de consola:', msg.text())
    } else {
      console.log('📝 Consola:', msg.text())
    }
  })

  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`🌐 Error de red: ${response.status()} ${response.url()}`)
    } else if (response.status() === 200) {
      console.log(`✅ Recurso cargado: ${response.url()}`)
    }
  })

  // Ir a la página principal usando goto de Nuxt
  console.log('📍 Navegando a la página principal...')
  await goto('/')

  // Esperar que la página cargue completamente
  console.log('⏳ Esperando que la página cargue...')
  await page.waitForLoadState('networkidle')

  // Tomar screenshot para debugging
  await page.screenshot({ path: 'debug-homepage.png', fullPage: true })
  console.log('📸 Screenshot completo tomado: debug-homepage.png')

  // Verificar que el body existe y es visible
  console.log('🔍 Verificando que el body está visible...')
  await expect(page.locator('body')).toBeVisible({ timeout: 10000 })

  // Obtener y mostrar el título
  const title = await page.title()
  console.log(`📄 Título de la página: "${title}"`)

  // Verificar que hay contenido HTML básico
  const htmlContent = await page.content()
  expect(htmlContent).toContain('<html')
  expect(htmlContent).toContain('</html>')

  // Esperar un poco más para poder observar
  console.log('👀 Pausa para observar el navegador (5 segundos)...')
  await page.waitForTimeout(5000)

  console.log('✅ Prueba completada exitosamente!')
})
