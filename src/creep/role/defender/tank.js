var BasicDefender = require("creep_role_defender_basic_defender");
const Const = require("core_const");

module.exports = class RoleTank extends BasicDefender {
    /** @param {Creep} creep **/
    static run(creep) {

        let targetCreep = BasicDefender.getDefenderTarget(creep);
        if(targetCreep != null && creep.room.memory.hostileTargets[targetCreep.id].action == Const.ACTION_ATTACK) {
            if(creep.pos.getRangeTo(targetCreep) > 3)
                creep.moveTo(targetCreep);
            else
                creep.rangedAttack(targetCreep);
        } else {
            let rallyPoint = BasicDefender.getRallyPoint(creep);
            if(rallyPoint != null && creep.pos.getRangeTo(rallyPoint) > 2) {
                creep.moveTo(rallyPoint, {visualizePathStyle: {stroke: '#ffffff'}, plainCost: 2, swampCost: 10});
            }
        }
    }
};