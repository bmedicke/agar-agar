var log = function() {
    console.log.apply(console, arguments);
};

function getAbsolutePosition(element) {
    
  var r = { x: element.offsetLeft, y: element.offsetTop };
  if (element.offsetParent) {
    var tmp = getAbsolutePosition(element.offsetParent);
    r.x += tmp.x;
    r.y += tmp.y;
    
  }
  
  return r;
  
}

function getRelativeCoordinates(event, reference) {

  var x, y, e, pos;
  event = event || window.event;

  var el = event.target || event.srcElement;

  if (!window.opera && typeof event.offsetX !== 'undefined') {
    // Use offset coordinates and find common offsetParent
    pos = { x: event.offsetX, y: event.offsetY };

    // Send the coordinates upwards through the offsetParent chain.
    e = el;
    while (e) {
      e.mouseX = pos.x;
      e.mouseY = pos.y;
      pos.x += e.offsetLeft;
      pos.y += e.offsetTop;
      e = e.offsetParent;
    }

    // Look for the coordinates starting from the reference element.
    e = reference;
    var offset = { x: 0, y: 0 };

    while (e) {

      if (typeof e.mouseX !== 'undefined') {
        x = e.mouseX - offset.x;
        y = e.mouseY - offset.y;
        break;
      }

      offset.x += e.offsetLeft;
      offset.y += e.offsetTop;
      e = e.offsetParent;
    }

    // Reset stored coordinates
    e = el;

    while (e) {

      e.mouseX = undefined;
      e.mouseY = undefined;
      e = e.offsetParent;

    }

  } else {

    // Use absolute coordinates
    pos = getAbsolutePosition(reference);
    x = event.pageX  - pos.x;
    y = event.pageY - pos.y;
  }

  // Subtract distance to middle
  return { x: x, y: y };
}