let pix2pix, lstm;

// get saved image from local storage
$(function () {
    let dataImage = localStorage.getItem('imgData');
    let segImg = document.getElementById('seg');
    segImg.src = "data:image/png;base64," + dataImage;
});

// p5.js canvas setup
function setup() {
    // Create pix2pix & lstm methods with pre-trained models
    pix2pix = ml5.pix2pix('model/pix2pix/humanseg_BtoA_2000.pict', modelLoaded);
    lstm = ml5.LSTMGenerator('model/lstm/humansofny/', modelReady);
}


// A function to be called when the models have loaded
// pix2pix
function modelLoaded() {
    console.log('pix2pix model loaded');
    // pix2pix transfer
    transfer();
    $('#seg').addClass('hidden');
}
// lstm
function modelReady() {
    console.log('lstm model loaded');
    // lstm parameters
    lstm.generate({
            seed: '.',
            length: 300,
            temperature: 0.5
        },
        function (err, results) {
            if (results.length != 0) {
                // refine generated text
                let refinedRes = results.split(/\.(?=[^\.]+$)/);
                console.log(refinedRes[0]);
                $('#caption').text(refinedRes[0] + '.').css('padding', '20px');
                // create button element for closing iframe
                $('<button id="close" onclick="closeEl();">xxHRRRMANxx</button>').appendTo('#app');
                // hide loader
                if ($('#caption').text().length > 1) {
                    $('#loader', window.parent.document).fadeOut();
                }
            }
        });
}

// pix2pix transfer function
function transfer() {
    // Select canvas DOM element
    const canvasElement = document.getElementById('seg');
    // Apply pix2pix transformation
    pix2pix.transfer(canvasElement, function (err, result) {
        if (err) {
            console.log(err);
        }
        if (result && result.src) {
            // Create an image based result
            document.getElementById('output').src = result.src;
            document.getElementById('output').style.width = "512px";
            $('body').css({
                'background-image': 'url("./images/bg_distorted.png")',
                'background-repeat': 'no-repeat',
                'background-size': 'cover'
            });
        }
    });
}

// close iframe
function closeEl() {
    parent.document.getElementById('overlay').style.display = 'none';
}
