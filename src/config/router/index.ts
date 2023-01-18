import type { RouteRecordRaw } from 'vue-router'
import LazyRoute from 'utils/LazyRoute'
import PageLoader from 'components/PageLoader.vue'
import ErrorComponent from 'components/ErrorComponent.vue'

const lazyPage = LazyRoute.init({
	suspensible: false,
	loadingComponent: PageLoader,
	errorComponent: ErrorComponent,
	delay: 100,
	onError(error, retry, fail) {
		fail()
	},
})

const lazyComponent = LazyRoute.init()

const routes: Readonly<RouteRecordRaw[]> = [
	{
		name: import.meta.env.ROUTER_HOME_NAME,
		path: import.meta.env.ROUTER_HOME_PATH,
		component: lazyPage(() => import('pages/HomePage.vue')),
	},
	{
		name: import.meta.env.ROUTER_CONTENT_NAME,
		path: import.meta.env.ROUTER_CONTENT_PATH,
		component: lazyPage(() => import('pages/ContentPage.vue')),

		children: [
			{
				name: import.meta.env.ROUTER_COMMENT_PAGE_NAME,
				path: import.meta.env.ROUTER_COMMENT_PAGE_PATH,
				component: lazyComponent(
					() => import('components/comment-page/CommentRow.vue')
				),
			},
		],
	},
	{
		name: import.meta.env.ROUTER_NOT_FOUND_NAME,
		path: import.meta.env.ROUTER_NOT_FOUND_PATH,
		component: lazyPage(() => import('pages/NotFoundPage.vue')),
	},
]

const router = createRouter({
	history: createWebHistory(import.meta.env.ROUTER_BASE_PATH),
	routes,
	sensitive: true,
})

export default router
