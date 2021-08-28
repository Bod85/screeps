var BasicDefender = require("creep_role_basic_defender");
const Const = require("core_const");

module.exports = class RoleHealer extends BasicDefender {
    /** @param {Creep} creep **/
    static run(creep) {

        let targetCreep = BasicDefender.getDefenderTarget(creep);
        if(targetCreep != null && null == Const.ACTION_ATTACK) {

        } else {
            let rallyPoint = BasicDefender.getRallyPoint(creep);
            if(rallyPoint != null && creep.pos.getRangeTo(rallyPoint) > 3) {
                creep.moveTo(rallyPoint, {visualizePathStyle: {stroke: '#ffffff'}, plainCost: 2, swampCost: 10});
            }
        }
    }
};