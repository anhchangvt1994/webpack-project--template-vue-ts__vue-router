import { createApp } from 'vue'
import router from 'config/router'
import 'assets/styles/tailwind.css'
import { UserInfo } from 'store/UserStore'

const App = (() => {
	const initVueApp = () => {
		import('App.vue').then(function (data) {
			if (!data || !data.default) return
			createApp(data.default)
				.provide(import.meta.env.STORE_KEY_USER, UserInfo)
				.use(router)
				.mount('#root')
		})
	} // initVueApp()

	return {
		init() {
			initVueApp()
		},
	}
})()
App.init()
