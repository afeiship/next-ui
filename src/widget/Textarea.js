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
