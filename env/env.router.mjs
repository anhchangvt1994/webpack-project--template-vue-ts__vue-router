export default {
	prefix: 'router',
	data: {
		base: {
			path: '/',
		},
		home: {
			name: 'HomePage',
			path: '/',
		},
		content: {
			name: 'ContentPage',
			path: '/:title-:id(\\d+)',
		},
		comment_page: {
			name: 'CommentPage',
			path: 'comment',
		},
		detail: {
			name: 'DetailPage',
			path: 'detail',
		},
		not_found: {
			name: 'NotFoundPage',
			path: '/:pathMatch(.*)*',
		},
	},
}
