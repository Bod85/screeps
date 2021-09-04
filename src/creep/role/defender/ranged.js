var BasicDefender = require("creep_role_defender_basic_defender");
const Const = require("core_const");

module.exports = class RoleRanged extends BasicDefender {
    /** @param {Creep} creep **/
    static run(creep) {

        let targetCreep = BasicDefender.getDefenderTarget(creep);
        if(targetCreep != null && creep.room.memory.hostileTargets[targetCreep.id].action == Const.ACTION_ATTACK) {
            let tank = BasicDefender.getTargetDefenderTank(creep.room, targetCreep.id);
            // If there is not attacked tank go to him. Also, if there is attack on the creep - shoot back
            if(tank != null && tank.hits == tank.hitsMax && creep.hits == creep.hitsMax) {
                if(creep.pos.getRangeTo(tank) > 2)
                    creep.moveTo(tank);
            } else {
                if(creep.pos.getRangeTo(targetCreep) > 3)
                    creep.moveTo(targetCreep);
                else if(creep.pos.isNearTo(targetCreep)) {
                    let path = PathFinder.search(creep.pos, {pos:targetCreep. pos, range:3},{flee:true}).path;
                    creep.moveByPath(path);
                } else
                    creep.rangedAttack(targetCreep);
            }
        } else {
            let rallyPoint = BasicDefender.getRallyPoint(creep);
            if(rallyPoint != null && creep.pos.getRangeTo(rallyPoint) > 2) {
                creep.moveTo(rallyPoint, {visualizePathStyle: {stroke: '#ffffff'}, plainCost: 2, swampCost: 10});
            }
        }
    }
};