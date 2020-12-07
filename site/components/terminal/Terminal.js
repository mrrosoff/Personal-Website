import React, {forwardRef, useState} from 'react';

import {Grid, Typography} from "@material-ui/core";
import {Emulator, HistoryKeyboardPlugin} from '../../../javascript-terminal';

import CommandInput from './CommandInput';
import PromptSymbol from "./PromptSymbol";

const Terminal = (props, ref) =>
{
  const [input, setInput] = useState('');
  const [emulatorState, setEmulatorState] = useState(props.emulatorState);

  let emulator = new Emulator();
  let historyKeyboardPlugin = new HistoryKeyboardPlugin(emulatorState);

  const onKeyDown = (e) =>
  {
    switch(e.key)
    {
      case 'ArrowUp':

        e.preventDefault();
        setInput(historyKeyboardPlugin.completeUp());
        break;

      case 'ArrowDown':

        e.preventDefault();
        setInput(historyKeyboardPlugin.completeDown());
        break;

      case 'Tab':

        e.preventDefault();
        setInput(emulator.autocomplete(emulatorState, input));
        break;

      case 'Enter':

        e.preventDefault();
        setEmulatorState(emulator.execute(emulatorState, input, [historyKeyboardPlugin], props.errorStr));
        setInput('');
        break;
    }
  }

  if(!emulatorState) return null;
  let outputs = emulatorState.getOutputs();

  return (
      <Grid container direction={"column"} justify={"flex-start"} spacing={1} onClick={() => focus()}>
        {
          outputs.length > 0 ?
              outputs.map((content, key) =>
                  <Grid item key={key} container direction={"column"}>
                    <Grid item>
                      <PromptSymbol theme={props.theme} {...props}>{props.promptSymbol}</PromptSymbol>
                    </Grid>
                    <Grid item>
                      {content.split("\n").map((line, key) => <Typography key={key}>{line}</Typography>)}
                    </Grid>
                  </Grid>
              ) : null
        }
        <Grid item key={outputs.length}>
          <CommandInput

              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              emulatorState={emulatorState}
              {...props}
          />
        </Grid>
      </Grid>
  );
}

export default forwardRef(Terminal);
