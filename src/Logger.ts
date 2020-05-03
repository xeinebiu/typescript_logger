import {OutputType} from './enums/output-type.enum';
import {Log} from './models/log.model';

/**
 * Default styles for output
 * @author xeinebiu
 */
export enum LogStyle {
    debug = 'background: #2d3436; color: #dfe6e9;',
    error = 'background: #d63031; color: #dfe6e9;',
    info = 'background: #0984e3; color: #dfe6e9;',
    log = 'color: #2d3436;',
    trace = 'background: #6c5ce7; color: #dfe6e9;',
    warn = 'background: #ffeaa7; color: #2d3436;'
}

/**
 * Singleton [Logger] instance
 * @author xeinebiu
 */
export class Logger {

    public static listener: {
        afterLog: (log: Log, outputType: OutputType) => void,
        applyStyle: (log: Log, outputType: OutputType) => string | boolean,
        beforeLog: (log: Log, outputType: OutputType) => boolean
    } | undefined;

    /**
     * Output given [message] and [log] as [outputType]
     * @author xeinebiu
     */
    private static output(message: string, log: Log, outputType: OutputType): void {
        if (!this.listener || !this.listener.beforeLog(log, outputType)) {
            return;
        }

        const applyStyle = this.listener.applyStyle(log, outputType);
        if (applyStyle === false) {
            console[outputType](message, log);
        } else {
            let style = LogStyle[outputType].toString();
            if (typeof applyStyle === 'string') {
                style = applyStyle;
            }
            console[outputType](`%c${message}`, style, log);
        }

        this.listener.afterLog(log, outputType);
    }

    constructor(public readonly params: Log) {

    }

    /**
     * Output debug [message] on console
     * @author xeinebiu
     */
    public debug(message: string): void {
        Logger.output(message, this.params, OutputType.debug);
    }

    /**
     * Output error [message] on console
     * @author xeinebiu
     */
    public error(message: string): void {
        Logger.output(message, this.params, OutputType.error);
    }

    /**
     * Output info [message] on console
     * @author xeinebiu
     */
    public info(message: string): void {
        Logger.output(message, this.params, OutputType.info);
    }

    /**
     * Output log [message] on console
     * @author xeinebiu
     */
    public log(message: string): void {
        Logger.output(message, this.params, OutputType.log);
    }

    /**
     * Output trace [message] on console
     * @author xeinebiu
     */
    public trace(message: string): void {
        Logger.output(message, this.params, OutputType.trace);
    }

    /**
     * Output warn [message] on console
     * @author xeinebiu
     */
    public warn(message: string): void {
        Logger.output(message, this.params, OutputType.warn);
    }
}
