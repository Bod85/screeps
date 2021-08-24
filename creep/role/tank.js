var BasicDefender = require("basic_defender");

module.exports = class RoleTank extends BasicDefender {
    /** @param {Creep} creep **/
    static run(creep) {

        let targetCreep = BasicDefender.getDefenderTarget(creep);
        if(targetCreep != null) {
            if(targetCreep.memory.action == BasicDefender.ACTION_ATTACK) {
                // At that moment, tank will take only ranged damage
                if(creep.pos.getRangeTo(targetCreep) > 3)
                    creep.moveTo(targetCreep);
                else
                    creep.rangedAttack(targetCreep);
            } else {
                let rallyPoint = BasicDefender.getRallyPoint(creep);
                if(rallyPoint != null) {
                    creep.moveTo(rallyPoint, {visualizePathStyle: {stroke: '#ffffff'}, plainCost: 2, swampCost: 10});
                }
            }
        }
        
        return runned;
    }
};