<script setup lang="ts">
	import type { Ref } from 'vue'
	const props = defineProps<{
		src?: string
		caption?: string
	}>()
	const ImageItemOuter: Ref<Element | null> = ref(null)

	function onErrorHandler() {
		if (ImageItemOuter) {
			ImageItemOuter.value?.classList.add('--is-error')
		}
	}
</script>

<template>
	<div ref="ImageItemOuter" class="image-item__outer">
		<img
			:src="props.src"
			:alt="props.caption"
			class="image-item"
			:onerror="onErrorHandler"
		/>
	</div>
</template>

<style lang="scss">
	.image-item__outer {
		height: 100px;
		width: 100%;

		&.--is-error {
			background: url('assets/images/icons/image-loading-icon.png') center/24px
				24px no-repeat;

			.image-item {
				display: none;
			}
		}
	}

	.image-item {
		display: block;
		background-color: #fdfffc;
		width: 100%;
		height: 100%;
		object-fit: contain;

		&[src=''] {
			display: none;
		}
	}
</style>
