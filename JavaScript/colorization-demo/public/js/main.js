// clouds https://images.unsplash.com/16/unsplash_525a7e89953d1_1.JPG
// hills https://images.unsplash.com/29/cloudy-hills.jpg
// rock https://images.unsplash.com/reserve/yZfr4jmxQyuaE132MWZm_stagnes.jpg
// paris https://images.unsplash.com/33/YOfYx7zhTvYBGYs6g83s_IMG_8643.jpg

window.Algorithmia = window.Algorithmia || {};
Algorithmia.api_key = "simYU7sWtoiMToSYQC9uVqdAURb1";
var numTasks = 0;

function callAlgorithm() {
  var statusLabel = document.getElementById("status-label");
  statusLabel.innerHTML = "";

  // Get the img URL
  var img = document.getElementById("imgUrl").value;

  // Remove any whitespaces around the url
  img = img.trim();

  if(typeof(img) == "string" && img !== "") {
    startTask();

    // Call Image Colorization
    colorify(img);
  }

};

function downloadCanvas(link, canvasId, filename) {
    link.href = document.getElementById(canvasId).toDataURL();
    link.download = filename;
}

document.getElementById('compareLink').addEventListener('click', function() {
    downloadCanvas(this, 'twoface', 'rendered-comparison.png');
}, false);


function colorify(img) {
  Algorithmia.client(Algorithmia.api_key)
    .algo("algo://algorithmiahq/ColorizationDemo/1.1.16")
    .pipe(img)
    .then(function(output) {
      if(output.error) {
        // Error Handling
        var statusLabel = document.getElementById("status-label")
        statusLabel.innerHTML = '<div class="alert alert-danger" role="alert">Uh Oh! Something went wrong: ' + output.error.message + ' </div>';
        taskError();
      } else {
        console.log("got output", output.result);

        // Decode base64 imgs
        var imgOriginal = "data:image/png;base64," + output.result[0];
        var imgColorized = "data:image/png;base64," + output.result[1];

        // Show the download link if API also returned the URL
        if(output.result.length > 2) {
            document.getElementById("downloadLinks").classList.remove("hidden");
            document.getElementById("resultLink").href = output.result[2];
        } else {
            document.getElementById("downloadLinks").classList.add("hidden");
            document.getElementById("resultLink").href = '#';
        }

        getMeta(imgOriginal, imgColorized);
      }
    });
}

function getMeta(original,colorized){

  // Get height and width of original image
  var img = new Image();

  img.onload = function(){
    width = this.width;
    height = this.height;

    var twoface = TwoFace('twoface-demo', width, height);
    twoface.add(original);
    twoface.add(colorized);

      // Finish Task
      finishTask();

    };

  img.src = colorized;
}

function analyzeDefault(img) {
	document.getElementById("imgUrl").value = img;
	callAlgorithm();
}

function startTask() {
  numTasks++;
  document.getElementById("overlay").classList.remove("hidden");
  var clear = document.getElementById("twoface-demo");
  clear.innerHTML = '';
}

function finishTask() {
  numTasks--;
  if(numTasks <= 0) {
    document.getElementById("overlay").classList.add("hidden");
    document.getElementById("explainer").classList.add("hidden");
    document.getElementById("results").classList.remove("hidden");
    document.getElementById("social").classList.remove("invisible");
    document.getElementById("marketing").classList.remove("hidden");
  }
}

function taskError() {
  numTasks = 0;
  document.getElementById("overlay").classList.add("hidden");
  document.getElementById("explainer").classList.add("display");
  document.getElementById("explainer").classList.remove("hidden");
  document.getElementById("results").classList.add("hidden");
  document.getElementById("social").classList.add("invisible");
  document.getElementById("marketing").classList.add("hidden");
}


function initDropzone() {
  window.Dropzone.autoDiscover = false;
  var dropzone = new Dropzone("#file-dropzone", {
    options: {
      sending: function() {}
    },
    acceptedFiles: "image/*",
    previewTemplate: "<div></div>",
    maxFilesize: 10,
    filesizeBase: 1024,
    createImageThumbnails: false,
    clickable: true
  });
  dropzone.__proto__.cancelUpload = function() {};
  dropzone.__proto__.uploadFile = function() {};
  dropzone.__proto__.uploadFiles = function() {};

  dropzone.on("processing", function(file) {
    var statusLabel = document.getElementById("status-label")
    statusLabel.innerHTML = "";
    startTask();

    var reader = new FileReader();
    reader.addEventListener("load", function () {
      console.log("Calling algorithm with uploaded image.");
      colorify(reader.result);
      dropzone.removeFile(file);
    }, false);
    reader.readAsDataURL(file);
    console.log("Reading uploaded image...");
  });

  dropzone.on("error", function(file, err) {
    dropzone.removeFile(file);
    var statusLabel = document.getElementById("status-label")
    statusLabel.innerHTML = '<div class="alert alert-danger" role="alert">Uh oh! ' + err + ' </div>';
    taskError();
  });
}
initDropzone();
