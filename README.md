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

You can protect route by using the [meta options and use beforeEach event to execute it](https://router.vuejs.org/guide/advanced/meta.html#route-meta-fields).
We will make an example in this project. The PRD for protect route's case has some short description.

```markdown
// PRD - Comment Page

**Description**

- Comment Page is the page contains full list of comments.
- The user can enter Comment Page with two ways:

1. Click "See more" from comment section in Content Page.
2. copy and paste the url of Comment Page in browser's url bar.

**Accessible rules**
To access Comment Page user must:

- Already logged

If user haven't logged before, the system will auto redirect user to Login Page.

If user have an account before, user will logged with that account, and after login success, the system will redirect user back to Comment Page.

If user does not have an account before, user can go to Register Page and regist an account. After regist success, the system will auto login and redirect user go to Comment Page.
```

You will have many choice to resolve for above PRD

1. Use Vue Hook and Store (easy way to handle but never easy way to manage)

- Router load Comment Page finish
- Comment Page's hook actived
- Check access rule. If invalid then store current path and redirect to Login Page
- Login success redirect back to Comment Page path stored and remember clear that store's path variable.

2. Use only vue-router (harder to implement but easy to use and manage)

- Setup **meta { protect() {... return boolean | string} }** and execute it in **beforeEach** event.
- If **protect()** return invalid, then the system will auto check if Comment Page need to back after success verify, then save the path of Comment Page, and redirect user to Login Page.
- Login success redirect back to Comment Page.

In this project, I will show you the second solution. Cause we just focus only vue-router in this project, and cause redirect is a part of router's cases, so doesn't need use store and hook to resolve it.

I handled for you executing **protect()** in this project, so you just only focus how to use it easy way. See code below

```javascript
// router/index
// Config Protect
{
  name: import.meta.env.ROUTER_COMMENT_NAME,
  path: import.meta.env.ROUTER_COMMENT_PATH,
  meta: {
    protect(certInfo) {
      /**
       * certInfo param contains
       * {
       *    user: {email?: string}
       *    navigateInfo: {to: RouteLocationNormalized, from: RouteLocationNormalized}
       *    successPath: string
       * }
       */
      if(!certInfo || !certInfo.email) return import.meta.env.ROUTER_LOGIN_PATH
      return true
    }
  }
},
{
  name: import.meta.env.ROUTER_LOGIN_NAME,
  path: import.meta.env.ROUTER_LOGIN_PATH,
  meta: {
    protect(certInfo) {
      if (certInfo && certInfo.user && certInfo.user.email) {
        // NOTE - If logged > redirect to successPath OR previous path OR Home Page path
        return (
          certInfo.successPath ||
          (
            certInfo.navigateInfo?.from?.fullPath ??
            import.meta.env.ROUTER_HOME_PATH
          )
        )
      }

      return true
    }
  }
}

// Init beforeEach adapter
import beforeEach from './utils/BeforeEachHandler'
beforeEach.init(
  router,
  // NOTE - The second param is a list of waiting back path after verify
  {}
)

// Setup list of waiting back path after verify
import beforeEach from './utils/BeforeEachHandler'
beforeEach.init(
  router,
  // NOTE - The second param is a list of waiting back path after verify
  // This setup means: the Comment Page will be kept if target route is Login Page, else it will be remove
  {
    [import.meta.env.ROUTER_COMMENT_NAME]: [import.meta.env.ROUTER_LOGIN_NAME],
  }
)
```

OK! You finish config protection for router, next I will show you how to use it

Imagine that you go to Comment Page without login, and the system redirect you to Login Page. This requirement are resolved by the above configuration.
In next step, in Login Page you click to login and after that the system has to redirect you go back Comment Page. This requirement are also resolved by the above configuration, but you must re-run the **protect()** in Login Page after login successfully. To do that, I have handled it and gave you a useful in API composition **useRoute** called **reProtect()**, all you need to do is just use it. See code below.

```javascript
// LoginPage.vue
const route = useRoute()
const onClickLogin = () => {
	userInfo.email = 'abc@gmail.com'

	// NOTE - remember use Optional chaining "?.". Thanks to ES6 useful
	// Because the system don't know what routes have protect and what routes don't have
	route.meta.reProtect?.()
}
```

And finish! You finish the requirement about login success with just 1 line of code.
But! wait minutes! We have an extensibility requirement

```markdown
// Logout rules
After login successfully
The "user's email" and "Logout" label will display in header at right corner

If user click "Logout" label

1. The system will logout account.
2. Next the system will check protect of current route.
3. If current route does not have protect rule or protect rule is valid,
   then do nothing.
4. If protect of current route return invalid,
   the system will redirect user to the verify route.
```

I think you have already known what need to do. Correct! just use **reProtect()** after logout. See code below.

```javascript
// App.vue
const route = useRoute()
const onClickLogout = () => {
	userInfo.email = ''
	route.meta.reProtect?.()
}
```

Finish him! Easy to finish the extensibility requirement, jsut only 1 line of code.

**NOTE**

- Makesure your protect function is a **Pure Function**, it make your result will always right.
- You can customize or implement your logic to handle protect case by using

1. **shim-vue.d.ts** to declare type for **meta field**
2. **config/router/utils/BeforeEachHandler.ts** to customize or implement logic.
3. **config/router/index.ts** to init your handler.
