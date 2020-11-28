import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactTerminalStateless from './ReactTerminalStateless';
import TerminalStateless from './ReactTerminalStateless';

class Terminal extends Component
{

  constructor({emulatorState, inputStr, errorStr})
  {
    super();

    this.state = {
      emulatorState,
      inputStr,
      errorStr
    };
  }

  _init(props)
  {
    const {emulatorState, inputStr, errorStr} = props;

    this.setState({
      emulatorState,
      inputStr,
      errorStr
    });
  }

  componentDidMount()
  {
    this._init(this.props);
  }

  componentWillReceiveProps(nextProps)
  {
    if(nextProps)
    {
      this._init(nextProps);
    }
  }

  _onInputChange = (inputStr) =>
  {
    this.setState({inputStr});
  }

  _onStateChange = (emulatorState) =>
  {
    this.setState({emulatorState, inputStr: ''});
  }

  render()
  {
    // eslint-disable-next-line no-unused-vars
    const {emulatorState: removedEmulatorState, inputStr: removedInputStr, ...otherProps} = this.props;
    const {emulatorState, inputStr, errorStr} = this.state;

    // We're using the spread operator to pass along all props to the child componentm
    // except for emulatorState and inputStr which must come from the state.
    return (
        <ReactTerminalStateless
            {...otherProps}
            emulatorState={emulatorState}
            inputStr={inputStr}
            errorStr={errorStr}
            onInputChange={this._onInputChange}
            onStateChange={this._onStateChange}
        />
    );
  }
}

Terminal.propTypes = {
  ...TerminalStateless.commonPropTypes,
  emulatorState: PropTypes.object,
  inputStr: PropTypes.string
};

Terminal.defaultProps = {
  ...TerminalStateless.defaultProps
};

export default Terminal;
