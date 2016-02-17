(function (nx, global) {

  nx.declare('nx.data.ObservableCollection', {
    events: ['change'],
    extend: nx.data.Collection,
    mixins: [
      nx.Observable
    ],
    methods: {
      init: function (inData) {
        this.base(inData);
        this.watch('count', this.updateIndex, this);
      },
      add: function (inItem) {
        var index = this.count();
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
        var index = this.count();
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

}(nx, nx.global));
