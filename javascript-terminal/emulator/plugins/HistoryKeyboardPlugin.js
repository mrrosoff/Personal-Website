export default class HistoryKeyboardPlugin
{
  constructor(state)
  {
    this.historyStack = state.getHistory();
    this.index = this.historyStack.length - 1;
  }

  onExecuteStarted(state, str) {}

  onExecuteCompleted(state)
  {
    this.historyStack = state.getHistory();
    this.historyStack.push('');
    this.index = this.historyStack.length - 1;
  }

  completeUp()
  {
    if(this.index - 1 >= 0)
    {
      return this.historyStack[--this.index];
    }

    return null;
  }

  completeDown()
  {
    if(this.index + 1 < this.historyStack.size)
    {
      return this.historyStack[++this.index];
    }

    return null;
  }
}
