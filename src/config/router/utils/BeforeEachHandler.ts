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

const BeforeEach = (function beforeEach() {
	let successPath = ''
	let successID: string = ''
	let WAITING_VERIFY_ROUTER_NAME_LIST: { [key: string]: Array<string> }

	const _protectHandler = ({
		router,
		to,
		from,
	}: { router: Router } & INavigateInfo) => {
		if (typeof to.meta.protect === 'function') {
			const navigate: INavigate = {
				status: 200,
			}

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
				if (WAITING_VERIFY_ROUTER_NAME_LIST[to.name as string]) {
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
					router.push({
						path: navigate.redirect as string,
						replace: navigate.status === 301,
					})
				}

				return false
			}

			to.meta.reProtect = () => _protectHandler({ router, to, from })
		}

		if (
			successID &&
			!WAITING_VERIFY_ROUTER_NAME_LIST[successID].includes(to.name as string)
		) {
			successID = ''
			successPath = ''
		}
	} // _protectHandler()

	const _init = (router: Router) => {
		router.beforeEach((to, from) => {
			_protectHandler({ router, to, from })

			return true
		})
	}

	return {
		init(
			router: Router,
			waitingVerifyRouterNameList: { [key: string]: Array<string> }
		) {
			try {
				if (!router) {
					throw Object.assign(new Error('Missing router parameter!'), {
						code: 402,
					})
				} else {
					WAITING_VERIFY_ROUTER_NAME_LIST = waitingVerifyRouterNameList
					_init(router)
				}
			} catch (err) {
				console.error(err)
			}
		},
	}
})()

export default BeforeEach
