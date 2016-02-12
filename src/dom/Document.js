(function (nx, global) {

  var Element = nx.dom.Element;
  var Fragment = nx.dom.Fragment;
  var Text = nx.dom.Text;
  var document = global.document;

  nx.declare('nx.dom.Document', {
    properties: {
      body: {
        get: function () {
          return new Element(document.body);
        }
      }
    },
    statics: {
      createFragment: function () {
        return new Fragment(document.createDocumentFragment());
      },
      createElement: function (inTag) {
        return new Element(document.createElement(inTag));
      },
      createText: function (inText) {
        return new Text(document.createTextNode(inText));
      }
    }
  });

})(nx, nx.GLOBAL);
