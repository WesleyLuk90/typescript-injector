/// <reference path="../../typings/jasmine/jasmine.d.ts"/>
import {Injector, inject} from '../typescript-injector';

describe("Injector", function() {
	class Resolvable { }
	it("should resolve a class", function(){
		var injector = new Injector();
		injector.registerClass<Resolvable>("Resolvable", Resolvable);

		expect(injector.resolve<Resolvable>("Resolvable")).toBeTruthy();

		expect(injector.resolve<Resolvable>("Resolvable")).toEqual(injector.resolve<Resolvable>("Resolvable"));
	});
	it("should resolve dependencies", function(){
		class DependentResolvable {
			static inject = ['Resolvable'];
			constructor(public resolvable: Resolvable){

			}
		}
		var injector = new Injector();
		injector.registerClass<Resolvable>("Resolvable", Resolvable);
		injector.registerClass<DependentResolvable>("DependentResolvable", DependentResolvable);

		var dependent = injector.resolve<DependentResolvable>("DependentResolvable");
		expect(dependent.resolvable).toEqual(injector.resolve<Resolvable>("Resolvable"));
	});

	it("should resolve an instance", function(){
		var resolvableInstance: Resolvable = {};

		var injector = new Injector();
		injector.registerInstance<Resolvable>("Resolvable", resolvableInstance);

		expect(injector.resolve<Resolvable>("Resolvable")).toEqual(resolvableInstance);
	});

	it("should fail resolving a class with wrong dependencies", function(){
		class InvalidResolvable1 {
			constructor(public invalid: InvalidResolvable2){

			}
		}
		class InvalidResolvable2 {
			static inject = ['InvalidResolvable1'];
			constructor(){

			}
		}
		var injector = new Injector();
		injector.registerClass<InvalidResolvable1>("InvalidResolvable1", InvalidResolvable1);
		injector.registerClass<InvalidResolvable2>("InvalidResolvable2", InvalidResolvable2);

		expect(function() {
			injector.resolve("InvalidResolvable1");
		}).toThrowError();
		expect(function() {
			injector.resolve("InvalidResolvable2");
		}).toThrowError();
	});

	it("Should throw errors for non existent dependencies", function() {

		class Unresolvable {
		}
		var injector = new Injector();
		expect(function() {
			injector.resolve<Unresolvable>('Unresolvable')
		}).toThrowError(/Unresolvable dependency/);
	});

	it("Should throw errors for circular dependencies", function() {

		class A {
			static inject = ['B'];
			constructor(public b:B){}
		}
		class B {
			static inject = ['A'];
			constructor(public a: A) { }
		}

		var injector = new Injector();
		injector.registerClass<A>('A', A);
		injector.registerClass<B>('B', B);

		expect(function() {
			injector.resolve<B>('B')
		}).toThrowError(/Circular dependency/);
	});

	it("Should allow the decorator to create the inject property", () =>{
		type B = any;
		type C = any;
		class A {
			constructor(@inject("B") public b:B, @inject("C") public c:C){

			}
		}

		var injector = new Injector();
		injector.registerClass<A>('A', A);
		injector.registerInstance<B>('B', {});
		injector.registerInstance<C>('C', {});

		expect((<any>A).inject[0]).toBe('B');
		expect((<any>A).inject[1]).toBe('C');

		expect(function() {
			injector.resolve<A>('A')
		}).not.toThrow();
	});
});
