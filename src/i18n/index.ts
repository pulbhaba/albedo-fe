import { createI18n } from 'vue-i18n'

import en from './en.json'
import si from './si.json'

const i18n = createI18n({
  locale: 'si', // Default language
  messages: {
    en, // English translations
    si // Sinhala translations
  }
})

export default i18n
