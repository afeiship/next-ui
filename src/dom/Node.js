(function (nx, global) {

  var Node = nx.declare('nx.dom.Node', {
    methods: {
      init: function (inNode) {
        this.$dom = inNode;
      },
      index: function () {
        var node,
          index = 0;
        if (this.parentNode() !== null) {
          while ((node = this.previousSibling()) !== null) {
            ++index;
          }
        } else {
          index = -1;
        }
        return index;
      },
      childAt: function (inIndex) {
        var node = null;
        if (inIndex >= 0) {
          node = this.firstChild();
          while (node && --inIndex >= 0) {
            node = node.nextSibling();
            break;
          }
        }
        return node;
      },
      firstChild: function () {
        return new Node(this.$dom.firstElementChild);
      },
      lastChild: function () {
        return new Node(this.$dom.lastElementChild);
      },
      previousSibling: function () {
        return new Node(this.$dom.previousElementSibling);
      },
      nextSibling: function () {
        return new Node(this.$dom.nextElementSibling);
      },
      parentNode: function () {
        return new Node(this.$dom.parentNode);
      },
      children: function () {
        return new Collection(this.$dom.children);
      },
      cloneNode: function (deep) {
        return new Node(this.$dom.cloneNode(deep));
      },
      hasChild: function (child) {
        return child.$dom.parentNode == this.$dom;
      },
      appendChild: function (child) {
        this.$dom.appendChild(child.$dom);
      },
      insertBefore: function (child, ref) {
        this.$dom.insertBefore(child.$dom, ref.$dom);
      },
      removeChild: function (child) {
        if (this.hasChild(child)) {
          this.$dom.removeChild(child.$dom);
        }
      },
      empty: function () {
        this.children().each(function (child) {
          this.removeChild(child);
        }, this);
      }
    }
  })

}(nx, nx.GLOBAL));
