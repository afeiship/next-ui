(function (nx, global) {

  function parseNames(names, inOwner) {
    return names == '*' ? Object.keys(inOwner.__properties__) : [].concat(names);
  }

  var Observable = nx.declare('nx.Observable', {
    methods: {
      init: function () {
        this.__watchers__ = {};
      },
      destroy: function () {
        this.__watchers__ = {};
      },
      watch: function (inNames, inHandler, inContext) {
        var names = parseNames(inNames, this);
        nx.each(names, function (index, name) {
          this._watch(name, inHandler, inContext);
        }, this);
      },
      unwatch: function (inNames, inHandler, inContext) {
        var names = parseNames(inNames, this);
        nx.each(names, function (index, name) {
          this._unwatch(name, inHandler, inContext);
        }, this);
      },
      notify: function (inNames) {
        var names = parseNames(inNames, this);
        nx.each(names, function (index, name) {
          this._notify(name);
        }, this);
      },
      _watch: function (inName, inHandler, inContext) {
        var map = this.__watchers__;
        var watchers = map[inName] = map[inName] || [];
        var member = this.member(inName);
        var memberType = this.memberType(inName);
        watchers.push({
          owner: this,
          handler: inHandler,
          context: inContext
        });

        if (member && memberType === 'property') {
          //property will watch one time default.
          //so we need minus this condition.
          if (!member.__watched__) {
            var getter = member.get;
            var setter = member.set;
            nx.defineProperty(this, inName, {
              get: getter,
              set: function (inValue) {
                var oldValue = getter.call(this);
                if (oldValue !== inValue) {
                  if (setter.call(this, inValue) !== false) {
                    this.notify(inName);
                  }
                }
              }
            });
            member.__watched__ = true;
          }
        }
      },
      _unwatch: function (inName, inHandler, inContext) {
        var map = this.__watchers__;
        var watchers = map[inName];
        if (watchers) {
          if (inHandler) {
            nx.each(watchers, function (index, watcher) {
              if (watcher.handler == inHandler && watcher.context == inContext) {
                watchers.splice(index, 1);
                return nx.breaker;
              }
            });
          } else {
            watchers.length = 0;
          }
        }
      },
      _notify: function (inName) {
        var map = this.__watchers__;
        nx.each(map[inName], function (index, watcher) {
          if (watcher && watcher.handler) {
            watcher.handler.call(watcher.context, inName, this.get(inName), watcher.owner);
          }
        }, this);
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  nx.declare('nx.Binding', {
    properties: {
      target: null,
      targetPath: null,
      source: null,
      sourcePath: null,
      convert: null,
      convertBack: null,
      direction: '<>'
    },
    methods: {
      init: function (inConfig) {
        this.sets(inConfig);
        this.dispatch();
      },
      dispatch: function () {
        switch (this.direction) {
          case '->':
            this.forward();
            break;
          case '<-':
            this.backward();
            break;
          case '<>':
            this.forward();
            this.backward();
            break;
        }
      },
      backward: function () {
        var source = this.source,
          sourcePath = this.sourcePath;
        if (source.watch) {
          source.watch(sourcePath, this.onSourceChange, this);
        }
      },
      forward: function () {
        var target = this.target,
          targetPath = this.targetPath;
        if (target.watch) {
          target.watch(targetPath, this.onTargetChange, this);
        }
      },
      onSourceChange: function (inProperty, inValue) {
        var value = inValue;
        var convertBack = this.convertBack;
        if (convertBack) {
          value = convertBack.call(this.target, value);
        }
        this.updateTarget(value);
      },
      onTargetChange: function (inProperty, inValue) {
        var value = inValue;
        var convert = this.convert;
        if (convert) {
          value = convert.call(this.source, value);
        }
        this.updateSource(value);
      },
      updateSource: function (inValue) {
        nx.path(this.source, this.sourcePath, inValue);
      },
      updateTarget: function (inValue) {
        nx.path(this.target, this.targetPath, inValue);
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  nx.declare('nx.Resources', {
    methods: {
      init: function () {
        this.__resources__ = {};
      },
      setResource: function (inName, inValue) {
        this.__resources__[inName] = inValue;
      },
      getResource: function (inName) {
        return this.__resources__[inName];
      },
      removeResource: function (inName) {
        delete this.__resources__[inName];
      },
      destroy: function () {
        this.__resources__ = {};
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  var Binder = nx.declare('nx.Binder', {
    extend: nx.Observable,
    statics: {
      hasBinding: function (inString) {
        return nx.is(inString, 'string') && inString.charAt(0) === '{' && inString.slice(-1) === '}';
      },
      getConverter: function (inOwner, inName) {
        return inOwner[inName] ||
          inOwner.parent().owner()[inName] ||
          inOwner.absOwner()[inName] ||
          nx.Binding.converters;
      },
      bindingMeta: function (inString) {
        var params = {};
        var bindingString = inString.slice(1, -1);
        var tokens = bindingString.split(',');
        var path = tokens[0];
        var paths = path.split('.');
        var i = 1, length = tokens.length;

        for (; i < length; i++) {
          var pair = tokens[i].split('=');
          params[pair[0]] = pair[1];
        }
        params.fullPath = path;
        params.direction = params.direction || '<>';
        params.property = paths.pop();
        params.path = paths.join('.');
        params.converterVal = function (inOwner) {
          var converterName = params.converter;
          var owner = inOwner.absOwner;
          if (converterName) {
            return owner[converterName].call(owner) || nx.Binding.converters[converterName];
          }
          return null;
        };
        params.context = function (inOwner) {
          if (!params.path) {
            //owner binding
            return inOwner;
          }
          //path binding
          return nx.path(inOwner, params.path);
        };
        params.val = function (inOwner) {
          return nx.path(inOwner, params.fullPath);
        };
        return params;
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

    nx.declare('nx.data._Index', {
        properties: {
            index: 0
        }
    })

}(nx, nx.global));
(function (nx, global) {

  nx.declare('nx.data.Serializable', {
    methods: {
      init: function () {
        this.base();
        this.resetSerialize();
      },
      resetSerialize: function () {
        var selfProperties = this.getMeta('properties');
        nx.each(selfProperties, function (name, meta) {
          if (meta && meta.serialize === undefined) {
            meta.serialize = true;
          }
        }, this);
      },
      serialize: function () {
        var result = {};
        var value;
        var selfProperties = this.getMeta('properties');
        nx.each(selfProperties, function (name, meta) {
          //propertyMeta = this.memberMeta(name);
          if (meta.serialize) {
            value = nx.get(this, name);
            switch (true) {
              case meta.serialize && nx.is(value, 'nx.RootClass'):
                if (value.has('serialize')) {
                  result[name] = value.serialize();
                }
                break;
              case meta.serialize === true:
                result[name] = value;
                break;
              case nx.is(meta.serialize, 'function'):
                result[name] = meta.serialize.call(this);
                break;
            }
          }

        }, this);

        return result;
      }
    }
  });


}(nx, nx.global));

(function (nx, global) {

  var Collection = nx.declare('nx.data.Collection', {
    properties: {
      count: {
        get: function () {
          return this._data.length;
        }
      }
    },
    methods: {
      init: function (inData) {
        this.base();
        this._data = inData || [];
      },
      add: function (inItem) {
        return this._data.push(inItem);
      },
      addRange: function (inItems) {
        var data = this._data;
        return this._data = data.concat(inItems);
      },
      insert: function (inItem, inIndex) {
        return this._data.splice(inIndex || 0, 0, inItem);
      },
      insertRange: function (inItems, inIndex) {
        var data = this._data;
        return data.splice.apply(data, [inIndex || 0, 0].concat(inItems));
      },
      remove: function (inItem) {
        var index = this.index(inItem);
        if (index >= 0) {
          this._data.splice(index, 1);
          return index;
        } else {
          return -1;
        }
      },
      removeAt: function (inIndex) {
        return this._data.splice(inIndex, 1)[0];
      },
      index: function (inItem) {
        var result = -1;
        nx.each(this._data, function (index, item) {
          if (inItem === item) {
            result = index;
            return nx.BREAKER;
          }
        });
        return result;
      },
      contains: function (inItem) {
        var index = this.index(inItem);
        return !!(~index);
      },
      item: function (inIndex, inItem) {
        if (typeof inItem === 'undefined') {
          return this._data[inIndex];
        } else {
          this._data[inIndex] = inItem;
        }
      },
      clear: function () {
        return this._data.length = 0;
      },
      each: function (inCallback, inContext) {
        nx.each(this._data, inCallback, inContext);
      },
      toArray: function () {
        return this._data;
      }
    }
  });

})(nx, nx.GLOBAL);

(function (nx, global) {

  nx.declare('nx.data.ObservableCollection', {
    extends: nx.data.Collection,
    mixins: [
      nx.Observable
    ],
    methods: {
      add: function (inItem) {
        var index = this.count;
        var result = this.base(inItem);
        this.notify('count');
        this.fire('change', {
          action: 'add',
          items: [inItem],
          index: index
        });
        return result;
      },
      addRange: function (inItems) {
        var index = this.count;
        var result = this.base(inItems);
        this.notify('count');
        this.fire('change', {
          action: 'add',
          items: inItems,
          index: index
        });
        return result;
      },
      insert: function (inItem, inIndex) {
        var result = this.base(inItem, inIndex);
        this.notify('count');
        this.fire('change', {
          action: 'add',
          items: [inItem],
          index: inIndex
        });
        return result;
      },
      insertRange: function (inItems, inIndex) {
        var result = this.base(inItems, inIndex);
        this.notify('count');
        this.fire('change', {
          action: 'add',
          items: result,
          index: inIndex
        });
        return result;
      },
      remove: function (inItem) {
        var result = this.base(inItem);
        if (result >= 0) {
          this.notify('count');
          this.fire('change', {
            action: 'remove',
            items: [inItem],
            index: result
          });
        }
        return result;
      },
      removeAt: function (inIndex) {
        var result = this.base(inIndex);
        if (result !== undefined) {
          this.notify('count');
          this.fire('change', {
            action: 'remove',
            items: [result],
            index: inIndex
          });
        }
        return result;
      },
      clear: function () {
        var result = this.base();
        this.notify('count');
        this.fire('change', {
          action: 'clear',
          items: result
        });
        return result;
      }
    }
  })

}(nx, nx.GLOBAL));

(function (nx, global) {

  var Node = nx.declare('nx.dom.Node', {
    methods: {
      init: function (inNode) {
        this.$dom = inNode;
      },
      index: function () {
        var node,
          index = 0;
        if (this.parentNode() !== null) {
          while ((node = this.previousSibling()) !== null) {
            ++index;
          }
        } else {
          index = -1;
        }
        return index;
      },
      childAt: function (inIndex) {
        var node = null;
        if (inIndex >= 0) {
          node = this.firstChild();
          while (node && --inIndex >= 0) {
            node = node.nextSibling();
            break;
          }
        }
        return node;
      },
      firstChild: function () {
        return new Node(this.$dom.firstElementChild);
      },
      lastChild: function () {
        return new Node(this.$dom.lastElementChild);
      },
      previousSibling: function () {
        return new Node(this.$dom.previousElementSibling);
      },
      nextSibling: function () {
        return new Node(this.$dom.nextElementSibling);
      },
      parentNode: function () {
        return new Node(this.$dom.parentNode);
      },
      children: function () {
        return new Collection(this.$dom.children);
      },
      cloneNode: function (deep) {
        return new Node(this.$dom.cloneNode(deep));
      },
      hasChild: function (child) {
        return child.$dom.parentNode == this.$dom;
      },
      appendChild: function (child) {
        this.$dom.appendChild(child.$dom);
      },
      insertBefore: function (child, ref) {
        this.$dom.insertBefore(child.$dom, ref.$dom);
      },
      removeChild: function (child) {
        if (this.hasChild(child)) {
          this.$dom.removeChild(child.$dom);
        }
      },
      empty: function () {
        this.children().each(function (child) {
          this.removeChild(child);
        }, this);
      }
    }
  })

}(nx, nx.GLOBAL));

(function (nx, global) {

  var document = global.document;
  nx.declare('nx.dom.FormElement', {
    methods: {
      getCheckedStatus: function () {
        return this.getAttribute('data-checked-status') || 'unchecked';
      },
      setCheckedStatus: function (inValue) {
        this.$dom.indeterminate = false;
        switch (inValue) {
          case 'checked':
            this.$dom.checked = true;
            break;
          case 'unchecked':
            this.$dom.checked = false;
            break;
          case 'indeterminate':
            this.$dom.indeterminate = true;
        }
        this.setAttribute('data-checked-status', inValue);
      },
      setProperty: function (inName, inValue) {
        this.$dom[inName] = inValue;
      },
      getProperty: function (inName) {
        return this.$dom[inName];
      },
      getValue: function () {
        return this.$dom.value;
      },
      setValue: function (inValue) {
        this.$dom.value = inValue;
      },
      setFocused: function (inValue) {
        if (inValue) {
          this.$dom.focus();
        } else {
          this.$dom.blur();
        }
      },
      getFocused: function () {
        return this.$dom === document.activeElement;
      }
    }
  });


}(nx, nx.GLOBAL));

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

(function (nx, global) {

  nx.declare('nx.dom.Fragment', {
    extend: nx.dom.Node,
    methods: {
      /**
       * Get collection child nodes.
       * @returns {nx.data.Collection}
       */
      children: function () {
        var result = new Collection();
        nx.each(this.$dom.childNodes, function (index,child) {
          result.add(new this.constructor(child));
        }, this);
        return result;
      }
    }
  });

})(nx, nx.GLOBAL);

(function (nx,global) {

    nx.declare('nx.dom.Text',{
        extend:nx.dom.Node
    });

})(nx,nx.GLOBAL);

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

(function (nx, global) {

  nx.declare('nx.ui._Class', {
    properties: {
      'class': {
        get: function () {
          return this._class;
        },
        set: function (inValue) {
          switch (nx.type(inValue)) {
            case 'array':
              this._class.set(inValue.join(''));
              break;
            default:
              this._class.set(0, inValue);
          }
        }
      }
    },
    methods: {
      init: function () {
        this._class = new nx.ui.CssClass(this);
      },
      destroy: function () {
        this._class = null;
        this.base();
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  nx.declare('nx.ui._Style', {
    properties: {
      style: {
        get: function () {
          return this._style;
        },
        set: function (inValue) {
          nx.each(inValue, function (name, value) {
            this._style.set(name, value);
          }, this);
        }
      }
    },
    methods: {
      init: function () {
        this._style = new nx.ui.CssStyle(this);
      },
      destroy: function () {
        this._style = null;
        this.base();
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  var ComponentFactory = nx.ui.ComponentFactory;
  nx.declare('nx.ui._Template', {
    properties: {
      items: {
        get: function () {
          return this._items;
        },
        set: function (inValue) {
          var items = this._items;
          if (items && items.off) {
            items.off('change', this.onItemsChange, this);
          }
          items = this._items = inValue;
          if (items && items.on) {
            items.on('change', this.onItemsChange, this);
          }
          this.generateContent();
        }
      },
      itemTemplate: {
        get: function () {
          return this._itemTemplate;
        },
        set: function (inValue) {
          this._itemTemplate = inValue;
          this.generateContent();
        }
      }
    },
    methods: {
      createItem: function () {
        var itemComp = ComponentFactory.createComponent(this._itemTemplate);
        var parent = this.parent;
        var absOwner = parent ? parent.owner : this.owner;
        itemComp.setResource('@absOwner', absOwner);
        return itemComp;
      },
      generateContent: function () {
        var items = this._items;
        var itemTemplate = this._itemTemplate;
        var itemComp,
          itemOwner;
        if (items && itemTemplate) {
          this.empty();
          items.each(function (item) {
            itemComp = this.createItem();
            itemOwner = itemComp.owner;
            itemOwner.model = item;
            itemComp.attach(this);
          }, this);
        }
      },
      empty: function () {
        var _content = this._content.toArray();
        var i = 0,
          item;
        for (; i < _content.length; i++) {
          item = _content[i];
          item.destroy();
          i--;
        }
      },
      onItemsChange: function (inSender, inEvent) {
        var action = inEvent.action;
        var index = inEvent.index;
        if (action === 'add') {
          nx.each(inEvent.items, function (idx,item) {
            var comp = this.createItem();
            comp.model = item;
            comp.attach(this, index++);
          }, this);
        } else if (action === 'remove') {
          nx.each(inEvent.items, function () {
            var comp = this.content.item(index);
            if (comp) {
              comp.detach();
            }
          }, this);
        } else {
          this.generateContent();
        }

        if (ComponentFactory.ready) {
          ComponentFactory.applyBinding();
        }
      },
      destroy: function () {
        this._items = null;
        this._itemTemplate = null;
        this.base();
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  nx.declare('nx.ui.AbstractDOMCss', {
    extend: nx.Observable,
    methods: {
      init: function (inValue) {
        this.base();
        this._component = inValue;
      },
      get: function (inName) {
        //To be implement
      },
      set: function (inName, inValue) {
        //To be implement
      },
      destroy: function () {
        this._component = null;
        this.base();
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  nx.declare('nx.ui.CssClass', {
    extend: nx.ui.AbstractDOMCss,
    methods: {
      init: function (inValue) {
        this.base(inValue);
        this._classList = [];
      },
      has: function (inName) {
        return inName in this._classList;
      },
      get: function (inName) {
        return this._classList[inName];
      },
      set: function (inName, inValue) {
        var root = this._component.getResource('@dom');
        this._classList[inName] = inValue;
        root.set('class', this._classList.join(''));
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  nx.declare('nx.ui.CssStyle', {
    extend: nx.ui.AbstractDOMCss,
    methods: {
      get: function (inName) {
        var root = this._component.getResource('@dom');
        return root.getStyle(inName);
      },
      set: function (inName, inValue) {
        var root = this._component.getResource('@dom');
        root.setStyle(inName, inValue);
        this.notify(inName);
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  nx.declare('nx.ui.DOMBinding', {
    extend: nx.Binding,
    methods: {
      init: function (inConfig) {
        this.base(inConfig);
        this.initDomValue();
        this.initDomProperty();
      },
      initDomProperty: function () {
        var direction = this.direction;
        if (direction.charAt(0) === '<') {
          this.redefineDomProperty(
            this.target,
            this.targetPath,
            this.source,
            this.sourcePath
          );
        }
      },
      initDomValue: function () {
        var target = this.target,
          targetPath = this.targetPath;
        var value = target.get(targetPath);
        this.onTargetChange(targetPath, value);
      },
      canRedefine: function (inTarget, inTargetPath) {
        var type = inTarget.memberType(inTargetPath);
        var propertyMeta = inTarget.memberMeta(inTargetPath);
        if (type !== 'property') {
          return true;
        } else {
          return propertyMeta.generated;
        }
      },
      redefineDomProperty: function (inTarget, inTargetProperty, inSource, inSourceProperty) {
        //var propertyMeta = inTarget.memberMeta(inTargetProperty);
        var propertyMeta = inTarget['@' + inTargetProperty];
        var value = propertyMeta && propertyMeta.value;
        if (this.canRedefine(inTarget, inTargetProperty)) {
          nx.mix(propertyMeta, {
            redefined: true,
            get: function () {
              var result = inSource.get(inSourceProperty);
              if (result == null) {
                return value;
              }
              return result;
            },
            set: function (inValue) {
              inSource.set(inSourceProperty, inValue);
            }
          });
          nx.defineProperty(inTarget, inTargetProperty, propertyMeta);
        }
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  var ComponentFactory = nx.ui.ComponentFactory;
  nx.declare('nx.ui.ComponentBase', {
    extend: nx.Observable,
    mixins: [
      nx.Resources,
      nx.ui._Class,
      nx.ui._Style,
      nx.ui._Template
    ],
    properties: {
      content: {
        get: function () {
          return this._content;
        },
        set: function (inValue) {
          nx.each(this._content.toArray(), function (index,item) {
            item.destroy();
          });
          if (nx.is(inValue, 'nx.ui.ComponentBase')) {
            inValue.attach(this);
          } else if (inValue) {
            ComponentFactory.createComponent(
              inValue,
              this.owner
            ).attach(this);
          }
        }
      },
      model: {
        get: function () {
          return this._model;
        },
        set: function (inValue) {
          this._content.each(function (item) {
            if (!nx.is(item, 'String')) {
              item.model = inValue;
            }
          });
          this._model = inValue;
        }
      },
      absOwner: {
        get: function () {
          //attention that the not attached element.
          var absOwner = this.getResource('@absOwner');
          var owner;
          if (!absOwner) {
            owner = this.owner;
            if (this === owner) {
              owner = this.parent;
            }
            return owner.absOwner;
          }
          return absOwner;
        }
      },
      owner: {
        value: null
      },
      parent: {
        get: function () {
          return this.getResource('@parent');
        }
      },
      dom: {
        get: function () {
          return this.getResource('@dom');
        }
      }
    },
    methods: {
      init: function () {
        this.base();
        this._content = new nx.data.Collection();
        this.__attached__ = false;
        this._domListeners = {};
      },
      attach: function (inParent, inIndex) {
        if (nx.is(inParent, 'nx.ui.ComponentBase')) {
          var name = this.getResource('@name');
          var owner = this.owner || inParent;
          var root = this.getResource('@dom');
          var container = inParent.getContainer();

          if (root) {
            if (inIndex >= 0) {
              var ref = inParent.content.item(inIndex);

              if (ref && ref.getResource('@tag') === 'fragment') {
                ref = ref.content.getItem(0);
              }

              if (ref) {
                container.insertBefore(root, ref.getResource('@dom'));
                inParent.content.insert(this, inIndex);
              } else {
                container.appendChild(root);
                inParent.content.add(this);
              }
            } else {
              //TODO:key
              container.appendChild(root);
              inParent.content.add(this);
            }
          }


          this.owner = owner;
          this.setResource('@parent', inParent);
          if (nx.is(inParent, 'nx.ui.Application')) {
            this.setResource('@absOwner', this);
          }
          this.__attached__ = true;
        }
      },
      on: function (name, handler, context) {
        this.attachDomListener(name);
        this.base(name, handler, context);
      },
      upon: function (name, handler, context) {
        this.attachDomListener(name);
        this.base(name, handler, context);
      },
      attachDomListener: function (name) {
        var domListeners = this._domListeners;
        if (!(name in domListeners)) {
          var self = this;
          var root = this.getResource('@dom');
          var listener = domListeners[name] = function (event) {
            self.fire(name, event);
          };

          root.addEventListener(name, listener);
        }
      },
      detach: function () {
        if (this.__attached__) {
          var name = this.getResource('@name');
          var owner = this.owner;
          var parent = this.getResource('@parent');

          if (parent) {
            parent.getContainer().removeChild(this.getResource('@dom'));
            parent.content.remove(this);
          }

          if (this.getResource('@tag') === 'fragment') {
            var root = this.getResource('@dom');
            this.content.each(function (child) {
              root.appendChild(child.getResource('@dom'));
            });
          }

          owner && owner.removeResource(name);
          //this.removeResource('@owner');
          this.removeResource('@parent');
          this.__attached__ = false;
        }
      },
      getContainer: function () {
        if (this.getResource('@tag') === 'fragment') {
          var parent = this.getResource('@parent');
          if (parent) {
            return parent.getContainer();
          }
        }
        return this.getResource('@dom');
      },
      destroy: function () {
        this.base();
        this.detach();
        this._content = null;
        this._model = null;
        this.__attached__ = false;
        this._domListeners = null;
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  var Document = nx.dom.Document;
  nx.declare('nx.ui.DOMComponent', {
    extend: nx.ui.ComponentBase,
    methods: {
      init: function (inTag, inValue) {
        this.base();
        this.create(inTag, inValue);
      },
      get: function (inName) {
        if (this.has(inName)) {
          return this.base(inName);
        } else {
          return this.dom.get(inName);
        }
      },
      set: function (inName, inValue) {
        if (this.has(inName)) {
          this.base(inName, inValue);
        } else {
          this.dom.set(inName, inValue);
        }
      },
      create: function (inType, inValue) {
        var root;
        switch (inType) {
          case 'text':
            root = Document.createText(inValue);
            break;
          case 'fragment':
            root = Document.createFragment();
            break;
          default :
            root = Document.createElement(inValue || 'div');
        }
        this.setResource('@dom', root);
        this.setResource('@tag', inType);
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  var Binder = nx.Binder;
  var bindings = [];
  nx.declare('nx.ui.ComponentFactoryContentProcessor', {
    statics: {
      contentProcess: function (inRoot, inView) {
        var owner = inRoot.owner;
        var content = inView.content;
        var itemRoot;
        if (!nx.is(content, 'undefined')) {
          if (nx.is(content, 'string')) {
            this.propProcess(inRoot, owner, 'content', content);
          } else {
            itemRoot = this.createComponent(inView.content, owner);
            itemRoot.attach(inRoot);
          }
        }
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  var Binder = nx.Binder;
  var bindings = [];
  nx.declare('nx.ui.ComponentFactoryEventsProcessor', {
    statics: {
      eventsProcess: function (inRoot, inView) {
        var owner = inRoot.owner;
        nx.each(inView.events, function (name, val) {
          bindings.push({
            root: inRoot,
            owner: owner,
            value: val,
            name: name
          });
        }, this);
      },
      eventBindProperty: function (inRoot, inContext, inName, inProperty) {
        inRoot.on(inName, function (sender, event) {
          inContext.notify(inProperty);
        });
      },
      eventBindMethod: function (inRoot, inContext, inName, inHandler) {
        inRoot.on(inName, function (sender, event) {
          inHandler.call(inContext, inRoot, event);
        });
      },
      asyncEventsBinding: function () {
        var handler,
          context,
          bindingMeta,
          root;
        var memberType;
        nx.each(bindings, function (index,item) {
          bindingMeta = Binder.bindingMeta(item.value);
          context = bindingMeta.context(item.owner);
          handler = context.member(bindingMeta.property);
          memberType = context.memberType(bindingMeta.property);
          switch (memberType) {
            case 'method':
              this.eventBindMethod(item.root, context, item.name, handler);
              break;
            case 'property':
              this.eventBindProperty(item.root, context, item.name, bindingMeta.property);
          }
        }, this);

        //clear the queue
        bindings.length = 0;
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  var Binder = nx.Binder;
  var bindings = [];
  nx.declare('nx.ui.ComponentFactoryPropsProcessor', {
    statics: {
      propsProcess: function (inRoot, inView) {
        var owner = inRoot.owner;
        this.propsMapProcess(inRoot, inView.props, owner);
      },
      propProcess: function (inRoot, inOwner, inName, inValue) {
        switch (true) {
          case nx.is(inValue, 'object') && inName === 'style':
            this.propsMapProcess(inRoot.style, inValue, inOwner);
            break;
          case nx.is(inValue, 'array') && inName === 'class':
            this.propsArrayProcess(inRoot.class, inValue, inOwner);
            break;
          default :
            bindings.unshift({
              root: inRoot,
              owner: inOwner,
              name: inName,
              value: inValue
            });
        }
      },
      propsArrayProcess: function (inRoot, inArray, inOwner) {
        nx.each(inArray, function (index, value) {
          this.propProcess(inRoot, inOwner, '' + index, value);
        }, this);
      },
      propsMapProcess: function (inRoot, inPropsMap, inOwner) {
        nx.each(inPropsMap, function (name, value) {
          this.propProcess(inRoot, inOwner, name, value);
        }, this);
      },
      setNormalProperty: function (inRoot, inOwner, inPropertyName, inPropertyValue) {
        inRoot.set(inPropertyName, inPropertyValue);
      },
      setBindingProperty: function (inRoot, inOwner, inPropertyName, inPropertyValue) {
        var bindingMeta = Binder.bindingMeta(inPropertyValue);
        var context = bindingMeta.context(inOwner);
        var converter = bindingMeta.converterVal(inOwner);
        //console.log(inPropertyName,inPropertyValue,bindingMeta);
        return new nx.ui.DOMBinding({
          target: context,
          targetPath: bindingMeta.property,
          source: inRoot,
          sourcePath: inPropertyName,
          converter: converter,
          direction: bindingMeta.direction || '<>'
        });
      },
      asyncPropsBinding: function () {
        var value,
          method;
        var i, len = bindings.length,
          item;
        var copyBindings = bindings.slice(0);
        for (i = 0; i < len; i++) {
          item = copyBindings[i];
          value = item.value;
          method = Binder.hasBinding(value) ? 'setBindingProperty' : 'setNormalProperty';
          this[method](item.root, item.owner, item.name, value);
        }
        bindings = bindings.slice(0, bindings.length - len);

        if (bindings.length > 0) {
          this.applyBinding();
        }
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  nx.declare('nx.ui.ComponentFactoryViewProcessor', {
    statics: {
      viewProcess: function (inRoot, inView) {
        var itemComp;
        var owner = inRoot.owner;
        if (nx.is(inView, 'array')) {
          nx.each(inView, function (index, item) {
            itemComp = this.createComponent(item, owner);
            itemComp.attach(inRoot);
          }, this);
        }
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  nx.declare('nx.ui.ComponentFactory', {
    mixins: [
      nx.ui.ComponentFactoryViewProcessor,
      nx.ui.ComponentFactoryEventsProcessor,
      nx.ui.ComponentFactoryPropsProcessor,
      nx.ui.ComponentFactoryContentProcessor
    ],
    statics: {
      ready: false,
      createComponent: function (inView, inOwner) {
        var root = null;
        if (inView) {
          root = this.createRoot(inView, inOwner);
          this.viewProcess(root, inView);
          this.propsProcess(root, inView);
          this.eventsProcess(root, inView);
          this.contentProcess(root, inView);
        }
        return root;
      },
      createRoot: function (inView, inOwner) {
        var root;
        switch (nx.type(inView)) {
          case 'array':
            root = new nx.ui.DOMComponent('fragment');
            break;
          case 'object':
            if (nx.is(inView.tag, 'function')) {
              //debugger;
              root = new inView.tag();
            } else {
              if (inView.tag === 'fragment') {
                root = new nx.ui.DOMComponent('fragment');
              } else {
                root = new nx.ui.DOMComponent('element', inView.tag);
              }
            }
            break;
          default :
            root = new nx.ui.DOMComponent('text', inView);
        }
        root.setResource('@view', inView);
        if (inOwner) {
          inOwner.setResource(inView.name, root);
          root.owner = inOwner;
        } else {
          //template:
          root.owner = root;
        }
        return root;
      },
      applyBinding: function () {
        this.asyncEventsBinding();
        this.asyncPropsBinding();
        this.ready = true;
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  var ComponentFactory = nx.ui.ComponentFactory;
  nx.declare('nx.ui.Component', {
    extend: nx.ui.ComponentBase,
    methods: {
      init: function () {
        this.base();
        var view = this.view();
        if (view) {
          var comp = ComponentFactory.createComponent(view, this);
          this.setResource('@dom', comp.getResource('@dom'));
          this.setResource('@tag', comp.getResource('@tag'));
          this.setResource('root', comp);
        }
      },
      $: function (inName) {
        return this.getResource(inName || 'root');
      },
      view: function () {
        var viewMeta = this.getMeta('view');
        var viewInstance;
        if (nx.is(viewMeta, 'function')) {
          viewInstance = new viewMeta();
          return viewInstance.getViewMeta.call(this);
          //return (new viewMeta).getViewMeta();
        } else {
          var base = this.__base__;
          if (base !== nx.ui.Component) {
            return base.prototype.view();
          }
          return viewMeta;
        }
      },
      get: function (inName) {
        if (this.has(inName)) {
          return this.base(inName);
        } else {
          return this.getResource('@dom').get(inName);
        }
      },
      set: function (inName, inValue) {
        if (this.has(inName)) {
          this.base(inName, inValue);
        } else {
          this.getResource('@dom').set(inName, inValue);
          this.notify(inName);
        }
      }
    }
  })

}(nx, nx.GLOBAL));

(function (nx, global) {


  var ComponentFactory = nx.ui.ComponentFactory;
  nx.declare('nx.ui.Application', {
    extend: nx.ui.ComponentBase,
    methods: {
      getContainer: function () {
        return nx.dom.Document.body();
      },
      start: function () {
        ComponentFactory.applyBinding();
      }
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

    nx.declare('nx.widget.Input', {
        extend: nx.ui.Component,
        view: {
            tag: 'input',
            props: {
                type: '{type}',
                placeholder: '{placeholder}',
                value: '{value}',
                focused: '{focused}'
            },
            events:{
                input:'{value}'
            }
        },
        properties: {
            focused: false,
            type: 'text',
            placeholder: 'search..',
            value: ''
        }
    });

}(nx, nx.GLOBAL));

(function (nx, global) {

  nx.declare('nx.widget.InputCheckbox', {
    extend: nx.ui.Component,
    view: {
      tag: 'input',
      props: {
        type: 'checkbox',
        placeholder: '{placeholder}',
        value: '{value}',
        focused: '{focused}',
        checked: '{checked}'
      },
      events: {
        click: '{_click}'
      }
    },
    properties: {
      focused: false,
      placeholder: 'search..',
      value: '',
      checked: false
    }
  });

}(nx, nx.GLOBAL));

(function (nx, global) {

  nx.declare('nx.widget.Textarea', {
    extend: nx.ui.Component,
    view: {
      tag: 'textarea',
      props: {
        placeholder: '{placeholder}',
        value: '{value}',
        focused: '{focused}'
      }
    },
    properties: {
      focused: false,
      placeholder: 'search..',
      value: ''
    }
  });

}(nx, nx.GLOBAL));
