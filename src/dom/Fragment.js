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
        nx.each(this.$dom.childNodes, function (child) {
          result.add(new this.constructor(child));
        }, this);
        return result;
      }
    }
  });

})(nx, nx.global);
