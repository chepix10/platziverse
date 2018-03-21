'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const agentFixtures = require('./fixtures/agent')
const metricFixtures = require('./fixtures/metric')

let config = {
  logging: function () {}
}

let AgentStub = {
  hasMany: sinon.spy()
}

let uuid = 'yyy-yyy-yyy'
let invalidUuid = 'xxx-xxx-xxx'
let type = 'metric type'
let MetricStub = null
let db = null
let sandbox = null

let uuidArgs = {
  attributes: ['type'],
  group: ['type'],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}

let uuidAgentArgs = {
  where: {
    uuid
  }
}

let invalidUuidAgentArgs = {
  where: {
    uuid: invalidUuid
  }
}

let typeUuidArgs = {
  attributes: ['id', 'type', 'value', 'createdAt'],
  where: {
    type
  },
  limit: 20,
  order: [['createdAt', 'DESC']],
  include: [{
    attributes: [],
    model: AgentStub,
    where: {
      uuid
    }
  }],
  raw: true
}

let newMetric = {
  type: 'metric type',
  value: 'This is some random value for a metric',
  agentId: 1
}

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create()
  MetricStub = {
    belongsTo: sandbox.spy()
  }

  // Metric create stub
  MetricStub.create = sandbox.stub()
  MetricStub.create.withArgs(newMetric).returns(Promise.resolve({
    toJSON () { return newMetric }
  }))

  // Metric findAll stub
  MetricStub.findAll = sandbox.stub()
  MetricStub.findAll.withArgs(uuidArgs).returns(Promise.resolve(metricFixtures.byUuid(uuid)))
  MetricStub.findAll.withArgs(typeUuidArgs).returns(Promise.resolve(metricFixtures.byTypeUuid(type, uuid)))

  // Agent findOne stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidAgentArgs).returns(Promise.resolve(agentFixtures.byUuid(uuid)))
  AgentStub.findOne.withArgs(invalidUuidAgentArgs).returns(Promise.resolve(agentFixtures.byUuid(invalidUuid)))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.sandbox.restore()
})

test('Metric', t => {
  t.truthy(db.Metric, 'Metric service should exist')
})

test.serial('Setup', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel')
})

test.serial('Metric#create - agent exists', async t => {
  let metric = await db.Metric.create(uuid, newMetric)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith(uuidAgentArgs), 'findOne should be called with uuid args')

  t.true(MetricStub.create.called, 'create should be called on model')
  t.true(MetricStub.create.calledOnce, 'create should be called once')
  t.true(MetricStub.create.calledWith(newMetric), 'create should be called with specified args')

  t.deepEqual(metric, newMetric, 'metric should be the same')
})

test.serial('Metric#create - agent doesn\'t exists', async t => {
  let metric = await db.Metric.create(invalidUuid, newMetric)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith(invalidUuidAgentArgs), 'findOne should be called with uuid args')

  t.deepEqual(metric, agentFixtures.byUuid(invalidUuid), 'metric should be the same')
})

test.serial('Metric#findByAgentUuid', async t => {
  let metrics = await db.Metric.findByAgentUuid(uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(uuidArgs), 'findAll should be called with specified args')

  t.deepEqual(metrics, metricFixtures.byUuid(uuid), 'metrics should be the same')
})

test.serial('Metric#findByTypeAgentUuid', async t => {
  let metrics = await db.Metric.findByTypeAgentUuid(type, uuid)

  t.true(MetricStub.findAll.called, 'findAll should be called on model')
  t.true(MetricStub.findAll.calledOnce, 'findAll should be called once')
  t.true(MetricStub.findAll.calledWith(typeUuidArgs), 'findAll should be called with specified args')

  t.deepEqual(metrics, metricFixtures.byTypeUuid(type, uuid), 'metrics should be the same')
})
