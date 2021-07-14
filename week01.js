// 输入十进制的数据库自增id，输出对应的64进制表达，以便获得更短的字符串
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// binary to string lookup table
const b2s = alphabet.split('');

// string to binary lookup table
// 123 == 'z'.charCodeAt(0) + 1
const s2b = new Array(123);
for (let i = 0; i < alphabet.length; i++) {
  s2b[alphabet.charCodeAt(i)] = i;
}

// number to base64
const ntob = (number) => {
  if (number < 0) return `-${ntob(-number)}`;

  let lo = number >>> 0;
  let hi = (number / 4294967296) >>> 0;

  let right = '';
  while (hi > 0) {
    right = b2s[0x3f & lo] + right;
    lo >>>= 6;
    lo |= (0x3f & hi) << 26;
    hi >>>= 6;
  }

  let left = '';
  do {
    left = b2s[0x3f & lo] + left;
    lo >>>= 6;
  } while (lo > 0);

  console.log(number, left, right);

  return left + right;
};

// decimalToBase64(-12.43)
ntob(100086) // Yb2


// 加载图片并输出灰度图

// 异步加载图片
export function loadImage(src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    return new Promise((resolve) => {
      img.onload = () => {
        resolve(img);
      };
      img.src = src;
    });
  }
  
  const imageDataContext = new WeakMap();
  // 获得图片的 imageData 数据
  export function getImageData(img, rect = [0, 0, img.width, img.height]) {
    let context;
    if(imageDataContext.has(img)) context = imageDataContext.get(img);
    else {
      const canvas = new OffscreenCanvas(img.width, img.height);
      context = canvas.getContext('2d');
      context.drawImage(img, 0, 0);
      imageDataContext.set(img, context);
    }
    return context.getImageData(...rect);
  }
  
  // 循环遍历 imageData 数据
  export function traverse(imageData, pass) {
    const {width, height, data} = imageData;
    for(let i = 0; i < width * height * 4; i += 4) {
      const [r, g, b, a] = pass({
        r: data[i] / 255,
        g: data[i + 1] / 255,
        b: data[i + 2] / 255,
        a: data[i + 3] / 255,
        index: i,
        width,
        height,
        x: ((i / 4) % width) / width,
        y: Math.floor(i / 4 / width) / height});
      data.set([r, g, b, a].map(v => Math.round(v * 255)), i);
    }
    return imageData;
  }

  const canvas = document.getElementById('paper');
  const context = canvas.getContext('2d');

  (async function () {
    // 异步加载图片
    const img = await loadImage('assets/girl1.jpg');
    // 获取图片的 imageData 数据对象
    const imageData = getImageData(img);
    // 遍历 imageData 数据对象
    traverse(imageData, ({r, g, b, a}) => { // 对每个像素进行灰度化处理
      const v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return [v, v, v, a];
    });
    // 更新canvas内容
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    context.putImageData(imageData, 0, 0);
  }());