import cat from "./commands/cat";
import cd from "./commands/cd";
import clear from "./commands/clear";
import console from "./commands/console";
import cp from "./commands/cp";
import date from "./commands/date";
import diff from "./commands/diff";
import display from "./commands/display";
import echo from "./commands/echo";
import exportCmd from "./commands/export";
import find from "./commands/find";
import grep from "./commands/grep";
import head from "./commands/head";
import history from "./commands/history";
import icecream from "./commands/icecream";
import ls from "./commands/ls";
import man from "./commands/man";
import mkdir from "./commands/mkdir";
import mv from "./commands/mv";
import printenv from "./commands/printenv";
import pwd from "./commands/pwd";
import rm from "./commands/rm";
import rmdir from "./commands/rmdir";
import sed from "./commands/sed";
import sort from "./commands/sort";
import sudo from "./commands/sudo";
import tail from "./commands/tail";
import tee from "./commands/tee";
import touch from "./commands/touch";
import wc from "./commands/wc";
import whoami from "./commands/whoami";

const commands = {
    cat,
    cd,
    clear,
    console,
    cp,
    date,
    diff,
    display,
    echo,
    export: exportCmd,
    find,
    grep,
    head,
    history,
    icecream,
    ls,
    man,
    mv,
    mkdir,
    printenv,
    pwd,
    rm,
    rmdir,
    sed,
    sort,
    sudo,
    tail,
    tee,
    touch,
    wc,
    whoami
};

export default commands;
