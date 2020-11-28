import Emulator from 'react-terminal-component/javascript-terminal/src/emulator';
import HistoryKeyboardPlugin
	from 'react-terminal-component/javascript-terminal/src/emulator/plugins/HistoryKeyboardPlugin';
import {
	CommandMapping,
	EmulatorState,
	EnvironmentVariables,
	FileSystem,
	History,
	Outputs
} from 'react-terminal-component/javascript-terminal/src/emulator-state';
import {OutputFactory, OutputType} from 'react-terminal-component/javascript-terminal/src/emulator-output';
import {DirOp, FileOp} from 'react-terminal-component/javascript-terminal/src/fs';
import {OptionParser} from 'react-terminal-component/javascript-terminal/src/parser';
import defaultCommandMapping from 'react-terminal-component/javascript-terminal/src/commands';

// Any class/function exported here forms part of the emulator API
export {
	Emulator, HistoryKeyboardPlugin,
	defaultCommandMapping,
	EmulatorState, CommandMapping, EnvironmentVariables, FileSystem, History, Outputs, // state API
	OutputFactory, OutputType, // output API
	DirOp, FileOp, // file system API
	OptionParser // parser API
};
