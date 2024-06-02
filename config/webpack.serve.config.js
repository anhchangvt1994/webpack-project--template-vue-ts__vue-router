const { webpack } = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const { getPort, findFreePort } = require('./utils/PortHandler')

;(async () => {
	const port = await findFreePort(process.env.PORT)
	console.log()
	const serverInitial = new WebpackDevServer(
		webpack({
			mode: 'production',
			entry: {},
			output: {},
		}),
		{
			compress: true,
			port: port,
			static: './dist',
			historyApiFallback: true,
		}
	)

	serverInitial.start()
})()
