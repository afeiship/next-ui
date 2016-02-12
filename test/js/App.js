(function (nx, global) {

  nx.declare('demo.App', {
    extend: nx.ui.Application,
    methods: {
      getContainer: function () {
        var el = document.getElementById('app');
        return new nx.dom.Element(el);
      },
      initView: function () {
        var view = new demo.view.MailList();
        var mail1 = new demo.model.MailItemModel({
          title: 'titl1',
          date: '2015-06-21'
        });
        var mail2 = new demo.model.MailItemModel({
          title: 'titl2',
          date: '2015-06-22'
        });
        var mail3 = new demo.model.MailItemModel({
          title: 'titl12321423142134',
          date: '2015-06-22'
        });

        var items = new nx.data.ObservableCollection([mail1, mail2, mail3]);
        view.items = items;
        this._view = view;
        this._items = items;
        view.attach(this);
      }
    }
  });

}(nx, nx.GLOBAL));
