(function (nx, global) {

  nx.declare('demo.model.MailItemModel', {
    extend: nx.Observable,
    mixins: [
      nx.data._Index,
      nx.data.Serializable
    ],
    properties: {
      checked: false,
      title: '',
      date: ''
    },
    methods: {
      init: function (inData) {
        this.base();
        this.sets(inData);
      }
    }
  });

}(nx, nx.global));
