(function (nx, global) {

    nx.declare('nx.widget.Input', {
        extend: nx.ui.Component,
        view: {
            tag: 'input',
            props: {
                type: '{type}',
                placeholder: '{placeholder}',
                value: '{value}',
                focused: '{focused}'
            },
            events:{
                input:'{value}'
            }
        },
        properties: {
            focused: false,
            type: 'text',
            placeholder: 'search..',
            value: ''
        }
    });

}(nx, nx.GLOBAL));
