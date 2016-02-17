(function (nx, global) {

  var ComponentFactory = nx.ui.ComponentFactory;
  nx.declare('nx.ui.ComponentBase', {
    extend: nx.Observable,
    mixins: [
      nx.ResourceManager,
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
          nx.each(this._content.toArray(), function (item) {
            item.destroy();
          });
          if (nx.is(inValue, 'nx.ui.ComponentBase')) {
            inValue.attach(this);
          } else if (inValue) {
            ComponentFactory.createComponent(
              inValue,
              this.owner()
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
              item.model(inValue);
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
            owner = this.owner();
            if (this === owner) {
              owner = this.parent();
            }
            return owner.absOwner();
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
          var owner = this.owner() || inParent;
          var root = this.getResource('@dom');
          var container = inParent.getContainer();

          if (root) {
            if (inIndex >= 0) {
              var ref = inParent.content().item(inIndex);

              if (ref && ref.getResource('@tag') === 'fragment') {
                ref = ref.content().getItem(0);
              }

              if (ref) {
                container.insertBefore(root, ref.getResource('@dom'));
                inParent.content().insert(this, inIndex);
              } else {
                container.appendChild(root);
                inParent.content().add(this);
              }
            } else {
              container.appendChild(root);
              inParent.content().add(this);
            }
          }


          this.owner(owner);
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
          var owner = this.owner();
          var parent = this.getResource('@parent');

          if (parent) {
            parent.getContainer().removeChild(this.getResource('@dom'));
            parent.content().remove(this);
          }

          if (this.getResource('@tag') === 'fragment') {
            var root = this.getResource('@dom');
            this.content().each(function (child) {
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

}(nx, nx.global));
