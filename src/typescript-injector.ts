export interface TConstructor<T> {
	new (...args: any[]): T;
	inject?: string[];
	name?: string;
}

interface InstanceLookup {
	[k: string]: any;
}

interface ClassLookup {
	[k: string]: TConstructor<any>;
}

export class Injector {
	private instanceLookup: InstanceLookup = {};
	private classLookup: ClassLookup = {};
	constructor() {

	}
	registerClass<T>(dependency: string, klass: TConstructor<T>) {
		this.assertNotRegistered(dependency);
		this.classLookup[dependency] = klass;
	}
	registerInstance<T>(dependency: string, instance: T) {
		this.assertNotRegistered(dependency);
		this.instanceLookup[dependency] = instance;
	}
	private assertNotRegistered(dependency: string) {
		if (this.instanceLookup[dependency]) {
			throw new Error("Dependency " + dependency + " is already registered as an instance");
		}
		if (this.classLookup[dependency]) {
			throw new Error("Dependency " + dependency + " is already registered as a class");
		}
	}
	resolve<T>(dependency: string, trail?: string[]): T {
		trail = trail || [];
		if (trail.indexOf(dependency) > -1) {
			throw new Error("Circular dependency " + trail.join(" -> "));
		}
		trail.push(dependency);

		if (this.instanceLookup[dependency]) {
			return this.instanceLookup[dependency];
		} else if (this.classLookup[dependency]) {
			var klass = this.classLookup[dependency];
			var inject = klass.inject || [];
			var dependencies = inject.map((dependency) => {
				var thisTrail = trail.slice();
				return this.resolve(dependency, thisTrail);
			});
			var instance = this.buildClass(klass, dependencies);

			this.instanceLookup[dependency] = instance;
			return instance;
		} else {
			throw new Error("Unresolvable dependency " + dependency);
		}
	}
	private buildClass<T>(klass: TConstructor<T>, dependencies: any[]) {
		var match = klass.toString().match(/^function \w+\(([^\)]*)\)/);
		if (!match) {
			throw new Error("Failed to match function definition." + klass.toString());
		}
		var parameters: string[];
		if (match[1]) {
			parameters = match[1].split(",");
		} else {
			parameters = [];
		}
		if (parameters.length != dependencies.length) {
			throw new Error("Dependencies and inject list do not match." + klass.name + ": " + JSON.stringify(parameters) + " != " + JSON.stringify(dependencies));
		}
		var instance = Object.create(klass.prototype);

		instance.constructor = klass;

		klass.apply(instance, dependencies);
		return instance;
	}
}

