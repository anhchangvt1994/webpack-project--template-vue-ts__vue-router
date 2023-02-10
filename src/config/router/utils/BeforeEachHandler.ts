import type { Router, RouteLocationNormalized } from 'vue-router'
import type { IUserInfo } from 'store/UserStore'
import { UserInfoState } from 'store/UserStore'

interface INavigate {
	error?: string
	status: 200 | 301 | 302 | 404 | 504
	redirect?: string | number
}

interface INavigateInfo {
	to: RouteLocationNormalized
	from: RouteLocationNormalized
}

export interface ICertInfo {
	user: IUserInfo
	navigateInfo: INavigateInfo
	successPath: string
}

let successPath = ''
let successID: string
const KEEPING_PATH_VALID: { [key: string]: Array<string> } = {
	[import.meta.env.ROUTER_COMMENT_NAME]: [import.meta.env.ROUTER_LOGIN_NAME],
}

export default (function beforeEach() {
	const _init = (router: Router) => {
		router.beforeEach((to, from) => {
			if (typeof to.meta.protect === 'function') {
				const navigate: INavigate = {
					status: 200,
				}

				// const userInfo = inject(import.meta.env.STORE_KEY_USER)

				const certificateInfo: ICertInfo = {
					user: UserInfoState as IUserInfo,
					navigateInfo: {
						to,
						from,
					},
					successPath,
				}

				const protectInfo = to.meta.protect(certificateInfo)

				if (!protectInfo) {
					navigate.status = 301
					navigate.redirect = -1
				} else if (typeof protectInfo === 'string') {
					if (KEEPING_PATH_VALID[to.name as string]) {
						successPath = to.fullPath as string
						successID = to.name as string
					}

					navigate.status = 301
					navigate.redirect = protectInfo
				}

				if (navigate.status !== 200) {
					const redirect = navigate.redirect || -1

					if (redirect === -1) {
						router.go(redirect)
					} else {
						router.push(redirect as string)
					}
				}

				if (
					successID &&
					!KEEPING_PATH_VALID[successID].includes(to.name as string)
				) {
					successID = ''
					successPath = ''
				}
			}

			return true
		})
	}

	return {
		init(router: Router) {
			try {
				if (!router) {
					throw Object.assign(new Error('Missing router parameter!'), {
						code: 402,
					})
				} else {
					_init(router)
				}
			} catch (err) {
				console.error(err)
			}
		},
	}
})()
