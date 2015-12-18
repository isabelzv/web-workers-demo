(function(){
  // http://stackoverflow.com/questions/10906734/how-to-upload-image-into-html5-canvas
  var original;
  var imageLoader = document.querySelector('#imageLoader');
  imageLoader.addEventListener('change', handleImage, false);
  var canvas = document.querySelector('#image');
  var ctx = canvas.getContext('2d');

  // create new worker
  var imageWorker = new Worker("scripts/worker.js");

  function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
      var img = new Image();
      img.onload = function(){
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img,0,0);
        original = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }
      img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
  }

  // greys out the buttons while manipulation is happening
  // un-greys out the buttons when the manipulation is done
  function toggleButtonsAbledness() {
    var buttons = document.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].hasAttribute('disabled')) {
        buttons[i].removeAttribute('disabled')
      } else {
        buttons[i].setAttribute('disabled', null);
      }
    };
  }

  function manipulateImage(type) {
    var a, b, g, i, imageData, j, length, pixel, r, ref;
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    toggleButtonsAbledness();
    // post message to worker, giving it the image data and the button type.
    imageWorker.postMessage({'imageData': imageData, 'type': type});

    // function to be run when the worker sends something back. e is the message.
    imageWorker.onmessage = function(e) {
      // toggle the buttons back on.
      toggleButtonsAbledness();
      // image data from the massage from the worker is put into 'image' variable.
      var image = e.data;
      // if there is an image, return and attach image to the canvas.
      if (image) return ctx.putImageData(e.data, 0, 0);
      // otherwise
      console.log("No manipulated image returned.")
    }

    // error handler
    imageWorker.onerror = function(error) {
      function WorkerException(message) {
        this.message = message;
      };
      throw new WorkerException('worker error.');
    };
  };

  function revertImage() {
    return ctx.putImageData(original, 0, 0);
  }

  document.querySelector('#invert').onclick = function() {
    manipulateImage("invert");
  };
  document.querySelector('#chroma').onclick = function() {
    manipulateImage("chroma");
  };
  document.querySelector('#greyscale').onclick = function() {
    manipulateImage("greyscale");
  };
  document.querySelector('#vibrant').onclick = function() {
    manipulateImage("vibrant");
  };
  document.querySelector('#revert').onclick = function() {
    revertImage();
  };
})();