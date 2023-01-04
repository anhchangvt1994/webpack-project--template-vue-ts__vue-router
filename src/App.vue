<template>
	<RouterView v-slot="{ Component }">
		<template v-if="Component">
			<div class="layout">
				<div class="main-container">
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
	.main-container {
		max-width: 1280px;
		min-width: 0;
		min-height: 100vh;
		overflow: hidden;
		padding: 16px;
		margin: 0 auto;
	}
</style>
