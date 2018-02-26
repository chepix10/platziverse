'use strict'

module.exports = function setupAgent (AgentModel) {

  async function createOrUpdate (agent) {
    const cond = {
      where: {
        uuid: agent.uuid
      }
    }

    const existingAgent = await AgentModel.findOne(cond)


  }

  function findById (id) {
    return AgentModel.findById(id)
  }

  return {
    createOrUpdate,
    findById
  }
}
