// Default ordering for processing spawning requests and prioritizing overlords

export var OverlordPriority = {
	emergency: {				// Colony-wide emergencies such as a catastrohic crash
		bootstrap: 0
	},

	core: {						// Functionality related to spawning more creeps
		queen  : 100,
		manager: 101,
	},

	defense: {					// Defense of local and remote rooms
		meleeDefense : 200,
		rangedDefense: 201,
		guard        : 202,
		repair       : 203,
	},

	warSpawnCutoff: 299, 		// Everything past this is non-critical and won't be spawned in case of emergency

	realTime: { 				// Requests that a user is typically actively waiting for in real life
		claim           : 300,
		pioneer         : 301,
		controllerAttack: 399   // Reserved to give controller attacks a high priority
	},

	ownedRoom: { 				// Operation of an owned room
		firstTransport: 400,		// High priority to spawn the first transporter
		mine          : 401,
		work          : 402,
		mineral       : 403,
		transport     : 404,		// Spawn the rest of the transporters
	},

	offense: {					// Offensive operations like raids or sieges
		destroy  : 500,
		healPoint: 501,
		siege    : 502,
	},

	upgrading: {				// Spawning upgraders
		upgrade: 600,
	},

	collectionUrgent: { 		// Collecting resources that are time sensitive, like decaying resources on ground
		haul: 700
	},

	scouting: {
		stationary  : 800,
		randomWalker: 801
	},

	remoteRoom: { 				// Operation of a remote room. Allows colonies to restart one room at a time.
		reserve      : 900,
		mine         : 901,
		roomIncrement: 5, 			// remote room priorities are incremented by this for each outpost
	},

	remoteSKRoom: {
		sourceReaper : 1000,
		mineral      : 1001,
		mine         : 1002,
		roomIncrement: 5,
	},

	collection: {				// Non-urgent collection of resources, like from a deserted storage
		haul: 1100
	},

	default: 99999				// Default overlord priority to ensure it gets run last
};