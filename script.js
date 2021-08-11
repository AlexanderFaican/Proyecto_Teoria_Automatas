const video = document.getElementById('video');
const canvass = document.getElementById('canvas');

//Carga los modelos del directorio models e inicia el video cuando estén cargados.
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('js/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('js/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('js/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('js/models')
]).then(iniciaVideo);

//Inicia el streaming desde la webcam.
function iniciaVideo() {

    navigator.getUserMedia = (
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia
    );
    
    if (typeof navigator.mediaDevices.getUserMedia === 'undefined') {
        navigator.getUserMedia({
            video: {}
        }, stream => video.srcObject = stream,
        err => console.error(err));
    } else {
        navigator.mediaDevices.getUserMedia({
            video: {}
        }).then({video: {}}).catch( err => console.error(err));
    }

}

//Una vez iniciado el video se inicia la detección.
video.addEventListener('play', () => {
    

    //Se crea el canvas a partir del video y se agrega al DOM.
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);

    //Dimensiones del video.
    const dimensiones = {
        width: video.width,
        height: video.height
    };

    var context = canvass.getContext('2d');
      snap.addEventListener("click", function() {
          console.log("capturamos");
        context.drawImage(video, 0, 0, 150, 150);
      });


    faceapi.matchDimensions(canvas, dimensiones);

    //Dibuja cada 100ms
    setInterval(async () => {

        //Detecta rostros.
        //withFaceLandmarks para detectar los puntos sobre el rostro (ojos, naríz, boca, cejas y contorno). A partir de los puntos se usa withFaceExpressions para detectar expresiones.
        const rostros = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();

        //Área donde se detecta el rostro.
        const area = faceapi.resizeResults(rostros, dimensiones);

        //Se obtiene el contexto (canvas 2d) y se limpia el canvas para volver a dibujar.
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        //Indica los rotros detectados.
        faceapi.draw.drawDetections(canvas, area);

        //Dibuja los puntos sobre el rostro (ojos, naríz, boca, cejas y contorno).
        faceapi.draw.drawFaceLandmarks(canvas, area);

        //Indica las expresiones detectadas.
        faceapi.draw.drawFaceExpressions(canvas, area);
        rostros.forEach(rostro => {
            
            //Probabilidad de que se está detectando un rostro.
           // console.log("-------------------- Rostro Detectado (" + rostro.detection.score + ") --------------------");
           // console.log("Feliz: " + rostro.expressions.happy);
            if(rostro.expressions.happy > 0.9){
                $("#hola").val('Sonrie');
                $("#snap").click();
            }else{
                $("#hola").val('No sonrie');
            }
                

        });

        //----------------------------------------------------------------------------------------------------
        //Loop para recorrer las detecciones, obtener la probabilidad de que se detectó un rostro y sus expresiones.
        /*
        rostros.forEach(rostro => {
            
            //Probabilidad de que se está detectando un rostro.
            console.log("-------------------- Rostro Detectado (" + rostro.detection.score + ") --------------------");

            //Probabilidad de expresiones detectadas:
            console.log("Neutro: " + rostro.expressions.neutral);
            console.log("Feliz: " + rostro.expressions.happy);
            console.log("Triste: " + rostro.expressions.sad);
            console.log("Enojado: " + rostro.expressions.angry);
            console.log("Temeroso: " + rostro.expressions.fearful);
            console.log("Disgustado: " + rostro.expressions.disgusted);
            console.log("Sorprendido: " + rostro.expressions.surprised);

        });
        */
        //----------------------------------------------------------------------------------------------------

    }, 100);

});