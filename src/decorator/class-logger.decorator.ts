/**
 * Options to use for applied class type
 *
 * @author xeinebiu
 */
export interface ClassLoggerOptions {
    tag: string | undefined;
}

/**
 * Injects the given [options] to applied type of a class
 *
 * @author xeinebiu
 */
export function LogClass(options: ClassLoggerOptions) {
    return function reportableClassDecorator<T extends new(...args: any[]) => {}>(constructor: T) {
        return class extends constructor {
            // tslint:disable-next-line:variable-name
            __logging_options_ = options;
        };
    };
}
