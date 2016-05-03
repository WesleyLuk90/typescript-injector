"use strict";
var Injector = (function () {
    function Injector() {
        this.instanceLookup = {};
        this.classLookup = {};
    }
    Injector.prototype.registerClass = function (dependency, klass) {
        this.assertNotRegistered(dependency);
        this.classLookup[dependency] = klass;
    };
    Injector.prototype.registerInstance = function (dependency, instance) {
        this.assertNotRegistered(dependency);
        this.instanceLookup[dependency] = instance;
    };
    Injector.prototype.assertNotRegistered = function (dependency) {
        if (this.instanceLookup[dependency]) {
            throw new Error("Dependency " + dependency + " is already registered as an instance");
        }
        if (this.classLookup[dependency]) {
            throw new Error("Dependency " + dependency + " is already registered as a class");
        }
    };
    Injector.prototype.resolve = function (dependency, trail) {
        var _this = this;
        trail = trail || [];
        if (trail.indexOf(dependency) > -1) {
            throw new Error("Circular dependency " + trail.join(" -> "));
        }
        trail.push(dependency);
        if (this.instanceLookup[dependency]) {
            return this.instanceLookup[dependency];
        }
        else if (this.classLookup[dependency]) {
            var klass = this.classLookup[dependency];
            var inject = klass.inject || [];
            var dependencies = inject.map(function (dependency) {
                var thisTrail = trail.slice();
                return _this.resolve(dependency, thisTrail);
            });
            var instance = this.buildClass(klass, dependencies);
            this.instanceLookup[dependency] = instance;
            return instance;
        }
        else {
            throw new Error("Unresolvable dependency " + dependency);
        }
    };
    Injector.prototype.buildClass = function (klass, dependencies) {
        var match = klass.toString().match(/^function \w+\(([^\)]*)\)/);
        if (!match) {
            throw new Error("Failed to match function definition." + klass.toString());
        }
        var parameters;
        if (match[1]) {
            parameters = match[1].split(",");
        }
        else {
            parameters = [];
        }
        if (parameters.length != dependencies.length) {
            throw new Error("Dependencies and inject list do not match." + klass.name + ": " + JSON.stringify(parameters) + " != " + JSON.stringify(dependencies));
        }
        var instance = Object.create(klass.prototype);
        instance.constructor = klass;
        klass.apply(instance, dependencies);
        return instance;
    };
    return Injector;
}());
exports.Injector = Injector;
function inject(dependencyName) {
    return function (target, propertyKey, parameterIndex) {
        if (!target.inject) {
            target.inject = [];
        }
        target.inject[parameterIndex] = dependencyName;
    };
}
exports.inject = inject;
