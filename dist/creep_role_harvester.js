var BasicWorker = require("creep_role_basic_worker");

const FILL_STRUCTURE_LIST = [STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_TOWER];

module.exports = class RoleHarvester extends BasicWorker {
    /** @param {Creep} creep **/
    static run(creep) {
        let runned = false;

        if(creep.memory.harvesting && creep.store.getFreeCapacity() == 0) {
            creep.memory.harvesting = false;
        }
        if(!creep.memory.harvesting && creep.store.getUsedCapacity() == 0) {
            creep.memory.harvesting = true;
        }
        
        let creepSource = RoleHarvester.getWorkerSource(creep);
        if(creep.memory.harvesting) {
            if(creep.harvest(creepSource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creepSource, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            runned = true;
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (FILL_STRUCTURE_LIST.indexOf(structure.structureType) != -1 &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // let path = creep.room.memory.sources[creepSource.id].pathFrom;
                    // if(path)
                    //     console.log(creep.moveByPath(path));
                    // else
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}, plainCost: 2, swampCost: 10});
                }
                runned = true;
            }
        }
        
        return runned;
    }
};