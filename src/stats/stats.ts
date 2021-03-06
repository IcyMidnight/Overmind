import {profile} from '../profiler/decorator';
import {Mem} from '../Memory';
import {rollingAverage} from '../utilities/utils';

export var COLLECT_STATS_FREQUENCY = 10; // Gather stats every N ticks

@profile
export class Stats {

	static clean() {
		let protectedKeys = [
			'persistent',
		];
		for (let key in Memory.stats) {
			if (!protectedKeys.includes(key)) {
				delete Memory.stats[key];
			}
		}
	}

	static format() {
		// Memory.stats = {
		// 	cpu: {
		// 		getUsed: undefined,
		// 		limit: undefined,
		// 		bucket: undefined,
		// 		usage: {},
		// 	},
		// 	gcl: {},
		// 	colonies: {},
		// }
	}

	static cpu() {
		Memory.stats['cpu.getUsed'] = Game.cpu.getUsed();
		Memory.stats['cpu.limit'] = Game.cpu.limit;
		Memory.stats['cpu.bucket'] = Game.cpu.bucket;
	}

	static gcl() {
		Memory.stats['gcl.progress'] = Game.gcl.progress;
		Memory.stats['gcl.progressTotal'] = Game.gcl.progressTotal;
		Memory.stats['gcl.level'] = Game.gcl.level;
	}

	static memory() {
		Memory.stats['memory.used'] = RawMemory.get().length;
	}

	static log(key: string, value: number | { [key: string]: number } | undefined, truncateNumbers = true): void {
		if (truncateNumbers && value != undefined) {
			const decimals = 5;
			if (typeof value == 'number') {
				value = value.truncate(decimals);
			} else {
				for (let i in value) {
					value[i] = value[i].truncate(decimals);
				}
			}
		}
		Mem.setDeep(Memory.stats, key, value);
	}

	static accumulate(key: string, value: number): void {
		if (!Memory.stats[key]) {
			Memory.stats[key] = 0;
		}
		Memory.stats[key] += value;
	}

	static run() {
		// Record IVM heap statistics
		Memory.stats['cpu.heapStatistics'] = (<any>Game.cpu).getHeapStatistics();

		// Log GCL
		this.log('gcl.progress', Game.gcl.progress);
		this.log('gcl.progressTotal', Game.gcl.progressTotal);
		this.log('gcl.level', Game.gcl.level);
		// Log memory usage
		this.log('memory.used', RawMemory.get().length);
		// Log CPU

		this.log('cpu.limit', Game.cpu.limit);
		this.log('cpu.bucket', Game.cpu.bucket);
		const used = Game.cpu.getUsed();
		this.log('cpu.getUsed', used);
		Memory.stats.persistent.avgCPU = rollingAverage(used, Memory.stats.persistent.avgCPU, 100);
	}
}
