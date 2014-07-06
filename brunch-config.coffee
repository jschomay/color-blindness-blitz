exports.config =
  # See http://brunch.io/#documentation for docs.
  files:
    javascripts:
      joinTo:
        'js/game.js': /^app/
        'js/vendor.js': /^vendor/
    stylesheets:
      joinTo: 'css/game.css'
    templates:
      joinTo: 'js/game.js'
