// matching-pfp.js
document.addEventListener('DOMContentLoaded', () => {
  const upload = document.getElementById('upload');
  const circularCheckbox = document.getElementById('circular');
  const zoomSlider = document.getElementById('zoom');
  const output = document.getElementById('output');

  let originalFile = null;
  let isGif = false;
  let originalImage = null;
  let gifFrames = null;

  // Load gifuct-js and gif.js
  const GIF_JS_CDN = 'https://cdn.jsdelivr.net/npm/gif.js.optimized/dist/gif.js';
  const GIFUCT_JS_CDN = 'https://cdn.jsdelivr.net/npm/gifuct-js/dist/gifuct.min.js';

  upload.addEventListener('change', async () => {
    output.innerHTML = '';
    const file = upload.files[0];
    if(!file) return;

    originalFile = file;
    isGif = file.type === 'image/gif';

    if(isGif){
      // Read GIF frames
      const buffer = await file.arrayBuffer();
      const gif = window.GIFuct.parseGIF(buffer);
      gifFrames = window.GIFuct.decompressFrames(gif, true);
      drawGifPreview();
    } else {
      // Static image
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        originalImage = img;
        drawStaticPreview();
      }
    }
  });

  zoomSlider.addEventListener('input', () => {
    if(isGif && gifFrames) drawGifPreview();
    else if(originalImage) drawStaticPreview();
  });

  circularCheckbox.addEventListener('change', () => {
    if(isGif && gifFrames) drawGifPreview();
    else if(originalImage) drawStaticPreview();
  });

  // Draw static image splits
  function drawStaticPreview() {
    const zoom = parseFloat(zoomSlider.value);
    const width = originalImage.width;
    const height = originalImage.height;
    const halfWidth = width / 2;

    output.innerHTML = '';
    [0, halfWidth].forEach(startX => {
      const canvas = document.createElement('canvas');
      canvas.width = halfWidth * zoom;
      canvas.height = height * zoom;
      const ctx = canvas.getContext('2d');

      if(circularCheckbox.checked){
        const radius = Math.min(canvas.width, canvas.height)/2;
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, radius, 0, Math.PI*2);
        ctx.clip();
      }

      ctx.drawImage(originalImage,
        startX,0,halfWidth,height,
        0,0,canvas.width,canvas.height
      );

      const imgEl = document.createElement('img');
      imgEl.src = canvas.toDataURL();
      output.appendChild(imgEl);
    });
  }

  // Draw GIF splits
  async function drawGifPreview() {
    const zoom = parseFloat(zoomSlider.value);
    const width = gifFrames[0].dims.width;
    const height = gifFrames[0].dims.height;
    const halfWidth = width / 2;

    output.innerHTML = '';
    [0, halfWidth].forEach(startX => {
      const gif = new GIF({
        workers: 2,
        workerScript: GIF_JS_CDN.replace('gif.js','gif.worker.js'),
        width: halfWidth * zoom,
        height: height * zoom
      });

      gifFrames.forEach(frame => {
        const canvas = document.createElement('canvas');
        canvas.width = halfWidth * zoom;
        canvas.height = height * zoom;
        const ctx = canvas.getContext('2d');

        if(circularCheckbox.checked){
          const radius = Math.min(canvas.width, canvas.height)/2;
          ctx.beginPath();
          ctx.arc(canvas.width/2, canvas.height/2, radius, 0, Math.PI*2);
          ctx.clip();
        }

        const imageData = frame.getImageData();
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = width;
        tmpCanvas.height = height;
        tmpCanvas.getContext('2d').putImageData(imageData,0,0);

        ctx.drawImage(tmpCanvas, startX, 0, halfWidth, height, 0, 0, canvas.width, canvas.height);

        gif.addFrame(ctx, {copy:true, delay:frame.delay || 100});
      });

      gif.on('finished', blob => {
        const url = URL.createObjectURL(blob);
        const imgEl = document.createElement('img');
        imgEl.src = url;
        output.appendChild(imgEl);
      });

      gif.render();
    });
  }

});
