import React from 'react';
import OutputContainer from './OutputContainer';
import TextErrorWrapper from './TextErrorWrapper';

const TextErrorOutput = ({content}) => (
    <TextErrorWrapper>
        <OutputContainer>{content}</OutputContainer>
    </TextErrorWrapper>
);


export default TextErrorOutput;
