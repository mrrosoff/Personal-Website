import Emulator from './emulator';
import HistoryKeyboardPlugin from './emulator/plugins/HistoryKeyboardPlugin';
import {
	CommandMapping,
	EmulatorState,
	EnvironmentVariables,
	FileSystem,
	History,
	Outputs
} from './emulator-state';
import {OutputFactory, OutputType} from './emulator-output';
import {DirOp, FileOp} from './fs';
import {parseOptions as OptionParser} from './parser';

import cat from "./commands/cat";
import cd from "./commands/cd";
import clear from "./commands/clear";
import cp from "./commands/cp";

const defaultCommandMapping = { cat, cd, clear, cp };

export {
	Emulator, HistoryKeyboardPlugin,
	defaultCommandMapping,
	EmulatorState, CommandMapping, EnvironmentVariables, FileSystem, History, Outputs, // state API
	OutputFactory, OutputType, // output API
	DirOp, FileOp, // file system API
	OptionParser
};
