import type { RouteLocationNormalized, Router } from 'vue-router'
import useCertificateCustomizationInfo from '../composable/useCertificateCustomizationInfo'
import { ICertCustomizationInfo } from '../composable/useCertificateCustomizationInfo/types'

interface INavigate {
	error?: string
	status: 200 | 301 | 302 | 404 | 504
	redirect?: string | number
}

interface INavigateInfo {
	to: RouteLocationNormalized
	from: RouteLocationNormalized
}

export type ICertInfo = {
	navigateInfo: INavigateInfo
	successPath: string
} & ICertCustomizationInfo

const VALID_CODE_LIST = [200]
const REDIRECT_CODE_LIST = [301, 302]
const ERROR_CODE_LIST = [404, 500, 502, 504]

const BeforeEach = (function beforeEach() {
	let successPath: string
	let successID: string
	let certificateInfo: ICertInfo
	let WAITING_VERIFY_ROUTER_NAME_LIST: { [key: string]: Array<string> }
	const certificateCustomizationInfo = useCertificateCustomizationInfo()

	const _init = (router: Router) => {
		router.beforeEach(async (to, from) => {
			certificateInfo = {
				...certificateCustomizationInfo,
				navigateInfo: {
					to,
					from: !certificateInfo
						? from
						: certificateInfo.navigateInfo.to.fullPath === to.fullPath
						? certificateInfo.navigateInfo.from
						: certificateInfo.navigateInfo.to,
				},
				successPath,
			}

			if (typeof to.meta.protect === 'function') {
				const protect = to.meta.protect
				const navigate: INavigate = {
					status: 200,
				}

				const checkProtection = (isReProtect = false) => {
					const protectInfo = protect(certificateInfo)

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
								// replace: navigate.status === 301,
								replace: isReProtect,
							})
						}

						return false
					}

					return true
				}

				to.meta.reProtect = () => checkProtection(true)

				if (!checkProtection()) return false
			}

			if (
				successID &&
				!WAITING_VERIFY_ROUTER_NAME_LIST[successID].includes(to.name as string)
			) {
				successID = ''
				successPath = ''
			}

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
