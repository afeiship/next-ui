(function (nx, global) {

  nx.declare('nx.widget.InputCheckbox', {
    extend: nx.ui.Component,
    view: {
      tag: 'input',
      props: {
        type: 'checkbox',
        placeholder: '{placeholder}',
        value: '{value}',
        focused: '{focused}',
        checked: '{checked}'
      },
      events: {
        click: '{_click}'
      }
    },
    properties: {
      focused: false,
      placeholder: 'search..',
      value: '',
      checked: false
    }
  });

}(nx, nx.GLOBAL));
