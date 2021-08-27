var BasicDefender = require("creep_role_basic_defender");
const Const = require("core_const");

module.exports = class RoleMelee extends BasicDefender {
    /** @param {Creep} creep **/
    static run(creep) {

        let targetCreep = BasicDefender.getDefenderTarget(creep);
        if(targetCreep != null) {
            if(null == Const.ACTION_ATTACK) {
                // At that moment, tank will take only ranged damage
                if(creep.pos.getRangeTo(targetCreep) > 1)
                    creep.moveTo(targetCreep);
                else
                    creep.attack(targetCreep);
            } else {
                let rallyPoint = BasicDefender.getRallyPoint(creep);
                if(rallyPoint != null && creep.pos.getRangeTo(rallyPoint) > 3) {
                    creep.moveTo(rallyPoint, {visualizePathStyle: {stroke: '#ffffff'}, plainCost: 2, swampCost: 10});
                }
            }
        }
    }
};