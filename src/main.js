import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { liffInit } from './liff'

import 'bulma/css/bulma.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './assets/main.css'

// --- NEW CORRECT WAY ---
// This function will contain the app startup logic
const startup = () => {
    const app = createApp(App)
    app.use(createPinia())
    app.use(router)
    app.mount('#app')
}

// Initialize LIFF first, and only when it's done, start the Vue app.
liffInit()
    .then(() => {
        console.log('[main.js] LIFF Init successful. Starting Vue app...')
        window.liffError = null // Set global flag for success
        startup() // Start Vue
    })
    .catch((error) => {
        console.error('[main.js] LIFF Init failed:', error)
        window.liffError = error.toString() // Set global flag for error
        // Still start the app even if LIFF fails, so we can see the debug info
        // and the app can be used in a normal browser.
        startup()
    })
