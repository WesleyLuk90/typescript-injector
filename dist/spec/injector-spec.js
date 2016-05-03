"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var typescript_injector_1 = require('../typescript-injector');
describe("Injector", function () {
    var Resolvable = (function () {
        function Resolvable() {
        }
        return Resolvable;
    }());
    it("should resolve a class", function () {
        var injector = new typescript_injector_1.Injector();
        injector.registerClass("Resolvable", Resolvable);
        expect(injector.resolve("Resolvable")).toBeTruthy();
        expect(injector.resolve("Resolvable")).toEqual(injector.resolve("Resolvable"));
    });
    it("should resolve dependencies", function () {
        var DependentResolvable = (function () {
            function DependentResolvable(resolvable) {
                this.resolvable = resolvable;
            }
            DependentResolvable.inject = ['Resolvable'];
            return DependentResolvable;
        }());
        var injector = new typescript_injector_1.Injector();
        injector.registerClass("Resolvable", Resolvable);
        injector.registerClass("DependentResolvable", DependentResolvable);
        var dependent = injector.resolve("DependentResolvable");
        expect(dependent.resolvable).toEqual(injector.resolve("Resolvable"));
    });
    it("should resolve an instance", function () {
        var resolvableInstance = {};
        var injector = new typescript_injector_1.Injector();
        injector.registerInstance("Resolvable", resolvableInstance);
        expect(injector.resolve("Resolvable")).toEqual(resolvableInstance);
    });
    it("should fail resolving a class with wrong dependencies", function () {
        var InvalidResolvable1 = (function () {
            function InvalidResolvable1(invalid) {
                this.invalid = invalid;
            }
            return InvalidResolvable1;
        }());
        var InvalidResolvable2 = (function () {
            function InvalidResolvable2() {
            }
            InvalidResolvable2.inject = ['InvalidResolvable1'];
            return InvalidResolvable2;
        }());
        var injector = new typescript_injector_1.Injector();
        injector.registerClass("InvalidResolvable1", InvalidResolvable1);
        injector.registerClass("InvalidResolvable2", InvalidResolvable2);
        expect(function () {
            injector.resolve("InvalidResolvable1");
        }).toThrowError();
        expect(function () {
            injector.resolve("InvalidResolvable2");
        }).toThrowError();
    });
    it("Should throw errors for non existent dependencies", function () {
        var Unresolvable = (function () {
            function Unresolvable() {
            }
            return Unresolvable;
        }());
        var injector = new typescript_injector_1.Injector();
        expect(function () {
            injector.resolve('Unresolvable');
        }).toThrowError(/Unresolvable dependency/);
    });
    it("Should throw errors for circular dependencies", function () {
        var A = (function () {
            function A(b) {
                this.b = b;
            }
            A.inject = ['B'];
            return A;
        }());
        var B = (function () {
            function B(a) {
                this.a = a;
            }
            B.inject = ['A'];
            return B;
        }());
        var injector = new typescript_injector_1.Injector();
        injector.registerClass('A', A);
        injector.registerClass('B', B);
        expect(function () {
            injector.resolve('B');
        }).toThrowError(/Circular dependency/);
    });
    it("Should allow the decorator to create the inject property", function () {
        var A = (function () {
            function A(b, c) {
                this.b = b;
                this.c = c;
            }
            A = __decorate([
                __param(0, typescript_injector_1.inject("B")),
                __param(1, typescript_injector_1.inject("C")), 
                __metadata('design:paramtypes', [Object, Object])
            ], A);
            return A;
        }());
        var injector = new typescript_injector_1.Injector();
        injector.registerClass('A', A);
        injector.registerInstance('B', {});
        injector.registerInstance('C', {});
        expect(A.inject[0]).toBe('B');
        expect(A.inject[1]).toBe('C');
        expect(function () {
            injector.resolve('A');
        }).not.toThrow();
    });
});
