
// p5 wrapper for keyboard handling
const Renderer = function(p) {

  let {height, width} = Renderer.getDocumentSize();

  p.setup = () => {
    p.createCanvas(width, height);
    p.background(51);
  }

}

Renderer.getDocumentSize = function() {
  var body = document.body,
    html = document.documentElement;

    var height = Math.max( body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight );

    var width = Math.max( body.scrollWidth, body.offsetWidth,
            html.clientWidth, html.scrollWidth, html.offsetWidth );

  return {height, width};
}



module.exports = Renderer;
