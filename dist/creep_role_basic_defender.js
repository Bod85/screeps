module.exports = class BasicDefender {   
    /** @param {Creep} creep **/
    static getDefenderTarget(creep) {
        let defenderTarget = null;
        if(creep.memory.targetID != null) {
            defenderTarget = Game.getObjectById(creep.memory.targetID);
            if(defenderTarget != null && defenderTarget.room.id != creep.room.id) {
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
        
        if(creep.memory.rallyPoint != null) {
            rallyPoint = Game.flags[rallyPoint];
        }
        
        if(rallyPoint == null && creep.room.memory.gatherPoint != null) {
            creep.memory.rallyPointID = null;            
            let flag = Game.flags[creep.room.memory.gatherPoint];
            if(flag != null) {
                rallyPoint = flag;
                creep.memory.rallyPointID = creep.room.memory.gatherPoint; 
            }
        }
        
        return rallyPoint;
    }
};