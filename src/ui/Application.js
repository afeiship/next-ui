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
