import ByReference from './ByReference';
import * as readline from 'readline';

/** Base class for all blocking methods. */
export abstract class BlockingAction {
  type: string;
  /** Called when a blocking action is first hit. This sets up all event handlers. */
  abstract setup(iter: IterableIterator<BlockingAction>): void;

  /** Called once a blocking action has finished its task. This resumes execution. */
  handleNext(iter: IterableIterator<BlockingAction>): void {
    let n = iter.next();

    if(n.done)
      return;

    n.value.setup(iter);
  };

  /** Invoke a method as a blocking function, setting up the internal mechanics. */
  public static startBlocking(func: () => IterableIterator<BlockingAction>): void {
    let iter = func();
    let n = iter.next();
    if(n.done)
      return;

    n.value.setup(iter);
  }
}

/** Yield a Wait object to pause your code for a certain number of milliseconds. */
export class Wait extends BlockingAction {
  wait: number;

  constructor(timeout : number) {
    super();
    this.wait = timeout;
  }

  setup(iter: IterableIterator<BlockingAction>) : void {
    let t = this;
    setTimeout(function(){
      t.handleNext(iter);
    }, this.wait);
  }
}

/** Yield a StreamRead object to block until an exact number of bytes are read or the stream ends. */
export class StreamRead extends BlockingAction {
  private stream: any;
  private out: ByReference<Buffer>;
  private len: number;
  constructor(str: any, bytes: number, outObj: ByReference<Buffer>) {
    super();
    this.stream = str;
    this.len = bytes;
    this.out = outObj;
  }

  setup(iter: IterableIterator<BlockingAction>) {
    let t = this;
    let handler = () => {
      t.out.value = t.stream.read(t.len);
      if(t.out.value != null) {
        t.stream.removeListener('readable', handler);
        t.handleNext(iter);
      }
    };
    this.stream.on('readable', handler);
  }
}

/** Yield a ConsoleInput object to block until a line is read from the console. */
export class ConsoleInput extends BlockingAction {
  private out: ByReference<string>;
  constructor(outObj: ByReference<string>) {
    super();
    this.out = outObj;
  }

  setup(iter: IterableIterator<BlockingAction>) {
    let t = this;
    const rl = readline.createInterface({
      input: process.stdin
    });

    let handler = line => {
      t.out.value = line;
      rl.close();
      t.handleNext(iter);
    };

    rl.once('line', handler);
  }
}
