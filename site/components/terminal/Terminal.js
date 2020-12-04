import React, {useState} from 'react';

import TerminalStateless from './TerminalStateless';

const Terminal = props =>
{
  const [emulatorState, setEmulatorState] = useState(props.emulatorState);

  return (
      <TerminalStateless
          emulatorState={emulatorState}
          onStateChange={(emulatorState) => setEmulatorState(emulatorState)}
          {...props}
      />
  );
}

export default Terminal;
