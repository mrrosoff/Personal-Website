import Emulator from './emulator';
import HistoryKeyboardPlugin from './emulator/plugins/HistoryKeyboardPlugin';

import CommandMapping from "./emulator-state/CommandMapping";
import EmulatorState from "./emulator-state/EmulatorState";
import EnvironmentVariables from "./emulator-state/EnvironmentVariables";
import FileSystem from "./emulator-state/FileSystem";
import History from "./emulator-state/History";
import Outputs from "./emulator-state/Outputs";

import DirOp from './fs/operations-with-permissions/directory-operations';
import FileOp from './fs/operations-with-permissions/file-operations';

import DefaultCommandMapping from "./commands";
import {parseOptions as OptionParser} from './parser';

export {
	Emulator, HistoryKeyboardPlugin, DefaultCommandMapping,
	EmulatorState, CommandMapping, EnvironmentVariables, FileSystem, History, Outputs,
	DirOp, FileOp, OptionParser
};
