"use strict";
const
  fs = require("fs"),
  path = require("path"),
  yaml = require("yaml-js"),

  manifest = require("../package"),
  sort = require(".."),

  Caption = {
    indexOf (str) {
      if (str == "it ") {
        return 0;
      }
      return this.toString().indexOf(str);
    }
  },
  env = jasmine.getEnv(),
  keys = Map.from({case: "case_insensitive"}),
  phrasing = Map.from({
    case: "case-insensitive",
    default: "regular",
    reverse: "descendent"
  }),
  fixtures = path.join(__dirname, "fixtures", path.sep);

function premise (options) {
  let
    describe,
    marshal = options.marshal,
    wrap = options.wrap;

  if (Function.takes(marshal)) {
    describe = (c, f) => f();
  } else {
    describe = env.describe;
    marshal = function (options) {
      let caption = `${options.mode}-mode sorting`;
      this(caption, (text) => () => sort(text, options));
    };
  }

  if (Function.shuns(wrap)) {
    wrap = func => func();
  }

  for (let file of fs.readdirSync(fixtures).sort()) {
    let
      doc = yaml.load(fs.readFileSync(fixtures + file)),
      preamble = doc.preamble;

    describe(`the ${preamble.caption} unit`, () => {
      process(doc, {
        _mode: preamble.mode,
        lang: path.parse(file).name
      }, ["preamble"]);
    });
  }

  function process (node, _options, cutback) {
    for (let key of Set.from(Object.keys(node), cutback)) {
      let
        caption,
        facet = node[key],
        before = facet.before,
        after = facet.after,
        options = Object.clone(_options),
        suite = function () {
          if (String.takes(after)) {
            spec(before, after, Object.assign({
              mode: options._mode
            }, options));
          } else {
            for (let key of Object.keys(after)) {
              spec(before, after[key], Object.assign({
                mode: key
              }, options));
            }
          }
        };

      if (key != "default") {
        options[keys.poke(key)] = true;
      }

      if (node.preamble) {
        caption = "yields proven ";
      } else {
        caption = "";
      }
      caption += phrasing.poke(key);

      if (String.shuns(before)) {
        describe(caption, () => {
          process(facet, options);
        });
      } else if (key != "default" || node.preamble) {
        describe(caption, suite);
      } else {
        suite();
      }
    }
  }

  function spec (before, after, options) {
    marshal.call((caption, probe) => {
      it(Object.const(new String(caption), Caption), () => {
        let query = probe(before);
        wrap(() => {
          expect(query()).toBe(after);
        });
      });
    }, options);
  }
}

if (module.parent.id == "#candace") {
  describe("within polysort", () => {
    premise((before, options) => () => sort(before, options));
  });
} else {
  module.exports = premise;
}
