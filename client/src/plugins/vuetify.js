/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
// import 'vuetify/styles'
import '../styles/main.scss'

// Composables
import { createVuetify } from 'vuetify'

const myCustomDarkTheme = {
  dark: true,
  colors: {
    'red-darken-4': '#b51010',
    'error': '#e8aeb8'
  }
}

export default createVuetify({
  theme: {
    defaultTheme: 'myCustomDarkTheme',
    themes: {
      myCustomDarkTheme
    }
  }
})
