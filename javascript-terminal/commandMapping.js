import cat from "./commands/cat";
import cd from "./commands/cd";
import clear from "./commands/clear";
import cp from "./commands/cp";
import display from "./commands/display";
import echo from "./commands/echo";
import head from "./commands/head";
import history from "./commands/history";
import ls from "./commands/ls";
import man from "./commands/man";
import mkdir from "./commands/mkdir";
import printenv from "./commands/printenv";
import pwd from "./commands/pwd";
import rm from "./commands/rm";
import rmdir from "./commands/rmdir";
import tail from "./commands/tail";
import touch from "./commands/touch";
import whoami from "./commands/whoami";

const commandMapping = {
	cat, cd, clear, cp, display,
	echo, head, history, ls, man,
	mkdir, printenv, pwd, rm, rmdir,
	tail, touch, whoami
}

export default commandMapping;
