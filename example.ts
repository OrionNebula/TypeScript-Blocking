import { BlockingAction, Wait, StreamRead, ConsoleInput } from './BlockingAction';
import ByReference from './ByReference';
import * as fs from 'fs';

function* exampleProc() : IterableIterator<BlockingAction> {
  let line = new ByReference<string>();
  let buf = new ByReference<Buffer>();

  console.log('Hello from a blocking method!');
  console.log("I'm going to wait 3 seconds.");
  yield new Wait(3000); //Yield this to wait for the specified number of milliseconds.

  console.log("Welcome back! How about some blocking IO?");
  console.log("What's your favorite color?");
  yield new ConsoleInput(line); //Yield this to wait for a line of input from the console.

  console.log("%s? Mine too!", line.value);
  console.log("Ok, now for something neat. Tell me a filename, and I'll give you the first 100 bytes!");
  yield new ConsoleInput(line); //Same thing here.

  let str = fs.createReadStream(line.value);
  yield new StreamRead(str, 100, buf); //Open a stream and yield until 100 bytes are read or the stream closes.
  console.log(buf.value.toString());
  str.close();

  console.log("Adding your own blocking methods is easy, just inherit from the BlockingAction class and override setup. This handles event registration and de-registration. Make sure you call this.handleNext when your event is triggered!");
}

BlockingAction.startBlocking(exampleProc);
