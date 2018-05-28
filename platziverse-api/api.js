'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const asyncify = require('express-asyncify')
const db = require('platiziverse-db')
const config = require('../platziverse-db/config')({ setup: false })
const errors = require('./api-errors')

const api = asyncify(express.Router())

let services, Agent, Metric

api.use('*', async (req, res, next) => {
  if (!services) {
    try {
      debug('Connecting to database')
      services = await db(config)
    } catch (e) {
      return next(e)
    }
    Agent = services.Agent
    Metric = services.Metric
  }
  next()
})

api.get('/agents', async (req, res, next) => {
  debug('A request has come to /agents')

  let agents = []
  try {
    agents = await Agent.findConnected()
  } catch (e) {
    next(e)
  }

  res.send(agents)
})

api.get('/agent/:uuid', async (req, res, next) => {
  const { uuid } = req.params

  debug(`request to /agent/${uuid}`)

  let agent
  try {
    agent = await Agent.findByUuid(uuid)
  } catch (e) {
    return next(e)
  }

  if (!agent) {
    return next(new errors.AgentNotFoundError(uuid))
  }
  res.send(agent)
})

api.get('/metrics/:uuid', async (req, res, next) => {
  const { uuid } = req.params

  debug(`request to /metrics/${uuid}`)

  let metrics = []

  try {
    metrics = await Metric.findByAgentUuid(uuid)
  } catch (e) {
    return next(e)
  }

  if (!metrics || metrics.length === 0) {
    return next(new errors.MetricsNotFoundError(uuid))
  }

  res.send(metrics)
})

api.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params

  debug(`request to /metrics/${uuid}/${type}`)

  let metrics = []

  try {
    metrics = await Metric.findByTypeAgentUuid(type, uuid)
  } catch (e) {
    return next(e)
  }

  if (!metrics || metrics.length === 0) {
    return next(new errors.MetricsNotFoundError(uuid, type))
  }

  res.send(metrics)
})

module.exports = api
