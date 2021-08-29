var BasicDefender = require("creep_role_defender_basic_defender");
const Const = require("core_const");

module.exports = class RoleHealer extends BasicDefender {
    /** @param {Creep} creep **/
    static run(creep) {
        // First priority: survive.
        if(creep.hits < creep.hitsMax) {
            creep.heal(creep);
        } else {
            let targetCreep = BasicDefender.getDefenderTarget(creep);
            // If there is Raid Boss and we start attacking him
            if(targetCreep != null && creep.room.memory.hostileTargets[targetCreep.id].action == Const.ACTION_ATTACK) {
                let tank = BasicDefender.getTargetDefenderTank(creep.room, targetCreep.id);
                // If there is alive tank, we should concentrate all focus upon him
                if(tank != null) {
                    if(creep.pos.isNearTo(tank.pos)) {
                        if(tank.hits < tank.hitsMax) {
                            creep.heal(tank);
                        } else {
                            // If tank feels good and there is wounded allies around - heal them
                            let healTarget = this.findNearestToHeal(creep);
                            if(healTarget != null) {
                                if(creep.pos.isNearTo(healTarget.pos))
                                    creep.heal(healTarget);
                                else
                                    creep.rangedHeal(healTarget);
                            }                                
                        }
                    } else
                        creep.moveTo(tank.pos);
                } else {
                    // Find something to heal
                    let healTarget = this.findNearestToHeal(creep);
                    if(healTarget != null) {
                        if(creep.pos.isNearTo(healTarget.pos))
                            creep.heal(healTarget);
                        else
                            creep.moveTo(healTarget);
                    // Otherwise, move toward enemy
                    } else if(creep.pos.getRangeTo(targetCreep) > 5)
                        creep.moveTo(targetCreep);
                }
            // If there is no enemy - move to the RallyPoint
            } else {
                let rallyPoint = BasicDefender.getRallyPoint(creep);
                if(rallyPoint != null && creep.pos.getRangeTo(rallyPoint) > 2) {
                    creep.moveTo(rallyPoint, {visualizePathStyle: {stroke: '#ffffff'}, plainCost: 2, swampCost: 10});
                }
            }
        }
    }

    /**
     * 
     * @param {Creep} healer
     */
    static findNearestToHeal(healer) {
        let healTarget = null;
        if("healTargetID" in healer.memory) {
            healTarget = Game.getObjectById(healer.memory.healTargetID);
            if(healTarget == null || healTarget.hits == healTarget.hitsMax)
                delete healer.memory.healTargetID;
        }

        if(healTarget == null) {
            healTarget = healer.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: function(object){
                    return object.hits < object.hitsMax;
                }
            });
            if(healTarget != null)
                healer.memory.healTargetID = healTarget.id;
        }

        return healTarget;
    }
};