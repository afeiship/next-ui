(function () {

  var gulp = require('gulp');
  var del = require('del');
  var concat = require('gulp-concat');
  var rename = require('gulp-rename');
  var uglify = require('gulp-uglify');
  var conf = {
    src: 'src',
    dist: 'dist'
  };

  gulp.task('clean', function () {
    del(conf.dist);
  });

  gulp.task('uglify', ['clean'], function () {
    gulp.src([
        conf.src + '/core/base.js',
        conf.src + '/core/oop-event.js',
        conf.src + '/core/oop-base.js',
        conf.src + '/core/oop.js',


        conf.src + '/core/Observable.js',
        conf.src + '/core/Binding.js',
        conf.src + '/core/ResourceManager.js',
        conf.src + '/core/Binder.js',
        conf.src + '/data/_Index.js',
        conf.src + '/data/Serializable.js',
        conf.src + '/data/Collection.js',
        conf.src + '/data/ObservableCollection.js',


        conf.src + '/dom/Node.js',
        conf.src + '/dom/FormElement.js',
        conf.src + '/dom/Element.js',
        conf.src + '/dom/Fragment.js',
        conf.src + '/dom/Text.js',
        conf.src + '/dom/Document.js',


        conf.src + '/ui/ComponentFactoryContentProcessor.js',
        conf.src + '/ui/ComponentFactoryEventsProcessor.js',
        conf.src + '/ui/ComponentFactoryPropsProcessor.js',
        conf.src + '/ui/ComponentFactoryViewProcessor.js',
        conf.src + '/ui/ComponentFactory.js',


        conf.src + '/ui/_Class.js',
        conf.src + '/ui/_Style.js',
        conf.src + '/ui/_Template.js',
        conf.src + '/ui/AbstractDOMCss.js',
        conf.src + '/ui/CssClass.js',
        conf.src + '/ui/CssStyle.js',
        conf.src + '/ui/DOMBinding.js',

        conf.src + '/ui/ComponentBase.js',
        conf.src + '/ui/DOMComponent.js',
        conf.src + '/ui/Component.js',
        conf.src + '/ui/Application.js',


        conf.src + '/widget/Input.js',
        conf.src + '/widget/InputCheckbox.js'


      ])
      .pipe(concat('next-ui.js'))
      //.pipe(uglify())
      //.pipe(rename({
      //  extname: '.min.js'
      //}))
      .pipe(gulp.dest('dist'));
  });

  gulp.task('default', ['uglify']);

}());
