// This library is developed and maintenance by Commerce Apps , it isn't a third party.

define("zoom", function(_) {
  function transformCoordinate(coordinate, offset, size) {
    return ((coordinate - offset) / size) * 100;
  }

  $.fn.zoom = function(url, slide_index) {
    slide_index = slide_index | 0;
    var $div = $("[data-zoom]"),
      $img = $($div.children("img")[slide_index]);

    if ($img) {
      $div
        .css({ position: "relative", overflow: "hidden" })
        .on("mouseover", function() {
          $img.css({ transform: "scale(2.3)" });
        })
        .on("mouseout", function() {
          $img.css({ transform: "scale(1)" });
        })
        .on("mousemove", function(e) {
          $img.css({
            "transform-origin":
              transformCoordinate(e.pageX, $div.offset().left, $div.width()) -
              slide_index * 100 +
              "% " +
              transformCoordinate(e.pageY, $div.offset().top, $div.height()) +
              "%"
          });
        });

      if (url) {
        $img.attr("src", url);
      }
    }
  };
});
