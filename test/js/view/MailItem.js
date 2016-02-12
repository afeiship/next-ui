(function (nx, global) {

    nx.declare('demo.view.MainItem', {
        extend: nx.ui.Component,
        events: ['itemClick'],
        view: {
            tag: 'div',
            props: {
                'class': ['mail-item']
            },
            content: [{
                tag: 'span',
                content: '{index}'
            }, {
                tag: nx.widget.InputCheckbox,
                props: {
                    checked: '{checked}'
                },
                events: {
                    click: '{_chk_click}'
                }
            }, {
                tag: 'span',
                props: {
                    'class': ['mail-title']
                },
                content: '{title}'
            }, {
                tag: 'em',
                props: {
                    'class': ['mail-date']
                },
                content: '{date}'
            }, {
                tag: 'button',
                props: {
                    'class': ['remove-btn']
                },
                content: 'X',
                events: {
                    click: '{_click}'
                }
            }]
        },
        properties: {
            index: 0,
            checked: false,
            title: '',
            date: ''
        },
        methods: {
            _click: function (inSender, inEvent) {
                this.fire('itemClick', {
                    model: inSender.owner().model()
                });
            },
            _chk_click: function (inSender, inEvent) {
                this.fire('chkClick', {
                    model: inSender.owner().model()
                });
            }
        }
    });

}(nx, nx.GLOBAL));
