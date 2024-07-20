<script setup lang="ts">
	import { RouteLocationRaw, RouterLinkProps, RouterLink } from 'vue-router'

	interface ILinkProps extends RouterLinkProps {
		to: RouteLocationRaw & { params: Record<string, any> }
		class?: string
	}

	const props = defineProps<ILinkProps>()
</script>

<template>
	<router-link v-bind="props" v-slot="{ isActive, href, navigate }" custom>
		<a
			:href="href"
			:class="`${props.class ? props.class : ''}${
				isActive ? ' --is-active ' : ''
			}`"
			@click="navigate"
		>
			<slot />
		</a>
	</router-link>
</template>
