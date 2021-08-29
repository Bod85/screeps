var BasicWorker = require("creep_role_worker_basic_worker");

module.exports = class RoleUpgrader extends BasicWorker {
    /** @param {Creep} creep **/
    static run(creep) {

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            let creepSource = RoleUpgrader.getWorkerSource(creep);
            if(creep.harvest(creepSource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creepSource, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};