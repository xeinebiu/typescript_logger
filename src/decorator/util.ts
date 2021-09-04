import {ClassLoggerOptions} from './class-logger.decorator';

export const getLogClassOptions = (obj: object) => {
    return Object.getOwnPropertyDescriptor(obj, '__logging_options_')?.value as ClassLoggerOptions;
};
