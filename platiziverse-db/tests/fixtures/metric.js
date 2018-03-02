'use strict'

const metric = {
  id: 1,
  type: 'metric type',
  value: 'some random value for a metric',
  agentId: 1,
  createdAt: new Date(),
  updatedAt: new Date()
}

const metrics = [
  metric,
  extend(metric, {id: 2}),
  extend(metric, {id: 3, type: 'another type'}),
  extend(metric, {id: 4, agentId: 2}),
  extend(metric, {id: 5, type: 'random type', agentId: 3, value: 'another random value for a metric'})
]

function extend (obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: metric,
  all: metrics
}
