import React, {forwardRef, useEffect, useState} from 'react';

import {Grid} from "@material-ui/core";
import {Emulator, HistoryKeyboardPlugin} from '../../../javascript-terminal';

import CommandInput from './CommandInput';

import OutputHeader from "./output/OutputHeader";
import OutputText from "./output/OutputText";
import OutputError from "./output/OutputError";

const Terminal = (props, ref) =>
{
  const [input, setInput] = useState('');
  const [emulatorState, setEmulatorState] = useState(props.emulatorState);
  const [outputs, setOutputs] = useState([]);

  let emulator = new Emulator();
  let historyKeyboardPlugin = new HistoryKeyboardPlugin(emulatorState);

  const onKeyDown = (e) =>
  {
    switch(e.key)
    {
      case 'ArrowUp':

        e.preventDefault();
        let up = historyKeyboardPlugin.completeUp();
        setInput(up ? up : '')
        break;

      case 'ArrowDown':

        e.preventDefault();
        let down = historyKeyboardPlugin.completeDown();
        setInput(down ? down : '')
        break;

      case 'Tab':

        e.preventDefault();
        setInput(emulator.autocomplete(emulatorState, input));
        break;

      case 'Enter':

        e.preventDefault();
        setEmulatorState(emulator.execute(emulatorState, input, [historyKeyboardPlugin], props.errorStr));
        setInput("");
        setOutputs(calculateOutputs());
        break;
    }
  }

  if(!emulatorState) return null;

  const calculateOutputs = () =>
  {
    return emulatorState.getOutputs().map((content, key) =>
        <Grid item key={key} container direction={"column"}>
          <Grid item>
            <OutputHeader cwd={content.cwd} {...props}>{content.command}</OutputHeader>
          </Grid>
          {content.type === "error" ?
              <Grid item>
                <OutputError {...props}>{content.output}</OutputError>
              </Grid> :
              <Grid item>
                <OutputText {...props}>{content.output}</OutputText>
              </Grid>
          }
        </Grid>
    );
  }

  useEffect(() => setOutputs(calculateOutputs()), [input]);

  return (
      <Grid container direction={"column"} justify={"flex-start"} spacing={1}>
        {outputs}
        <Grid item key={outputs.length}>
          <CommandInput
              ref={ref}
              value={input}
              onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown}
              emulatorState={emulatorState}
              {...props}
          />
        </Grid>
      </Grid>
  );
}

export default forwardRef(Terminal);
