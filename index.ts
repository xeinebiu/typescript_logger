import {Method} from './src/decorator/method-logger.decorator';
import {OutputType} from './src/enums/output-type.enum';
import {Logger} from './src/Logger';
import {Log} from './src/models/log.model';

class Demo {

    @Method.log({inject: true})
    public add(args: number[], logger?: Logger): number {
        logger?.debug('Add method is called');
        let sum = 0;
        args.forEach(x => sum += x);
        logger!.params.data.result = sum;
        logger?.debug(`Total: ${sum}`);
        return sum;
    }

    @Method.asyncLog({importance: 1, args: true, printResult: false, tag: 'TAG'})
    public asyncSayHelloWorld(): Promise<string> {
        return new Promise((resolve) => {
            resolve(this.sayHelloWorld());
        });
    }

    @Method.log({importance: 1, args: true, printResult: true, tag: 'TAG'})
    public sayHelloWorld(): string {
        const hello = this.getHello();
        const world = this.getWorld();
        const helloWorld = `${hello} ${world}`;
        console.log(helloWorld);
        return helloWorld;
    }

    @Method.log()
    private getHello(): string {
        return `Hello`;
    }

    @Method.log()
    private getWorld(): string {
        return 'World';
    }
}

Logger.listener = {
    beforeLog: (log: Log, outputType: OutputType) => {
        return log.data.tag === 'login';
    },
    afterLog: (log: Log, outputType: OutputType) => {

    },
    applyStyle: (log: Log, outputType: OutputType) => {
        if (outputType === OutputType.log) {
            return 'background: #8c7ae6; color: #2f3640; padding: 3px';
        }
        return true;
    }
};
console.clear();
new Demo().add([1, 5, 10, 20]);
