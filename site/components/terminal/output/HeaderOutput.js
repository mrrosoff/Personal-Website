import React from 'react';
import PromptSymbol from 'PromptSymbol';
import OutputContainer from 'output/OutputContainer';
import TextCommandWrapper from 'output/TextCommandWrapper';

const HeaderOutput = ({content, promptSymbol}) => (
    <OutputContainer>
        <PromptSymbol>{promptSymbol}</PromptSymbol><TextCommandWrapper>{content.command}</TextCommandWrapper>
    </OutputContainer>
);

export default HeaderOutput;
