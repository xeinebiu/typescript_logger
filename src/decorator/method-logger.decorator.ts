import {Logger} from '../Logger';
import {Log} from '../models/log.model';
import {MethodLoggerOptions} from './method-logger.options';
import {getLogClassOptions} from './util';

const STATE_CALL = 'call';
const STATE_RETURN = 'return';

type STATE = 'call' | 'return';

/**
 * Parameters needed to output a log
 *
 * @author xeinebiu
 */
interface OutputParams {

    /**
     * Arguments passed to [method]
     */
    args: unknown[];

    /**
     * Tag of host class
     */
    classTag?: string;

    /**
     * Name of the method
     */
    key: string | symbol;

    /**
     * Reference to the executed method
     */
    method: Function;

    /**
     * Options assigned to [method]
     */
    options: MethodLoggerOptions;

    /**
     * Result returned from [method]
     */
    result?: unknown;

    /**
     * State of the method, can be `call` | `return`
     */
    state: STATE;
}

/**
 * Parameters needed to create a log
 *
 * @author xeinebiu
 */
interface CreateLogParams {

    /**
     * Arguments passed to [method]
     */
    args: unknown[];

    /**
     * Tag of host class
     */
    classTag?: string;

    /**
     * Reference to the executed method
     */
    method: Function;

    /**
     * Options assigned to [method]
     */
    options: MethodLoggerOptions;

    /**
     * Result returned from [method]
     */
    result?: unknown;

    /**
     * Date when the event happened
     */
    timeStamp: Date;
}

/**
 * Parameters needed to create a message
 *
 * @author xeinebiu
 */
interface CreateMessageParams {
    /**
     * Tag of host class
     */
    classTag?: string;

    /**
     * Name of the method
     */
    key: string | symbol;

    /**
     * State of the method, can be `call` | `return`
     */
    state: STATE;

    /**
     * Date when the event happened
     */
    timeStamp: Date;
}

/**
 * Create a Log Item from given arguments
 *
 * @author xeinebiu
 */
const createLog = (params: CreateLogParams) => {
    let printArgs: unknown[] | undefined;

    if (params.options.args === true) {
        printArgs = params.args;
    } else if (Array.isArray(params.options.args)) {
        printArgs = [];
        params.options.args.forEach(x => printArgs!.push(params.args[x]));
    }

    const log = new Log({
        timeStamp: params.timeStamp,
        importance: params.options.importance ?? -1,
        method: params.method,
    });

    if (params.result) {
        log.data.result = params.result;
    }

    if (params.options.tag) {
        log.data.tag = params.options.tag;
    }

    if (printArgs) {
        log.data.args = printArgs;
    }

    return log;
};

/**
 * Log error and re-throw [e]
 *
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
const createMessage = ({key, state, classTag, timeStamp}: CreateMessageParams) => {
    return `${classTag ? classTag + '   ' : ''}${timeStamp.toLocaleTimeString()}   ${timeStamp.toLocaleDateString()}` +
        `   ${state}: ${key.toString()}`;
};

/**
 * Output|Log
 * @author xeinebiu
 */
const output = (params: OutputParams) => {
    const timeStamp = new Date();
    const message = createMessage({
        key: params.key,
        state: params.state,
        classTag: params.classTag,
        timeStamp
    });

    const log = createLog({
        classTag: params.classTag,
        result: params.result,
        args: params.args,
        method: params.method,
        options: params.options,
        timeStamp
    });

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
        return function (target: unknown, key: string | symbol, descriptor: PropertyDescriptor) {
            const originalMethod: Function = descriptor.value;
            descriptor.value = async function (...args: unknown[]) {
                const logClassTag = getLogClassOptions(this)?.tag;

                const logger = output({
                    options,
                    args,
                    key,
                    result: undefined,
                    method: originalMethod,
                    classTag: logClassTag,
                    state: STATE_CALL
                });

                inject(options, args);

                let result: unknown | undefined;
                try {
                    result = await originalMethod.apply(this, args);
                } catch (e) {
                    error(logger, e);
                }

                if (options.printResult) {
                    output({
                        options,
                        args,
                        result,
                        key,
                        method: originalMethod,
                        classTag: logClassTag,
                        state: STATE_RETURN
                    });

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
        return function (target: unknown, key: string | symbol, descriptor: PropertyDescriptor) {
            // @ts-ignore
            const originalMethod: Function = descriptor.value;
            descriptor.value = function (...args: unknown[]) {

                const logClassTag = getLogClassOptions(this)?.tag;
                const logger = output({
                    options,
                    args,
                    key,
                    result: undefined,
                    method: originalMethod,
                    classTag: logClassTag,
                    state: STATE_CALL
                });

                inject(options, args);

                let result: unknown | undefined;
                try {
                    result = originalMethod.apply(this, args);
                } catch (e) {
                    error(logger, e);
                }

                if (options.printResult) {
                    output({
                        options,
                        args,
                        key,
                        result,
                        method: originalMethod,
                        classTag: logClassTag,
                        state: STATE_RETURN
                    });
                }

                return result;
            };

            return descriptor;
        };
    }
}
