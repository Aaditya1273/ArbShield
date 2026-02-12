import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { Environment } from './env'
import { agentsRouter, positionsRouter, thoughtsRouter } from './routes'

const app = new Hono<Environment>()

// Middleware
app.use(cors({ origin: '*' }))
app.use(logger())

// Health check
app.get('/', (c) => {
	return c.json({
		message: 'LiquidMesh AgentMesh Orchestrator',
		status: 'running',
		agents: ['watcher', 'strategist', 'executor'],
		version: '1.0.0',
	})
})

// Routes
app.route('/agents', agentsRouter)
app.route('/thoughts', thoughtsRouter)
app.route('/positions', positionsRouter)

export { app }
