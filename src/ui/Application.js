(function (nx, global) {

  nx.declare('nx.ui.Application', {
    extend: nx.ui.ComponentBase,
    methods: {
      getContainer: function () {
        return nx.dom.Document.body();
      },
      start: function () {
        nx.ui.ComponentFactory.applyBinding();
      }
    }
  });

}(nx, nx.global));
