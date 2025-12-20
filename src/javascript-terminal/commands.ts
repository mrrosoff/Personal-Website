import alias from "./commands/alias";
import basename from "./commands/basename";
import cat from "./commands/cat";
import cd from "./commands/cd";
import clear from "./commands/clear";
import console from "./commands/console";
import cp from "./commands/cp";
import cut from "./commands/cut";
import date from "./commands/date";
import diff from "./commands/diff";
import dirname from "./commands/dirname";
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
import uniq from "./commands/uniq";
import wc from "./commands/wc";
import which from "./commands/which";
import whoami from "./commands/whoami";

const commands = {
    alias,
    basename,
    cat,
    cd,
    clear,
    console,
    cp,
    cut,
    date,
    diff,
    dirname,
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
    uniq,
    wc,
    which,
    whoami
};

export default commands;
