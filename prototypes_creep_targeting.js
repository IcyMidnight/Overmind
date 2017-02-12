// Creep prototype targeting functions; modify creep.memory.target field
// All functions return either OK = 0 or ERR_NO_TARGET_FOUND = 1.
// In case of ERR_NO_TARGET_FOUND, memory is never modified.
// All retargeting logic should be handled outside of these functions, preferably in the creep logic

Creep.prototype.targetClosestUnsaturatedSource = function () {
    // Set target to the closest source that isn't already saturated with creeps
    var target = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {
        filter: (source) => source.openSpots() > 0
    });
    if (target) {
        this.memory.target = target.id;
        return OK;
    } else {
        return ERR_NO_TARGET_FOUND;
    }
};

Creep.prototype.targetFullestContainer = function () {
    // Set target to the fullest container in the room
    var containers = this.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_CONTAINER &&
                       s.store[RESOURCE_ENERGY] > 0
    });
    if (containers.length > 0) { // loop through results to find the container with the most energy in the room
        var target = containers[0];
        var maxFullness = 0;
        for (let i in containers) {
            if (containers[i].store[RESOURCE_ENERGY] > maxFullness) {
                target = containers[i];
                maxFullness = containers[i].store[RESOURCE_ENERGY];
            }
        }
        this.memory.target = target.id;
        return OK;
    } else {
        return ERR_NO_TARGET_FOUND;
    }
};

Creep.prototype.targetClosestContainerOrStorage = function () {
    // Set target to the closest container or storage that has at least (creep carry capacity) energy
    var target = this.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => (s.structureType == STRUCTURE_CONTAINER ||
                        s.structureType == STRUCTURE_STORAGE) &&
                       s.store[RESOURCE_ENERGY] > 0
    });
    if (target) {
        this.memory.target = target.id;
        return OK;
    } else {
        return ERR_NO_TARGET_FOUND;
    }
};

Creep.prototype.targetClosestAvailableSink = function (prioritizeTowers = true) {
    var target; // the target object (not ID)
    // First try to find the closest non-full tower
    if (prioritizeTowers) {
        target = this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_TOWER &&
                                   structure.energy < structure.energyCapacity
        });
    }
    // Then try and find if anything else needs energy
    if (!target) {
        target = this.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => (structure.structureType == STRUCTURE_TOWER ||
                                    structure.structureType == STRUCTURE_EXTENSION ||
                                    structure.structureType == STRUCTURE_SPAWN) &&
                                   structure.energy < structure.energyCapacity
        });
    }
    // If nothing else needs energy, dump to storage
    if (!target) {
        target = this.room.storage;
    }
    if (target) {
        this.memory.target = target.id;
        return OK;
    } else {
        return ERR_NO_TARGET_FOUND;
    }
};

Creep.prototype.targetClosestJob = function () {
    // Set target to closest construction job; allows duplicates
    var target = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
    if (target) {
        this.memory.target = target.id;
        return OK; // success
    } else {
        return ERR_NO_TARGET_FOUND; // no jobs found
    }
};

Creep.prototype.targetClosestWallLowerThan = function (hp) {
    // Set target to closest wall or rampart with less than hp hits; wall repairs allow duplicate repair jobs
    var wall = this.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.hits < hp && (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART)
    });
    if (wall) {
        this.memory.target = wall.id;
        return OK;
    } else {
        return ERR_NO_TARGET_FOUND;
    }
};

Creep.prototype.targetClosestUntargetedRepair = function (hpPercent = 0.9) {
    // Set target to closest repair job that is not currently targeted by any other repairer
    var structure = this.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.hits < hpPercent * s.hitsMax &&
                       s.isTargeted('repairer') == false &&
                       s.structureType != STRUCTURE_WALL &&
                       s.structureType != STRUCTURE_RAMPART // prioritize non-walls/non-ramparts
    });
    if (structure) {
        this.memory.target = structure.id;
        return OK;
    } else {
        return ERR_NO_TARGET_FOUND;
    }
};

Creep.prototype.targetClosestEnemy = function () {
    // Set target to the closest enemy creep in the room
    var closestEnemy = this.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
    if (closestEnemy) {
        this.memory.target = closestEnemy.id;
        return OK;
    } else {
        return ERR_NO_TARGET_FOUND;
    }
};

Creep.prototype.targetClosestDamagedCreep = function () {
    // Set target to the closest damaged ally creep in the room
    var closestDamagedCreep = this.pos.findClosestByPath(FIND_MY_CREEPS, {
        filter: (c) => c.hits < c.hitsMax
    });
    if (closestDamagedCreep != undefined) {
        this.memory.target = closestDamagedCreep.id;
        return OK;
    } else {
        return ERR_NO_TARGET_FOUND;
    }
};