export interface TConstructor<T> {
    new (...args: any[]): T;
    inject?: string[];
    name?: string;
}
export declare class Injector {
    private instanceLookup;
    private classLookup;
    constructor();
    registerClass<T>(dependency: string, klass: TConstructor<T>): void;
    registerInstance<T>(dependency: string, instance: T): void;
    private assertNotRegistered(dependency);
    resolve<T>(dependency: string, trail?: string[]): T;
    private buildClass<T>(klass, dependencies);
}
export declare function inject(dependencyName: string): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
