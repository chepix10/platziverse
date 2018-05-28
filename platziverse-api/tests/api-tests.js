'use strict'

const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const AgentFixtures = require('../../platziverse-db/tests/fixtures/agent')
const MetricFixtures = require('../../platziverse-db/tests/fixtures/metric')
const Errors = require('./../api-errors')

let sandbox = null
let server = null
let dbStub = null
let AgentStub = {}
let MetricStub = {}

let uuid = 'yyy-yyy-yyy'
let uuidNotFound = 'yyy-yyy-zzz'
let type = 'metric type'

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  dbStub = sandbox.stub()
  dbStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  AgentStub.findConnected = sandbox.stub()
  AgentStub.findConnected.returns(Promise.resolve(AgentFixtures.connected))

  AgentStub.findByUuid = sandbox.stub()
  AgentStub.findByUuid.withArgs(uuid).returns(Promise.resolve(AgentFixtures.single))
  AgentStub.findByUuid.withArgs(uuidNotFound).returns(Promise.resolve(AgentFixtures.byUuid(uuidNotFound)))

  MetricStub.findByAgentUuid = sandbox.stub()
  MetricStub.findByAgentUuid.withArgs(uuid).returns(Promise.resolve(MetricFixtures.byUuid(uuid)))
  MetricStub.findByAgentUuid.withArgs(uuidNotFound).returns(Promise.resolve(MetricFixtures.byUuid(uuidNotFound)))

  MetricStub.findByTypeAgentUuid = sandbox.stub()
  MetricStub.findByTypeAgentUuid.withArgs(type, uuid).returns(Promise.resolve(MetricFixtures.byTypeUuid(type, uuid)))
  MetricStub.findByTypeAgentUuid.withArgs(type, uuidNotFound).returns(Promise.resolve(MetricFixtures.byTypeUuid(type, uuidNotFound)))

  const api = proxyquire('../api', {
    'platiziverse-db': dbStub
  })

  server = proxyquire('../server', {
    './api': api
  })
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test.serial.cb('/api/agents', t => {
  request(server)
    .get('/api/agents')
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(AgentFixtures.connected)
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agent/:uuid', t => {
  request(server)
    .get(`/api/agent/${uuid}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(AgentFixtures.single)
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/agent/:uuid - not found', t => {
  request(server)
    .get(`/api/agent/${uuidNotFound}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'should not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify({ error: new Errors.AgentNotFoundError(uuidNotFound).message})
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid', t => {
  request(server)
    .get(`/api/metrics/${uuid}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'sholud not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(MetricFixtures.byUuid(uuid))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid - not found', t => {
  request(server)
    .get(`/api/metrics/${uuidNotFound}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'sholud not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify({ error: new Errors.MetricsNotFoundError(uuidNotFound).message})
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid/:type', t => {
  request(server)
    .get(`/api/metrics/${uuid}/${type}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'sholud not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify(MetricFixtures.byTypeUuid(type, uuid))
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})

test.serial.cb('/api/metrics/:uuid/:type - not found', t => {
  request(server)
    .get(`/api/metrics/${uuidNotFound}/${type}`)
    .expect(404)
    .expect('Content-Type', /json/)
    .end((err, res) => {
      t.falsy(err, 'sholud not return an error')
      let body = JSON.stringify(res.body)
      let expected = JSON.stringify({ error: new Errors.MetricsNotFoundError(uuidNotFound, type).message})
      t.deepEqual(body, expected, 'response body should be the expected')
      t.end()
    })
})
