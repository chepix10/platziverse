'use strict'

class AgentNotFoundError extends Error {
  constructor (uuid) {
    super(`Agent with uuid ${uuid} not found`)
    this.uuid = uuid
    this.httpStatusCode = 404

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AgentNotFoundError)
    }
  }
}

class MetricsNotFoundError extends Error {
  constructor (uuid, type) {
    super(`Metrics of Agent with uuid ${uuid} ${type ? `and type ${type}` : ''} not found`)
    this.uuid = uuid
    this.type = type || null
    this.httpStatusCode = 404

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MetricsNotFoundError)
    }
  }
}

class NotAuthorizedError extends Error {
  constructor () {
    super('User unauthorized to access the content')
    this.httpStatusCode = 403

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotAuthorizedError)
    }
  }
}

class NotAuthenticatedError extends Error {
  constructor () {
    super('User unauthenticated')
    this.httpStatusCode = 401
  }
}

module.exports = {
  AgentNotFoundError,
  MetricsNotFoundError,
  NotAuthorizedError,
  NotAuthenticatedError
}
