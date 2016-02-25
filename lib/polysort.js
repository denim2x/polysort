"use strict";

function sort (code, options) {
  if (String.takes(options)) {
    options = options.split(":");
    if (options.length == 2) {
      options = {lang: options[0], mode: options[1]};
    } else {
      options = {lang: options[0]};
    }
  }

  let key, parse = require(units + options.lang);
  if (String.takes(options.mode)) {
    parse = parse[options.mode];
  }

  if (options.natural === true) {
    key = "natural";
  } else {
    key = "locale";
  }

  if (options.case_insensitive === true) {
    key += "Case";
  }
  key = String[key + "Compare"];

  let
    lines = code.split(/\r?\n/g),
    before = parse(code, lines),
    after = Array.merge_sort(before, key),
    result = [],
    merge = Array.extend.part_(result),
    segment = Array.$slice.part_(lines);

  if (options.reverse === true) {
    after.reverse();
  }

  // This is where the _actual_ sorting occurs;
  // here the textLines are rearranged according
  // to the ordering within 'after'
  key = 0;
  for (let i of Range(before.length)) {
    let b = before[i], a = after[i];
    if (key < b[0]) {
      merge(segment(key, b[0]));
    }
    key = b[1];
    merge(segment(a[0], a[1]));
  }
  merge(segment(key));

  key = options.new_lines;
  if (typeof new_lines[key] != "string") {
    key = "Linux";
  }

  return result.join(new_lines[key]);
}

require("string-natural-compare");

const
  fs = require("fs"),
  new_lines = {
    Linux: "\n",
    Mac: "\r",
    Windows: "\r\n"
  },
  path = require("path"),
  Range = require("assortment").Range,
  units = path.join(__dirname, "units", path.sep),
  files = fs.readdirSync(units).sort();

module.exports = Object.const(sort, {
  units: files.map(file => {
    let modes, unit = require(units + file);
    if (Function.takes(unit)) {
      modes = null;
    } else {
      modes = Object.keys(unit).sort();
    }
    return {
      name: path.parse(file).name,
      modes, valueOf: () => modes != null
    };
  })
});
