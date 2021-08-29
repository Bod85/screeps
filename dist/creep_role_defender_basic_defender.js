const Const = require("core_const");

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
            var keys = Object.keys(creep.room.memory.hostileTargets);
            keys.sort(function(a, b) {
                return creep.room.memory.hostileTargets[a].stats.heal - creep.room.memory.hostileTargets[b].stats.heal;
            });
            
            keys.forEach(targetID => {
                let hostileCreepDesc = creep.room.memory.hostileTargets[targetID];
                if(Const.HOSTILE_DEFENDERS_KEY in hostileCreepDesc) {
                    let roleCount = hostileCreepDesc[Const.HOSTILE_DEFENDERS_KEY][creep.memory.role]
                    if(roleCount > 0) {
                        let existCreeps = creep.room.find(FIND_MY_CREEPS, {filter: function(object) {
                            return object.memory.targetID == targetID && object.memory.role == creep.memory.role;
                        } });
                        
                        if(existCreeps.length < roleCount) {
                            creep.memory.targetID = targetID;
                            defenderTarget = Game.getObjectById(targetID);
                        }
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

    /** 
     * @param {Room} room 
     * @param hostileID 
    **/
    static getTargetDefenderTank(room, hostileID) {
        let tank = null;

        if("tankID" in room.memory.hostileTargets[hostileID]) {
            let tankID = room.memory.hostileTargets[hostileID]["tankID"];
            tank = Game.getObjectById(tankID);
            if(tank == null)
                delete room.memory.hostileTargets[hostileID]["tankID"];
        }

        if(tank == null) {
            let existCreeps = room.find(FIND_MY_CREEPS, {filter: function(object) {
                return object.memory.targetID == hostileID && object.memory.role == "tank";
            } });
            
            if(existCreeps.length) {
                tank = existCreeps[0];
                room.memory.hostileTargets[hostileID]["tankID"] = tank.id;
            }
        }

        return tank;
    }
};