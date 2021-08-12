import './style.css';
import { nets, draw, detectAllFaces } from '@vladmandic/face-api'

const md = navigator.mediaDevices
const hasGetUserMedia = !!(md && md.getUserMedia)

const shotsample: HTMLImageElement = document.querySelector(".shot-sample")
const shots: HTMLImageElement = document.querySelector(".shots")

const videoScreen: HTMLVideoElement = document.querySelector(".video-screen")
const videoCam: HTMLVideoElement = document.querySelector(".video-cam")
const canvas = document.createElement("canvas")
const faceCanvas = document.createElement("canvas")
const maxRow = 4
const maxCol = 3
let imageRow = 1
let imageCol = 1

//const human = new Human({ backend: 'webgl', warmup: 'face', modelBasePath: './models' })

if (hasGetUserMedia) {
    // @ts-ignore
    const dispMedia: Promise<MediaStream> = md.getDisplayMedia({
        video: {
            height: { max: 128 }
        }
    })
    const userMedia: Promise<MediaStream> = md.getUserMedia({
        video: {
            height: { max: 128 }
        },
        audio: true
    })
    Promise.all([dispMedia, userMedia]).then(([screenStream, camStream]) => {
        videoScreen.srcObject = screenStream;
        videoCam.srcObject = camStream;

        let camInit = false
        let screenInit = false
        videoCam.oncanplay = async () => {
            camInit = true
            camInit && screenInit && await setupMonitor()
        }
        videoScreen.oncanplay = async () => {
            screenInit = true
            camInit && screenInit && await setupMonitor()
        }
    });
} else {
    alert("getUserMedia() is not supported by your browser");
}

async function setupMonitor() {

    await nets.ssdMobilenetv1.loadFromUri('./models')

    const mediaWidth = videoScreen.videoWidth + videoCam.videoWidth
    const mediaHeigth = videoScreen.videoHeight

    canvas.width = mediaWidth * maxCol
    canvas.height = mediaHeigth * maxRow
    setInterval(async () => {
        const startX = mediaWidth * (imageCol - 1)
        const startY = mediaHeigth * (imageRow - 1)
        const time = new Date()

        const ctx = canvas.getContext("2d")
        ctx.drawImage(videoCam, startX, startY)

        const faces = await detectAllFaces(videoCam)
        const noFace = faces.length == 0
        const multiFace = faces.length > 1
        const faceCtx = faceCanvas.getContext('2d')
        faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height)
        faceCtx.beginPath()
        faceCtx.strokeStyle = "rgba(255, 0, 0, 0.3)"
        faceCtx.lineWidth = 3
        for (const face of faces) {
            const box = face.box
            faceCtx.rect(box.x, box.y, box.width, box.height)
        }
        faceCtx.stroke()

        ctx.drawImage(faceCanvas, startX, startY)
        ctx.beginPath();
        ctx.rect(startX, startY, 60, 12);
        ctx.fillStyle = noFace ? 'yellow' : (multiFace ? 'red' : 'white');
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.fillText(time.toLocaleTimeString(), startX + 2, startY + 10)
        ctx.drawImage(videoScreen, startX + videoCam.videoWidth, startY)
        shotsample.src = canvas.toDataURL("image/webp")

        if (imageCol == maxCol && imageRow == maxRow) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            imageCol = 1
            imageRow = 1
        } else if (imageCol == maxCol && imageRow < maxRow) {
            imageCol = 1
            imageRow++
        } else if (imageCol < maxCol) {
            imageCol++
        }
    }, 1000)
}