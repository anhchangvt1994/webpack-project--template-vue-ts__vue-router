<script setup>
	import { UserInfoState } from 'store/UserStore'
	const loginPageName = import.meta.env.ROUTER_LOGIN_NAME
</script>

<template>
	<RouterView v-slot="{ Component }">
		<template v-if="Component">
			<div class="layout">
				<!-- .header -->
				<div class="main-container">
					<header class="header">
						<template v-if="UserInfoState.email">
							<span>{{ UserInfoState.email }}</span> |
							<span
								style="cursor: pointer"
								@click="
									() => {
										UserInfoState.email = ''
										$route.meta.reProtect?.()
									}
								"
								>Logout</span
							>
						</template>
						<router-link v-else :to="{ name: loginPageName }">
							Login
						</router-link>
					</header>
					<Suspense>
						<component :is="Component"></component>
					</Suspense>
				</div>
				<!-- .container -->
			</div>
			<!-- .layout -->
		</template>
	</RouterView>
</template>

<style lang="scss">
	.header {
		text-align: right;
		padding: 16px;
	}
	.main-container {
		max-width: 1280px;
		min-width: 0;
		min-height: 100vh;
		overflow: hidden;
		padding: 16px;
		margin: 0 auto;
	}
</style>
