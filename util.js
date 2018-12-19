$(function () {
    $('#loader').hide();
})

// embed iframe page when button is clicked
$('#transferBtn').click(function () {
    // loader
    $('#loader').fadeIn();
    // save canvas image to local storage
    //    localDown();
    // set iframe
    $('#overlay').css({
        "position": "absolute",
        "top": "0",
        "left": "0",
        "width": "100vw",
        "height": "100vh"
    });
    $('#overlay').fadeIn();
    $("#overlay").attr("src", "./app.html");
});

////////////////////////////////////////////////////////////////////////
// rewrite and modification of tensorflow person-segmentation masking//
//////////////////////////////////////////////////////////////////////

// major code sources:
// *https://github.com/tensorflow/tfjs-models/tree/master/person-segmentation
// *https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Manipulating_video_using_canvas

// ACKNOWLEDGEMENTS:
// Roland Arnoldt
// *https://github.com/rollasoul/person_segmentation/blob/master/utils.js


let outputStride = 32;
let flipHorizontal = false;
let segmentationThreshold = 0.5;
const canvas1 = document.getElementById('output1');
let ctx1 = canvas1.getContext('2d');
const canvas2 = document.getElementById('output2');
let ctx2 = canvas2.getContext('2d');
const videoWidth = 256;
const videoHeight = 256;
let segmentation = 0;

// The video element on the page to display the webcam
let video = document.getElementById('thevideo');


//hide canvas feeds (except the final canvas outputB)
video.style.display = 'none';
document.getElementById('output2').style.display = 'none';

// Constraints - what do we want?
let constraints = {
    audio: false,
    video: true
}

// Prompt the user for permission, get the stream
navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.width = videoWidth;
        video.height = videoHeight;
        video.srcObject = stream;
        video.onloadedmetadata = function (e) {
            video.play();
            runModel();
        };
    })
    .catch(function (err) {
        alert(err);
    });

//preload the personSegmentation from prediction to speed up process
let loaded = personSegmentation.load();

// mask the video feed based on segmentation data
async function maskVideo(segmentation) {
    // do the standard masking
    ctx1.drawImage(video, 0, 0, videoWidth, videoHeight);

    //manipulate pixels
    // mask person
    let frame = ctx1.getImageData(0, 0, videoWidth, videoHeight);
    let l = frame.data.length;
    //create array of image data
    for (let i = 0; i < l; i++) {
        if (segmentation[i] == 1) {
            //draw video mask
            frame.data[i * 4 + 0] = 0;
            frame.data[i * 4 + 1] = 0;
            frame.data[i * 4 + 2] = 255;
            frame.data[i * 4 + 3] = 255;
        }
        if (segmentation[i] == 0) {
            //draw white background
            frame.data[i * 4 + 0] = 255;
            frame.data[i * 4 + 1] = 0;
            frame.data[i * 4 + 2] = 0;
            frame.data[i * 4 + 3] = 255;
        }
    }
    // write newImage (segmentation) on canvas2
    ctx2.putImageData(frame, 0, 0);

};

// main function in cascade-mode
async function runModel() {
    loaded.then(function (net) {
        return net.estimatePersonSegmentation(video, flipHorizontal, 8, segmentationThreshold)
    }).then(function (segmentation) {
        maskVideo(segmentation);
        // loops the function in a browser-sustainable way
        requestAnimationFrame(runModel);
    });
}

// temporarily save canvas image to local storage for future uses
//function localDown() {
//    let dataURL = document.getElementById('output2').toDataURL("image/png");
//    let imgData = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
//    localStorage.setItem("imgData", imgData);
//}
