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
