import { parseOptions } from "../parser";

export const optDef = {};

const functionDef = (state, commandOptions) => {
	const { options, argv } = parseOptions(commandOptions, optDef);

	if (argv.length !== 1) {
		return {};
	}

	try {
		const command = argv[0];
		switch (command) {
			case "cat":
				return {
					output:
						"NAME\n" +
						"     cat -- concatenate and print files\n" +
						"\n" +
						"SYNOPSIS\n" +
						"     cat [file ...]\n" +
						"\n" +
						"DESCRIPTION\n" +
						"     The cat utility reads files sequentially, writing them to the standard\n" +
						"     output."
				};

			case "cd":
				return {
					output:
						"NAME\n" +
						"    cd - Change the shell working directory.\n" +
						"\n" +
						"SYNOPSIS\n" +
						"    cd [dir]\n" +
						"\n" +
						"DESCRIPTION\n" +
						"    Change the shell working directory."
				};
			case "clear":
				return {
					output:
						"NAME\n" +
						"     clear -- clear the terminal screen\n" +
						"\n" +
						"SYNOPSIS\n" +
						"     clear\n" +
						"\n" +
						"DESCRIPTION\n" +
						"     Clears your screen if it is possible, including its scrollback buffer."
				};
			case "cp":
				return {
					output:
						"NAME\n" +
						"     cp -- copy files and directories\n" +
						"\n" +
						"SYNOPSIS\n" +
						"     cp [OPTION] SOURCE DEST\n" +
						"\n" +
						"DESCRIPTION\n" +
						"     Copy SOURCE to DEST, or multiple SOURCE(s) to DIRECTORY."
				};
			case "display":
				return {
					output:
						"NAME\n" +
						"     display -- display image and video files\n" +
						"\n" +
						"SYNOPSIS\n" +
						"     display [file ...]\n" +
						"\n" +
						"DESCRIPTION\n" +
						"     Views files sequentially, writing them to the standard output."
				};
			case "echo":
				return {
					output:
						"NAME\n" +
						"     echo -- display a line of text\n" +
						"\n" +
						"SYNOPSIS\n" +
						"     echo STRING\n" +
						"\n" +
						"DESCRIPTION\n" +
						"     The echo prints either the specified string or an environment variable to\n" +
						"	 the standard output."
				};
			case "ls":
				return {
					output:
						"NAME\n" +
						"     ls -- list directory contents\n" +
						"\n" +
						"SYNOPSIS\n" +
						"     ls [file ...]\n" +
						"\n" +
						"DESCRIPTION\n" +
						"     For each operand that names a file of a type other than directory, ls\n" +
						"     displays its name as well as any requested, associated information.  For\n" +
						"     each operand that names a file of type directory, ls displays the names\n" +
						"     of files contained within that directory, as well as any requested, associated\n" +
						"     information."
				};
			default:
				return {
					output: ""
				};
		}
	} catch (err) {
		return { output: err.message, type: "error" };
	}
};

export default { optDef, functionDef };
