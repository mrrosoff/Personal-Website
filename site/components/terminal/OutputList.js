import React from 'react';

const OutputList = props =>
{
    return props.outputs.map((output, index) =>
    {
        const type = output.get('type');
        const content = output.get('content');

        if(!props.outputRenderers.hasOwnProperty(type))
        {
            throw new Error(`No output renderer set for ${type} in outputRenderers`);
        }

        const OutputComponent = props.outputRenderers[type];

        return <OutputComponent key={index} content={content} {...props}/>;
    });
}

export default OutputList;
