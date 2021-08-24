const ACTION_AVOID = "avoid";
const ACTION_ATTACK = "attack";
const RALLY_POINT_NAME = "Rally Point";

module.exports = class BasicDefender {   
    /** @param {Creep} creep **/
    static getDefenderTarget(creep) {
        let defenderTarget = null;
        if(creep.memory.targetID != null) {
            defenderTarget = Game.getObjectById(creep.memory.targetID);
            if(defenderTarget.room.id != creep.room.id) {
                defenderTarget = null;
                creep.memory.targetID = null;
            }
        } 
        
        if(defenderTarget == null) {
            //First of all we should 
            var keys = Object.keys(creep.room.memory.hostileTargets);
            keys.sort(function(a, b) {
                return creep.room.memory.hostileTargets[a].stats.heal - creep.room.memory.hostileTargets[b].stats.heal;
            });
            
            keys.forEach(targetID => {
                let hostileCreepDesc = creep.room.memory.hostileTargets[targetID];
                let roleCount = hostileCreepDesc.defenders[creep.memory.role]
                if(roleCount > 0) {
                    let existCreeps = creep.room.find(FIND_MY_CREEPS, {filter: function(object) {
                        return object.memory.targetID == targetID && object.memory.role == creep.memory.role;
                    } });
                    
                    if(existCreeps.length < roleCount) {
                        creep.memory.targetID = targetID;
                        defenderTarget = Game.getObjectById(targetID);
                        return;
                    }
                }
            });
        }
        
        return defenderTarget;
    }
    
    /** @param {Creep} creep **/
    static getRallyPoint(creep) {
        let rallyPoint = null;
        
        if(creep.memory.rallyPointID != null) {
            rallyPoint = Game.getObjectById(creep.memory.targetID);
        }
        
        if(rallyPoint == null) {
            creep.memory.rallyPointID = null;            
            let flags = creep.room.find(FIND_FLAGS, {filter: (flag) => flag.name == RALLY_POINT_NAME});
            if(flags.length > 0) {
                rallyPoint = flags[0];
                creep.memory.rallyPointID = rallyPoint.id;
            }
        }
        
        return rallyPoint;
    }
};