(function (nx, global) {

  var document = global.document;
  var STYLE_NUMBER = 1;

  var styleTypes = {
    'float': 'cssFloat',
    'columnCount': STYLE_NUMBER,
    'columns': STYLE_NUMBER,
    'fontWeight': STYLE_NUMBER,
    'lineHeight': STYLE_NUMBER,
    'opacity': STYLE_NUMBER,
    'order': STYLE_NUMBER,
    'orphans': STYLE_NUMBER,
    'widows': STYLE_NUMBER,
    'zIndex': STYLE_NUMBER,
    'zoom': STYLE_NUMBER
  };

  nx.declare('nx.dom.Element', {
    extend: nx.dom.Node,
    mixins: [
      nx.dom.FormElement
    ],
    methods: {
      get: function (inName) {
        switch (inName) {
          case 'text':
            return this.getText();
          case 'html':
            return this.getHtml();
          case 'value':
            return this.getValue();
          case 'data-checked-status':
            return this.getCheckedStatus();
          case 'focused':
            return this.getFocused();
          case 'multiple':
          case 'selectedIndex':
          case 'checked':
          case 'disabled':
          case 'selected':
            return this.getProperty(inName);
          default:
            return this.getAttribute(inName);
        }
      },
      set: function (inName, inValue) {
        switch (inName) {
          case 'text':
            return this.setText(inValue);
          case 'html':
            return this.setHtml(inValue);
          case 'value':
            return this.setValue(inValue);
          case 'data-checked-status':
            return this.setCheckedStatus(inValue);
          case 'focused':
            return this.setFocused(inValue);
          case 'multiple':
          case 'selectedIndex':
          case 'checked':
          case 'disabled':
          case 'selected':
            return this.setProperty(inName, inValue);
          default:
            return this.setAttribute(inName, inValue);
        }
      },
      getStyle: function (inName, inIsComputed) {
        var style = inIsComputed ? getComputedStyle(this.$dom, null) : this.$dom.style;
        var styleType = styleTypes[inName];

        if (typeof styleType == 'string') {
          return style[styleType];
        } else {
          return style[inName];
        }
      },
      setCssText: function (inCssText) {
        this.$dom.style.cssText = inCssText;
      },
      getCssText: function () {
        return this.$dom.style.cssText;
      },
      setClass: function (inValue) {
        this.$dom.className = inValue;
      },
      getClass: function () {
        return this.$dom.className;
      },
      setStyles: function (inObject) {
        nx.each(inObject, function (name, val) {
          this.setStyle(name, val);
        }, this);
      },
      setStyle: function (inName, inValue) {
        var styleType = styleTypes[inName];
        if (typeof styleType == 'string') {
          this.$dom.style[styleType] = inValue;
        }
        else if (styleType === STYLE_NUMBER || typeof inValue !== 'number') {
          this.$dom.style[inName] = inValue;
        }
        else {
          this.$dom.style[inName] = inValue + 'px';
        }
      },
      getAttribute: function (inName) {
        return this.$dom.getAttribute(inName);
      },
      setAttribute: function (inName, inValue) {
        this.$dom.setAttribute(inName, inValue);
      },
      getAttributes: function () {
        var attrs = {};
        nx.each(this.$dom.attributes, function (index,attr) {
          attrs[attr.name] = attr.value;
        });
      },
      setAttributes: function (inAttrs) {
        nx.each(inAttrs, function (key, value) {
          this.setAttribute(key, value);
        }, this);
      },
      getText: function () {
        return this.$dom.textContent;
      },
      setText: function (inText) {
        this.$dom.textContent = inText;
      },
      getHtml: function () {
        return this.$dom.innerHTML;
      },
      setHtml: function (inHtml) {
        this.$dom.innerHTML = inHtml;
      },
      addEventListener: (function () {
        if (document.addEventListener) {
          return function (inName, inHandler, inCapture) {
            this.$dom.addEventListener(inName, inHandler, inCapture || false);
          };
        } else {
          return function (inName, inHandler) {
            this.$dom.attachEvent("on" + inName, inHandler);
          };
        }
      })(),
      removeEventListener: (function () {
        if (document.removeEventListener) {
          return function (inName, inHandler, inCapture) {
            this.$dom.removeEventListener(inName, inHandler, inCapture || false);
          };
        } else {
          return function (inName, inHandler) {
            this.$dom.detachEvent("on" + inName, inHandler);
          };
        }
      })()
    }
  });

})(nx, nx.GLOBAL);
