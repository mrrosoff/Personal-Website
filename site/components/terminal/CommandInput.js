import React, {forwardRef, useImperativeHandle, useRef} from 'react';

import PromptSymbol from './PromptSymbol';

import {Input} from "@material-ui/core";

const CommandInput = (props, ref) =>
{
    const inputRef = useRef();

    useImperativeHandle(ref, () => ({ focus: () => { inputRef.current.focus() }}));

    return (
        <>
            <PromptSymbol>{props.promptSymbol}</PromptSymbol>
            <Input
                autoFocus
                inputRef={inputRef}
                value={props.value}
                onChange={props.onChange}
                onKeyDown={props.onKeyDown}
            />
        </>
    );
}

export default forwardRef(CommandInput);
