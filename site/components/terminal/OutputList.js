import React from 'react';

import {Grid, Typography} from "@material-ui/core";
import PromptSymbol from "./PromptSymbol";

const OutputList = props =>
{
    return <Grid container direction={"column"} spacing={1}>
        {
            props.emulatorState.getOutputs().map((content, key) =>
                <Grid item key={key}>
                    <Grid container direction={"column"}>
                        <Grid item>
                            <PromptSymbol theme={props.theme} {...props}>{props.promptSymbol}</PromptSymbol>
                        </Grid>
                        <Grid item>
                            {content.split("\n").map((line, key) => <Typography key={key}>{line}</Typography>)}
                        </Grid>
                    </Grid>
                </Grid>
            )
        }
    </Grid>
}

export default OutputList;
