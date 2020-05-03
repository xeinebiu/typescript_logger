import {Logger} from '../Logger';
import {Log} from '../models/log.model';
import {MethodLoggerOptions} from './method-logger.options';

const STATUS_CALL = 'Call';
const STATUS_RETURN = 'Return';

/**
 * Create a Log Item from given arguments
 * @author xeinebiu
 */
const createLog = (
    timeStamp: Date,
    method: Function,
    options: MethodLoggerOptions,
    args: unknown[],
    result?: unknown
) => {
    let printArgs: unknown[] | undefined;
    if (options.args === true) {
        printArgs = args;
    } else if (Array.isArray(options.args)) {
        printArgs = [];
        options.args.forEach(x => printArgs!.push(args[x]));
    }
    const log = new Log({
        timeStamp,
        importance: options.importance ?? -1,
        method,
    });
    if (result) {
        log.data.result = result;
    }
    if (options.tag) {
        log.data.tag = options.tag;
    }
    if (printArgs) {
        log.data.args = printArgs;
    }
    return log;
};

/**
 * Log error and re-throw
 * @author xeinebiu
 */
const error = (logger: Logger, e: Error) => {
    logger.error(e.message);
    throw e;
};

/**
 * Create message to output when a method is called
 * @author xeinebiu
 */
const createMessage = (
    timeStamp: Date, key: string | symbol,
    status: 'Call' | 'Return'
) => {
    return `${timeStamp.toLocaleTimeString()}   ${timeStamp.toLocaleDateString()}` +
        `   ${status}: ${key.toString()}`;
};

/**
 * Output|Log
 * @author xeinebiu
 */
const output = (
    state: 'Call' | 'Return',
    key: string | symbol,
    originalMethod: Function,
    options: MethodLoggerOptions,
    args: unknown[],
    result?: unknown
) => {
    const timeStamp = new Date();
    const message = createMessage(timeStamp, key, state);
    const log = createLog(timeStamp, originalMethod, options, args, result);
    const logger = new Logger(log);
    logger.log(message);
    return logger;
};

/**
 * Append an empty Logger into [args] if specified on [options]
 * @author xeinebiu
 */
const inject = (options: MethodLoggerOptions, args: unknown[]) => {
    if (options.inject) {
        args.push(new Logger(new Log({})));
    }
};

/**
 * Decorators for logging methods
 * @author xeinebiu
 */
export class Method {

    /**
     * Log an asynchronous method
     * @param options Optional options for the current method
     * @author xeinebiu
     */
    public static asyncLog(options: MethodLoggerOptions = {importance: -1, args: false}) {
        // tslint:disable-next-line:only-arrow-functions
        return function(target: unknown, key: string | symbol, descriptor: PropertyDescriptor) {
            const originalMethod: Function = descriptor.value;
            descriptor.value = async function(...args: unknown[]) {
                const logger = output(STATUS_CALL, key, originalMethod, options, args);
                inject(options, args);
                let result: unknown | undefined;
                try {
                    result = await originalMethod.apply(this, args);
                } catch (e) {
                    error(logger, e);
                }
                if (options.printResult) {
                    output(STATUS_RETURN, key, originalMethod, options, args, result);
                }
                return result;
            };
            return descriptor;
        };
    }

    /**
     * Log a synchronous method
     * @param options Optional options for the current method
     * @author xeinebiu
     */
    public static log(options: MethodLoggerOptions = {importance: -1, args: false}) {
        // tslint:disable-next-line:only-arrow-functions
        return function(target: unknown, key: string | symbol, descriptor: PropertyDescriptor) {
            const originalMethod: Function = descriptor.value;
            descriptor.value = function(...args: unknown[]) {
                const logger = output(STATUS_CALL, key, originalMethod, options, args);
                inject(options, args);
                let result: unknown | undefined;
                try {
                    result = originalMethod.apply(this, args);
                } catch (e) {
                    error(logger, e);
                }
                if (options.printResult) {
                    output(STATUS_RETURN, key, originalMethod, options, args, result);
                }
                return result;
            };
            return descriptor;
        };
    }
}
