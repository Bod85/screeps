var BasicWorker = require("creep_role_basic_worker");

const STEAL_FROM_SPAWN = true;

module.exports = class RoleBuilder extends BasicWorker {
    /** @param {Creep} creep **/
    static run(creep, buildOnly = false) {
        let runned = false;
        if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if(creep.memory.building) {
            let buildTarget = RoleBuilder.getBuildTarget(creep);
            //Build something
            if(buildTarget != null) {
                if(creep.build(buildTarget) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(buildTarget, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                runned = true;
            // If there nothing to build - then repair    
            } else if (!buildOnly) {
                let repairTarget = RoleBuilder.getRepairTarget(creep);
                if(repairTarget != null) {
                    if(creep.repair(repairTarget) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(repairTarget);
                    }
                    runned = true;
                }
            }
        } else {
            var spawns = null;
            if(STEAL_FROM_SPAWN && !buildOnly) {
                //Ищем точки спауна у которых много ресурсов
                spawns = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) == 0);
                    }
                });    
            }
            
            if(spawns && spawns.length > 0) {
                if(creep.withdraw(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.spawns['Spawn1'], {visualizePathStyle: {stroke: '#ffaa00'}});
                }    
            // Иначе идем добывать
            } else {
                let creepSource = RoleBuilder.getWorkerSource(creep);
                if(creep.harvest(creepSource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creepSource, {visualizePathStyle: {stroke: '#ffaa00'}});
                }    
            }
            runned = true;
        }
        
        return runned;
    }
    
    /** @param {Creep} creep **/
    static getBuildTarget(creep) {
        let target = null;
        if(creep.memory.buildTargetID != null) {
            target = Game.getObjectById(creep.memory.buildTargetID);
            if(!target) {
                delete creep.memory.buildTargetID;
            }
        }
            
        if(!target) {
            //structureType
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES, {filter: function(object) { return object.my && object.structureType != STRUCTURE_ROAD}});
            if(!targets.length)
                targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            //Build something
            if(targets.length) {
                target = targets[0];
                creep.memory.buildTargetID = target.id;
            }
        }
        
        return target;
    }
    
    /** @param {Creep} creep **/
    static getRepairTarget(creep) {
        let target = null;
        if(creep.memory.repairTargetID != null) {
            target = Game.getObjectById(creep.memory.repairTargetID);
            if(!target || target.hits == target.hitsMax) {
                delete creep.memory.repairTargetID;
            }
        }
            
        if(!target) {
            const targets = creep.room.find(FIND_STRUCTURES, {
                    filter: object => object.hits < object.hitsMax
                });
                
                targets.sort((a,b) => a.hits - b.hits);
                
                if(targets.length > 0) {
                    target = targets[0];
                    creep.memory.repairTargetID = target.id;
                }
        }
        
        return target;
    }
};