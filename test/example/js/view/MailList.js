(function (nx, global) {

  nx.declare('demo.view.MailList', {
    extend: nx.ui.Component,
    mixins: [
      nx.data.Serializable
    ],
    view: [
      {
        tag: 'h2',
        content: 'Traditional-NX Framework Example(MVVM).'
      },
      {
        tag: 'div',
        content: '{result,direction=->}'
      },
      {
        tag: nx.widget.Input,
        props: {
          value: '{value}'
        }
      },
      {
        tag: 'div',
        props: {
          style: {
            border: '1px solid #f00'
          }
        },
        content: [{
          tag: 'strong',
          content: 'Input text content is:'
        }, {
          tag: 'span',
          content: '{value}'
        }]
      },
      {
        tag: 'span',
        content: [{
          tag: 'em',
          content: 'Sum:'
        }, {
          tag: 'strong',
          content: '{items.count}'
        }, {
          tag: 'em',
          content: 'selected:->'
        }, {
          tag: 'strong',
          content: '{checkedCount}'
        }]
      }, {
        tag: 'div',
        'class': 'mail-list',
        props: {
          name: 'n2',
          'class': ['main-view'],
          items: '{items}',
          itemTemplate: {
            tag: demo.view.MainItem,
            props: {
              index: '{model.index,converter=toNaturalIndex,direction=->}',
              checked: '{model.checked}',
              title: '{model.title}',
              date: '{model.date}'
            },
            events: {
              itemClick: '{absOwner._rmv_click}',
              chkClick: '{absOwner._chk_click}'
            }
          }
        }
      }, {
        tag: 'button',
        content: 'Add',
        events: {
          click: '{_add_click}'
        }
      }, {
        tag: 'label',
        content: [{
          name: 'n3',
          tag: nx.widget.InputCheckbox,
          props: {
            checked: '{selectAllChecked}',
            'data-checked-status': '{itemsChecked}'
          }
        }, {
          tag: 'span',
          content: 'Select All'
        }],
        events: {
          click: '{_select_all_click}'
        }
      }
    ],
    properties: {
      result: {
        serialize: false,
        get: function () {
          return app._view.serialize();
        }
      },
      value: '',
      items: null,
      checkedCount: {
        get: function () {
          var count = 0;
          this.items().each(function (item) {
            if (item.checked()) {
              count++
            }
          }, this);
          return count;
        }
      },
      selectAllChecked: {
        value: false
      },
      itemsChecked: {
        get: function () {
          //有选中：indeterminate
          //全选中：checked
          //全未选中:unchecked
          var data=this.items().toArray();
          //var query = new nx.data.Query(this.items());
          var result1 = data.every(function (item) {
            return item.checked();
          });
          var result2 = data.some(function (item) {
            return item.checked();
          });
          if (result1) {
            return 'checked';
          }
          if (!result2) {
            return 'unchecked';
          }

          return 'indeterminate';
        }
      }
    },
    methods: {
      init: function () {
        var self = this;
        this.base();
        document.addEventListener('click', function () {
          self.notify('result');
        });

        document.addEventListener('input', function () {
          self.notify('result');
        }, false);
      },
      toNaturalIndex: function () {
        return {
          convert: function (inValue) {
            return ++inValue;
          }
        };
      },
      _chk_click: function () {
        this.notify([
          'checkedCount',
          'itemsChecked'
        ]);
      },
      _rmv_click: function (inSender, inArgs) {
        this.items().remove(inArgs.model);
        this.notify('checkedCount');
      },
      _add_click: function (inSender, inEvent) {
        var mailNew = new demo.model.MailItemModel({
          title: 'titl2',
          date: +new Date(),
          checked: this.selectAllChecked()
        });
        this.items().add(mailNew);
        this.notify('checkedCount');
      },
      _select_all_click: function () {
        this.items().each(function (item) {
          item.checked(
            this.selectAllChecked()
          );
        }, this);

        this.notify([
          'checkedCount',
          'itemsChecked'
        ]);
      }
    }
  });

}(nx, nx.global));
