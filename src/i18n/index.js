// src/i18n/index.js
import { createI18n } from 'vue-i18n'

// Import translations from separate files
import en from './en.json'
import si from './si.json'

// Create vue-i18n instance
const i18n = createI18n({
    locale: 'si', // Default language
    messages: {
        en, // English translations
        si // Sinhala translations
    }
})

export default i18n
