import React from 'react';
import PromptSymbol from '../PromptSymbol';
import OutputContainer from './OutputContainer';
import TextCommandWrapper from './TextCommandWrapper';

const HeaderOutput = ({content, promptSymbol}) => (
    <OutputContainer>
        <PromptSymbol>{promptSymbol}</PromptSymbol><TextCommandWrapper>{content.command}</TextCommandWrapper>
    </OutputContainer>
);

export default HeaderOutput;
