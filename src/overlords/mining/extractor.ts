import {Overlord} from '../Overlord';
import {ExtractionSite} from '../../hiveClusters/extractionSite';
import {Zerg} from '../../zerg/Zerg';
import {Tasks} from '../../tasks/Tasks';
import {profile} from '../../profiler/decorator';
import {CreepSetup} from '../CreepSetup';
import {OverlordPriority} from '../../priorities/priorities_overlords';

export const DroneSetup = new CreepSetup('drone', {
	pattern  : [WORK, WORK, CARRY, MOVE],
	sizeLimit: Infinity,
});

@profile
export class ExtractorOverlord extends Overlord {

	drones: Zerg[];
	extractionSite: ExtractionSite;

	static settings = {
		maxDrones: 2,
	};

	constructor(extractionSite: ExtractionSite, priority: number) {
		super(extractionSite, 'mineral', priority);
		this.priority += this.outpostIndex * OverlordPriority.remoteSKRoom.roomIncrement;
		this.drones = this.zerg(DroneSetup.role);
		this.extractionSite = extractionSite;
	}

	init() {
		let amount = this.extractionSite.mineral.mineralAmount > 0 ?
					 this.extractionSite.mineral.pos.availableNeighbors().length : 0;
		this.wishlist(Math.min(amount, ExtractorOverlord.settings.maxDrones), DroneSetup);
	}

	private handleDrone(drone: Zerg): void {
		// Ensure you are in the assigned room
		if (drone.room == this.room && !drone.pos.isEdge) {
			if (_.sum(drone.carry) == 0) {
				drone.task = Tasks.harvest(this.extractionSite.mineral);
			}
			// Else see if there is an output to depsit to or to maintain
			else if (this.extractionSite.output) {
				drone.task = Tasks.transferAll(this.extractionSite.output);
				// Move onto the output container if you're the only drone
				if (!drone.pos.isEqualTo(this.extractionSite.output.pos) && this.drones.length == 1) {
					drone.goTo(this.extractionSite.output, {range: 0});
				}
			}
		} else {
			drone.goTo(this.extractionSite);
		}
	}

	run() {
		this.autoRun(this.drones, drone => this.handleDrone(drone), drone => drone.flee());
	}
}
