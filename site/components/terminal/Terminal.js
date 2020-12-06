import React, {useRef, useState} from 'react';

import {Grid} from "@material-ui/core";
import {Emulator, HistoryKeyboardPlugin} from '../../../javascript-terminal';

import CommandInput from './CommandInput';
import OutputList from './OutputList';

const Terminal = props =>
{
  let inputRef = useRef(null);

  const [input, setInput] = useState('');
  const [emulatorState, setEmulatorState] = useState(props.emulatorState);

  let emulator = new Emulator();
  let historyKeyboardPlugin = new HistoryKeyboardPlugin(emulatorState);

  const focus = () =>
  {
    if(inputRef.current) inputRef.current.focus();
  }

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

  return (
      <Grid container direction={"column"} spacing={2} onClick={() => focus()} style={{width: "100%", height: "100%"}}>
        {
          emulatorState.getOutputs().length > 0 ?
              <Grid item>
                <OutputList emulatorState={emulatorState} {...props}/>
              </Grid> : null
        }
        <Grid item>
          <CommandInput
              ref={inputRef}
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

export default Terminal;
