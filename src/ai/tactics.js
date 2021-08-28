const Const = require('core_const');


module.exports = class AITactics {
    static updateTargetAction() {
        for(let name in Game.rooms) {
            let room = Game.rooms[name];
            for(let hostileID in room.memory.hostileTargets) {
                let hostileTarget = room.memory.hostileTargets[hostileID];
                if("defenders" in hostileTarget) {
                   let creepsNeed = Object.values(hostileTarget).reduce((a,b) => a + b);
                   let existCreeps = room.find(FIND_MY_CREEPS, {filter: function(object) {
                                            return object.memory.targetID == hostileID;
                                        } }).length;
                    if(hostileTarget.action == Const.ACTION_AVOID && creepsNeed >= existCreeps) {
                        hostileTarget.action = Const.ACTION_ATTACK;
                    } else if (hostileTarget.action == Const.ACTION_ATTACK && 
                            existCreeps / creepsNeed <= (1 - Const.CASULTY_LIMIT_PERCENT / 100)) {
                        hostileTarget.action = Const.ACTION_AVOID;
                    }
                }
            }
        }
    }
}