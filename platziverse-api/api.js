'use strict'

const debug = require('debug')('platziverse:api:routes')
const express = require('express')
const asyncify = require('express-asyncify')
const db = require('platiziverse-db')
const config = require('../platziverse-db/config')({ setup: false })

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

api.get('/agents', (req, res) => {
  res.send({})
})

api.get('/agents/:uuid', (req, res, next) => {
  const { uuid } = req.params
  if (uuid !== 'yyy') {
    return next(new Error('Agent not found'))
  }
  res.send({ uuid })
})

api.get('/metrics/:uuid', (req, res) => {
  const { uuid } = req.params
  res.send({ uuid })
})

api.get('/metrics/:uuid/:type', (req, res) => {
  const { uuid, type } = req.params
  res.send({ uuid, type })
})

module.exports = api
