import chai from 'chai';
import fs from 'fs';
import path from 'path';
const expect = chai.expect;
import { parse } from 'acorn';
import escodegen from 'escodegen';
import _ from 'lodash';

import inlineCssLoader, { getExportsNode } from '../index.js';

describe('inline CSS Loader', () => {
    const exportNodes = [];
    exportNodes.push(require('./exportNode/es5').default);
    exportNodes.push(require('./exportNode/babel').default);
    exportNodes.push(require('./exportNode/babelLoose').default);
    exportNodes.push(require('./exportNode/babelSpread').default);
    exportNodes.push(require('./exportNode/babelRuntimeSpread').default);
    it('should find nodes', () => {
      _.each(exportNodes, n => {
        const tree = parse(n);
        expect(tree).to.exist;
        const root = getExportsNode(tree.body);
        expect(root).to.exist;
      });
    });

    const fullParse = [];
    fullParse.push(require('./fullObjects/simple').default);
    fullParse.push(require('./fullObjects/spread').default);
    fullParse.push(require('./fullObjects/media').default);
    it('parse, doNothing', () => {
      _.each(fullParse, obj => {
        const generatedFromTree = escodegen.generate(parse(obj));
        expect(generatedFromTree).to.equal(inlineCssLoader.call({}, obj));
      })
    });
  //
    it('temp', () => {
      const temp = require('./transforms/complex');
      const generatedFromTree = escodegen.generate(parse(temp.output));
      expect(generatedFromTree).to.equal(inlineCssLoader.call({}, temp.input));
    });
  //
    const transforms = [];
    transforms.push(require('./transforms/simple'));
    transforms.push(require('./transforms/spread'));
    transforms.push(require('./transforms/complex'));

    it('transforms', () => {
      _.each(transforms, t => {
        const generatedFromTree = escodegen.generate(parse(t.output));
        expect(generatedFromTree).to.equal(inlineCssLoader.call({}, t.input))
      });
    });

  require.extensions['.txt'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
  };

    it('complexRealTransform', () => {
      const inp = require('./transforms/complexRealIn.txt');
      const out = require('./transforms/complexRealOut.txt');
      const generatedFromTree = escodegen.generate(parse(out));
      expect(generatedFromTree).to.equal(inlineCssLoader.call({}, inp))
    });

    it('mediaQuery', () => {
      const inp = require('./transforms/mediaQueryIn.txt');
      const out = require('./transforms/mediaQueryOut.txt');
      const generatedFromTree = escodegen.generate(parse(out));
      expect(generatedFromTree).to.equal(inlineCssLoader.call({}, inp));
    });
  // it('realExample1', () => {
  //   const inp = require('./transforms/bigIn.txt');
  //   const out = require('./transforms/bigOut.txt');
  //   const generatedFromTree = escodegen.generate(parse(out));
  //   expect(generatedFromTree).to.equal(inlineCssLoader.call({}, inp));
  // });
});