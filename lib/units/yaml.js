"use strict";
const
  Range = require("assortment").Range,
  yaml = require("yaml-js");

module.exports = {
  /**
   * Handles comments in a 'roaming' manner - each block is
   * attended by the group of comments preceding it (if any)
   **/
  roaming: (text, textLines) => {
    let _before = getBefore(text);
    let before = Object.spawn(_before, {[-1]: {1: 0}});

    // This loop basically updates the staring position of
    // each range to include the group of comments preceding it
    for (let i of Range(before.length - 1, -1, -1)) {
      let b = before[i], p = before[i - 1];
      for (let j of Range(b[0] - 1, p[1] - 1, -1)) {
        if (/^#/.test(textLines[j])) {
          // This position might start a group of comments
          b[0] = j;
        } else break;
      }
    }

    return _before;
  },

  /**
   * Handles comments steadily - they aren't shifted in any way
   **/
  steady: getBefore
};

function getBefore (text) {
  // Get the AST of the original text; it's annotated with line
  // numbers which offers considerable convenience for further
  // processing
  return yaml.compose(text).value.map(getRange);
}

function getRange (item, index) {
  let start = item[0], end = item[1];
  if (end.constructor.name == "SequenceNode") {
    end = Array.get(end.value, -1);
  }
  return Object.const(
    [start.start_mark.line, end.end_mark.line + 1],
    {toString: () => start.value}
  );
}
