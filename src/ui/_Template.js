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
        var parent = this.parent();
        var absOwner = parent ? parent.owner() : this.owner();
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
            itemOwner = itemComp.owner();
            itemOwner.model(item);
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
          nx.each(inEvent.items, function (item) {
            var comp = this.createItem();
            comp.model(item);
            comp.attach(this, index++);
          }, this);
        } else if (action === 'remove') {
          nx.each(inEvent.items, function () {
            var comp = this.content().item(index);
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

}(nx, nx.global));
