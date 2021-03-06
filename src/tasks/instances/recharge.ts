import {Task} from '../Task';
import {profile} from '../../profiler/decorator';
import {Zerg} from '../../zerg/Zerg';
import {maxBy, minMax} from '../../utilities/utils';
import {isResource} from '../../declarations/typeGuards';
import {TaskWithdraw, withdrawTaskName} from './withdraw';
import {pickupTaskName, TaskPickup} from './pickup';
import {TaskHarvest} from './harvest';
import {log} from '../../console/log';

export type rechargeTargetType = null;
export const rechargeTaskName = 'recharge';

// This is a "dispenser task" which is not itself a valid task, but dispenses a task when assigned to a creep.

@profile
export class TaskRecharge extends Task {
	target: rechargeTargetType;

	data: {
		minEnergy: number;
	};

	constructor(target: rechargeTargetType, minEnergy = 0, options = {} as TaskOptions) {
		super(rechargeTaskName, {ref: '', pos: {x: -1, y: -1, roomName: ''}}, options);
		this.data.minEnergy = minEnergy;
	}

	private rechargeRateForCreep(creep: Zerg, obj: rechargeObjectType): number | false {
		let amount = isResource(obj) ? obj.amount : obj.energy;
		if (amount < this.data.minEnergy) {
			return false;
		}
		let otherTargeters = _.filter(_.map(obj.targetedBy, name => Game.zerg[name]),
									  zerg => !!zerg && zerg.memory._task
											  && (zerg.memory._task.name == withdrawTaskName
												  || zerg.memory._task.name == pickupTaskName));
		let resourceOutflux = _.sum(_.map(otherTargeters,
										  other => other.carryCapacity - _.sum(other.carry)));
		amount = minMax(amount - resourceOutflux, 0, creep.carryCapacity);
		let effectiveAmount = amount / (creep.pos.getMultiRoomRangeTo(obj.pos) + 1);
		if (effectiveAmount <= 0) {
			return false;
		} else {
			return effectiveAmount;
		}
	}

	// Override creep setter to dispense a valid recharge task
	set creep(creep: Zerg) {
		// Choose the target to maximize your energy gain subject to other targeting workers
		let target = creep.inColonyRoom ? maxBy(creep.colony.rechargeables, o => this.rechargeRateForCreep(creep, o))
										: maxBy(creep.room.rechargeables, o => this.rechargeRateForCreep(creep, o));
		if (!target || creep.pos.getMultiRoomRangeTo(target.pos) > 40) {
			let canHarvest = creep.getActiveBodyparts(WORK) > 0
							 && creep.roleName != 'worker'; // workers shouldn't harvest; let drones do it
			if (canHarvest) {
				// Harvest from a source if there is no recharge target available
				let availableSources = _.filter(creep.room.sources,
												source => source.pos.availableNeighbors(false).length > 0);
				let availableSource = creep.pos.findClosestByMultiRoomRange(availableSources);
				if (availableSource) {
					creep.task = new TaskHarvest(availableSource);
					return;
				}
			}
		}
		if (target) {
			if (isResource(target)) {
				creep.task = new TaskPickup(target);
				return;
			} else {
				creep.task = new TaskWithdraw(target);
				return;
			}
		} else {
			if (creep.roleName == 'queen') {
				log.debug(`No valid withdraw target for ${creep.print}!`);
			}
			creep.task = null;
		}
	}

	isValidTask() {
		return false;
	}

	isValidTarget() {
		return false;
	}

	work() {
		return ERR_INVALID_TARGET;
	}
}
