(function (nx, global) {

  var document = global.document;
  nx.declare('nx.dom.FormElement', {
    methods: {
      getCheckedStatus: function () {
        return this.getAttribute('data-checked-status') || 'unchecked';
      },
      setCheckedStatus: function (inValue) {
        this.$dom.indeterminate = false;
        switch (inValue) {
          case 'checked':
            this.$dom.checked = true;
            break;
          case 'unchecked':
            this.$dom.checked = false;
            break;
          case 'indeterminate':
            this.$dom.indeterminate = true;
        }
        this.setAttribute('data-checked-status', inValue);
      },
      setProperty: function (inName, inValue) {
        this.$dom[inName] = inValue;
      },
      getProperty: function (inName) {
        return this.$dom[inName];
      },
      getValue: function () {
        return this.$dom.value;
      },
      setValue: function (inValue) {
        this.$dom.value = inValue;
      },
      setFocused: function (inValue) {
        if (inValue) {
          this.$dom.focus();
        } else {
          this.$dom.blur();
        }
      },
      getFocused: function () {
        return this.$dom === document.activeElement;
      }
    }
  });


}(nx, nx.global));
