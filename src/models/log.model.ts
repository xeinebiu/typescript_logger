/**
 * Represents single log
 * @author xeinebiu
 */
export class Log {
    constructor(
        public readonly data: {
            args?: unknown[];
            importance?: number;
            method?: Function;
            result?: unknown;
            tag?: string
            timeStamp?: Date;
        }) {
    }
}
