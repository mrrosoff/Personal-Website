import React, {forwardRef, useImperativeHandle, useRef} from 'react';

import PromptSymbol from './PromptSymbol';

import { Grid, InputBase } from '@material-ui/core';

const CommandInput = (props, ref) =>
{
    const inputRef = useRef();

    useImperativeHandle(ref, () => ({ focus: () => { inputRef.current.focus() }}));

    return (
        <Grid container alignContent={"center"} alignItems={"center"} spacing={2}>
            <Grid item>
                <PromptSymbol theme={props.theme} {...props}>{props.promptSymbol}</PromptSymbol>
            </Grid>
            <Grid item>
                <InputBase
                    autoFocus
                    inputRef={inputRef}
                    value={props.value}
                    onChange={props.onChange}
                    onKeyDown={props.onKeyDown}
                />
            </Grid>
        </Grid>
    );
}

export default forwardRef(CommandInput);
