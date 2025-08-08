import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from "./router"
import "./style.css"

// Create the app instance
const app = createApp(App)

// Create and use Pinia store
const pinia = createPinia()
app.use(pinia)

// Use router
app.use(router)

// Handle router errors
router.onError((error) => {
  console.error("Router error:", error)
})

// Mount the app
app.mount("#app")
