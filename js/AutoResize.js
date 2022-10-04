

// body宽高
let cw = 1080, ch = 1920;
let body = document.body;
body.style.width = `${cw}px`;
body.style.height = `${ch}px`;

// 对body进行缩放
function windowResize() {
    // 窗口宽高
    let w = window.innerWidth, h = window.innerHeight;
    // 缩放比例
    let r = w / cw < h / ch ? w / cw : h / ch;

    body.style.transform = `scale(${r})`;
    // 因为scale是以body的原中心点为基准进行缩放，所以缩放之后需要调整外边距，使其位于窗口的中心位置
    body.style.marginLeft = (-(cw - r * cw) / 2 + (w - r * cw) / 2) + 'px';
    body.style.marginTop = (-(ch - r * ch) / 2 + (h - r * ch) / 2) + 'px';
    body.style.marginBottom = (-(h > ch ? h : ch - r * ch)) + 'px';
    body.style.marginRight = (-(w > cw ? w : cw - r * cw)) + 'px';
}

windowResize();
// 监听窗口尺寸变化
window.addEventListener('resize', windowResize);