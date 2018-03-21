'use strict'

const agentFixtures = require('./agent')

const metric = {
  id: 1,
  type: 'metric type',
  value: 'some random value for a metric',
  agent: agentFixtures.byUuid('yyy-yyy-yyy'),
  createdAt: new Date(),
  updatedAt: new Date()
}

const metrics = [
  metric,
  extend(metric, {id: 2}),
  extend(metric, {id: 3, type: 'another type'}),
  extend(metric, {id: 4, agent: agentFixtures.byUuid('yyy-yyy-yyx')}),
  extend(metric, {id: 5, type: 'random type', agent: agentFixtures.byUuid('yyy-yyy-yyz'), value: 'another random value for a metric'})
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

function byUuid (uuid) {
  return metrics.filter(m => m.agent.uuid === uuid)
    .map(m => {
      const clone = Object.assign({}, m)
      delete clone.agent
      delete clone.id
      delete clone.createdAt
      delete clone.value
      return clone
    })
}

function byTypeUuid (type, uuid) {
  return metrics.filter(m => m.type === type && m.agent.uuid === uuid)
    .map(m => {
      const clone = Object.assign({}, m)
      delete clone.agent
      return clone
    })
}

module.exports = {
  single: metric,
  all: metrics,
  byUuid,
  byTypeUuid
}
