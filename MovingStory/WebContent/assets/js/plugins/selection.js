var msie = (/msie/i).test(navigator.userAgent.toLowerCase());

function getSelected () {
  return ( msie ) 
    ? document.selection
    : ( window.getSelection || document.getSelection )();
}

// range objects will differ between browsers
function getRange () {
  return ( msie ) 
      ? getSelection().createRange()
      : getSelection().getRangeAt( 0 )
}

// abstract getting a parent container from a range
function parentContainer ( range ) {
  return ( msie )
      ? range.parentElement()
      : range.commonAncestorContainer;
}