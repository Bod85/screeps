/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.basic_worker');
 * mod.thing == 'a thing'; // true
 */

module.exports = class BasicWorker {
    /** @param {Creep} creep **/
    static getWorkerSource(creep) {
        let harvesterSource = null;
        if(creep.memory.sourceID != null) {
            harvesterSource = Game.getObjectById(creep.memory.sourceID);
        } else {
            var keys = Object.keys(creep.room.memory.sources);
            keys.sort(function(a, b) {
                return creep.room.memory.sources[b].pathCost - creep.room.memory.sources[a].pathCost;
            });
            
            keys.forEach(sourceID => {
                let source = creep.room.memory.sources[sourceID];
                let sourceCreeps = creep.room.find(FIND_MY_CREEPS, {filter: function(object) {
                    return object.memory.sourceID == sourceID;
                } });

                if(sourceCreeps.length < source.harvestersLimit) {
                    creep.memory.sourceID = sourceID;
                    harvesterSource = Game.getObjectById(sourceID);
                    return;
                }
            });
            
            if(harvesterSource == null) {
                harvesterSource = creep.room.find(FIND_SOURCES)[0];
            }
        }
        
        return harvesterSource;
    }
};