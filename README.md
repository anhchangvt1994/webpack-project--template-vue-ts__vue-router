## First start

In this repository I will discuss about

- How to define the basic router information in this project ?
- How to use lazy loading in vue-router and customize it ?
- How to use Suspense to create loading page for loading process ?
- How to validate a route ?
- How to protect a route ?

For more information about this project.

1. You can read detail about advanced structure of Webpack + Vue + TS project in this [repository](https://github.com/anhchangvt1994/webpack-project--template-vue-ts).
2. You can read about vue-router in [here](https://router.vuejs.org/).

## Table of contents

1. [Install](#install)
2. [Introduction](#introduction)

<h2>Install</h2>

##### Expect Node 18.x or higher

Clone source with SSH url:

```bash
git clone https://github.com/anhchangvt1994/webpack-project--template-vue-ts__vue-router
```

Install:

```bash
cd webpack-project--template-vue-ts__vue-router
```

If use npm

```bash
npm install
```

If use yarn 1.x

```bash
yarn install
```

<h2>Introduction</h2>

### Table of benefit information that you must know

- [Define router information](#define)
- [lazy-loading](#lazy-loading)
- [Suspense](#Suspense)
- [Validate on route](#validate)
- [Protect on route](#protect)

<h3 id="define">Define router information</h3>
In this project, you can define router information in two ways

1. Immediacy

This way will fast and easy to define and create a vue-router. See code below.

```javascript
import HomePage from 'pages/HomePage.vue'

const routes = [
  {
    name: 'HomePage',
    path: '/',
    component: HomePage,
  },
  ...
]

const router = createRouter({
  history: createWebHistory('/'),
  routes,
  sensitive: true,
})
```

2. Define and use it by using environment variables

This way will make you spend more time to define and create vue-router. But other way you can reuse it to compare route's name, makesure right result when create route's path by using `<router-link :to="path">` and more. See code below

```javascript
// env.router.mjs
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
    ...
  },
}
```

```javascript
// config/router/index.ts
import HomePage from 'pages/HomePage.vue'

const routes = [
  {
    name: import.meta.env.ROUTER_HOME_NAME,
    path: import.meta.env.ROUTER_HOME_PATH,
    component: HomePage,
  },
  ...
]

const router = createRouter({
  history: createWebHistory(import.meta.env.ROUTER_BASE_PATH),
  routes,
  sensitive: true,
})
```

```html
<!-- HomePage.vue -->
<script setup>
	const pathInfo = {
	  name: import.meta.env.ROUTER_CONTENT_NAME,
	  params: {
	    id: 1234,
	    title: 'a-b-c-d',
	  },
	}
</script>

<template>
	<router-link :to="pathInfo"></router-link>
</template>
```

Imagine that what happend if you use the first solution to create vue-router information and change a name of path generator object. Are you sure that you changed all of them ?

<h3>lazy-loading</h3>

In vue-router docs, it already introduced a simple way to create a lazy-loading route by using dynamic import. See code below and more in [vue-router docs](https://router.vuejs.org/guide/advanced/lazy-loading.html)

```javascript
const routes = [
  {
    name: import.meta.env.ROUTER_HOME_NAME,
    path: import.meta.env.ROUTER_HOME_PATH,
    component: () => import('pages/HomePage.vue'),
  },
  ...
]

const router = createRouter({
  history: createWebHistory(import.meta.env.ROUTER_BASE_PATH),
  routes,
  sensitive: true,
})
```

<h3>Suspense</h3>

Suspense is a loading resolver solution in Vue 3.x. Imagine that your page is loading the HomePage resource (by using import dynamic on route) or await an API requesting, and your internet connection is so bad. Bumb! You see a blank page or a current page in so long of time, and that's the time you have to show a loading page or a skeleton.

In this section, I will discuss about handling the loading page when using lazy-loading routes.

Continue the probplem above, we can resolve in two ways

1. Listen on Route and Listen on Hook
   Step by step like this

- When a route init or change, the lisnter [beforeEach](https://router.vuejs.org/api/interfaces/router.html#beforeeach) will be fired. I will turn on load in this event.
- When lazy-loading finish, the page component will active hooks. I will turn off loading screen at **created** hook

route init/change > trigger beforeEach event > turn on loading screen > lazy-loading route finish > lifecycle hooks of page actived > created hook active > turn off loading screen.

2. Use Suspense

In the first solution, we use router event and vue hook + store to keep flag of on/off the loading screen. It means we have to :

- Define a isLoading flag in store.
- Define the turn on script in beforeEach.
- Define the turn of script in each page's created hook.

I think that's run well, but not good for management.

In the second solution, we will use Suspense to resolve loading screen with better management.

To use Suspense for lazy-loading route, we need to customize something. The dynamic import syntax used for lazy-loading route in this version doesn't support right way for Suspense. So! In this project, I already customize a method support for lazy-loading routes to connect with Suspense right way. See the syntax below.

```javascript
// config/router/index.js
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

const routes = [
  {
    name: import.meta.env.ROUTER_HOME_NAME,
    path: import.meta.env.ROUTER_HOME_PATH,
    component: lazyPage(() => import('pages/HomePage.vue')),
  },
  ...
]
```

```html
<!-- App.vue -->
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
```

Easy! And you're finish him. You created loading screen in just two files instead of multiples files like the first solution.

NOTE: If you need to know detail how LazyRoute method works, you can open LazyRoute file and search it. Some keywords for researching: defineComponent, defineAsyncComponent, Render Functions.

<h3 id="validate">Validate on route</h3>

You can validate route params by using regex immediate in path defination, or if your regex ability isn't good, you can validate by some native JS methods like: split, splice, Number, ... and in that case, you need define your validation in the [meta options and use beforeEach event to execute it](https://router.vuejs.org/guide/advanced/meta.html#route-meta-fields). See code below

```javascript
// It means the "title" param must be a string and the "id" param must be a number
// /a-b-c-d-e1234 -> wrong
// /a-b-c-d-e-1234 -> right (title is a-b-c-d-e, id is 1234)
path: '/:title-:id(\\d+)'
```

Some keywords for researching:
[route's params](https://router.vuejs.org/guide/essentials/route-matching-syntax.html#custom-regex-in-params), [route's meta](https://router.vuejs.org/guide/advanced/meta.html#route-meta-fields)

<h3 id="protect">Protect on route</h3>

You can product route by using the [meta options and use beforeEach event to execute it](https://router.vuejs.org/guide/advanced/meta.html#route-meta-fields).
Imagine that you have a route only allow V.I.P user, then you need to prevent other user enter that V.I.P route. In this case you can use protect route to resolve it. See code below

```javascript
meta: {
  protect() {
    const userInfo = useUserInfo()
    return userInfo.isVip
  }
}

beforeEach() {
  // Prevent enter this route if protect() is false
  if(typeof to.meta.protect === 'function' && !to.meta.protect()) return false

  ...
}
```

Makesure your protect function is a **Pure Function**, it make your result will always right.
