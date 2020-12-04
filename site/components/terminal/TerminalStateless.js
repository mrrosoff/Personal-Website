import React, {useRef, useState} from 'react';

import {ThemeProvider} from 'styled-components';

import {Emulator, HistoryKeyboardPlugin} from '../../../javascript-terminal/lib/terminal';

import TerminalContainer from './TerminalContainer';
import CommandInput from './CommandInput';
import OutputList from './OutputList';

const TerminalStateless = props =>
{
  let emulator = new Emulator();
  let historyKeyboardPlugin = new HistoryKeyboardPlugin(props.emulatorState);

  let inputRef = useRef(null);

  const [input, setInput] = useState('');

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
        setInput(emulator.autocomplete(props.emulatorState, input));
        break;

      case 'Enter':

        e.preventDefault();
        props.onStateChange(emulator.execute(props.emulatorState, input, [historyKeyboardPlugin], props.errorStr));
        setInput('');
        break;
    }
  }

  if(!props.emulatorState) return null;

  return (
      <ThemeProvider theme={props.theme}>
        <TerminalContainer onClick={() => focus()}>
          <OutputList
              promptSymbol={props.promptSymbol}
              outputRenderers={props.outputRenderers}
              outputs={props.emulatorState.getOutputs()}
          />
          <CommandInput
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              {...props}
          />
        </TerminalContainer>
      </ThemeProvider>
  );
}

export default TerminalStateless;
