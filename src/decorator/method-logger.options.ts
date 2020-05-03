/**
 * Represents options for single method
 * @author xeinebiu
 */
export interface MethodLoggerOptions {

    /**
     * <p><b>true</b> to print all arguments, <b>false</b> otherwise</p>
     * <p><i>or</i></p>
     * <p>Specify array of indexes to print specific args only</p>
     */
    args?: boolean | number[];

    /**
     * Importance Level
     */
    importance?: number;

    /**
     * Inject instance of the [Logger]
     */
    inject?: boolean;

    /**
     * `true` to print the return result, `false` otherwise
     */
    printResult?: boolean;

    /**
     * Tag helpful to identify the log when the code is minified
     */
    tag?: string;
}
