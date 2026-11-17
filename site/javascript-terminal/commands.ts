import { DateTime } from "luxon";

import type { CommandMapping } from "./emulatorState/CommandMapping";
import * as alias from "./commands/alias";
import * as basename from "./commands/basename";
import * as cat from "./commands/cat";
import * as cd from "./commands/cd";
import * as clear from "./commands/clear";
import * as console from "./commands/console";
import * as cowsay from "./commands/cowsay";
import * as cp from "./commands/cp";
import * as cut from "./commands/cut";
import * as date from "./commands/date";
import * as diff from "./commands/diff";
import * as dirname from "./commands/dirname";
import * as display from "./commands/display";
import * as echo from "./commands/echo";
import * as exportCmd from "./commands/export";
import * as find from "./commands/find";
import * as flavor from "./commands/flavor";
import * as grep from "./commands/grep";
import * as haunt from "./commands/haunt";
import * as head from "./commands/head";
import * as history from "./commands/history";
import * as icecream from "./commands/icecream";
import * as ls from "./commands/ls";
import * as man from "./commands/man";
import * as mkdir from "./commands/mkdir";
import * as mv from "./commands/mv";
import * as play from "./commands/play";
import * as polaroid from "./commands/polaroid";
import * as printenv from "./commands/printenv";
import * as pwd from "./commands/pwd";
import * as rm from "./commands/rm";
import * as rmdir from "./commands/rmdir";
import * as sed from "./commands/sed";
import * as snake from "./commands/snake";
import * as sort from "./commands/sort";
import * as spotify from "./commands/spotify";
import * as su from "./commands/su";
import * as sudo from "./commands/sudo";
import * as tail from "./commands/tail";
import * as tee from "./commands/tee";
import * as touch from "./commands/touch";
import * as uniq from "./commands/uniq";
import * as wc from "./commands/wc";
import * as which from "./commands/which";
import * as whoami from "./commands/whoami";

const currentDate = DateTime.now();
const isHalloween = currentDate.month === 10 && currentDate.day === 31;

const commands: CommandMapping = {
    alias,
    basename,
    cat,
    cd,
    clear,
    console,
    cowsay,
    cp,
    cut,
    date,
    diff,
    dirname,
    display,
    echo,
    export: exportCmd,
    find,
    flavor,
    grep,
    head,
    history,
    icecream,
    ls,
    man,
    mkdir,
    mv,
    play,
    polaroid,
    printenv,
    pwd,
    rm,
    rmdir,
    sed,
    snake,
    sort,
    spotify,
    su,
    sudo,
    tail,
    tee,
    touch,
    uniq,
    wc,
    which,
    whoami
};

if (isHalloween) {
    commands.haunt = haunt;
}

export default commands;
