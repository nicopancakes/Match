// matching-pfp.js
document.addEventListener('DOMContentLoaded', () => {
  const upload = document.getElementById('upload');
  const circularCheckbox = document.getElementById('circular');
  const zoomSlider = document.getElementById('zoom');
  const generateBtn = document.getElementById('generate');
  const output = document.getElementById('output');

  let originalFile = null;
  let isGif = false;
  let originalImage = null;
  let gifFrames = null;

  // Track loaded image or GIF
  upload.addEventListener('change', async () => {
    const file = upload.files[0];
    if(!file) return;
    originalFile = file;
    isGif = file.type === 'image/gif';

    if(!isGif){
      originalImage = new Image();
      originalImage.src = URL.createObjectURL(file);
      originalImage.onload = () => {
        output.innerHTML = '';
      };
    } else {
      alert('GIF support requires gifuct.js + gif.js library (not included in this simple demo)');
    }
  });

  generateBtn.addEventListener('click', () => {
    if(!originalFile) return alert('Please upload a file first');
    if(isGif){
      alert('GIF generation not implemented in this simple demo');
      return;
    }
    drawStaticPreview();
  });

  function drawStaticPreview(){
    if(!originalImage) return;
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
});
