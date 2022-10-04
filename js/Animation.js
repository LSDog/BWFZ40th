
const FPS = 30; // 帧每秒
const FPM = FPS / 1000 // 帧每毫秒
const MPF = 1000 / FPS; // 毫秒每帧

const ALMOST_ONE = 0.9999999999998; // 狗血精度

class Vec2 {
    x = 0;
    y = 0;
    constructor(x, y) { this.setPos(x, y); }
    setPos(x, y) { this.x = x || 0; this.y = y || 0; }
    setX(x) { this.x = x || 0; return this; }
    setY(y) { this.y = y || 0; return this; }
    add(vec2) { this.x += vec2.x; this.y += vec2.y; return this; }
    sub(vec2) { this.x -= vec2.x; this.y -= vec2.y; return this; }
    mul(num) { this.x *= num; this.y *= num; return this; }
    div(num) { this.x /= num; this.y /= num; return this; }
    dot(vec2) { return this.x * vec2 || 0 + this.y * vec2 || 0; }
    clone() { return new Vec2(this.x, this.y); }
    static of(x, y) { return new Vec2(x, y); }
}

class EaseInOutFunc {
    static TINY_EASEIN = (x) => x * x;
    static SMALL_EASEIN = (x) => Math.pow(x, 3);
    static NORMAL_EASEIN = (x) => Math.pow(x, 4);
    static SQRT_EASEIN = (x) => 1 - Math.sqrt(1 - x * x);
    static BIG_EASEIN = (x) => Math.pow(x, 5);
    static TINY_EASEOUT = (x) => 2 * x - x * x;
    static SMALL_EASEOUT = (x) => 1 + Math.pow(x - 1, 3);
    static NORMAL_EASEOUT = (x) => 1 - Math.pow(x - 1, 4);
    static SQRT_EASEOUT = (x) => Math.sqrt(1 - (x - 1) ** 2);
    static BIG_EASEOUT = (x) => 1 + Math.pow(x - 1, 5);
}

function getPos(elem) {
    if (elem.x != null && elem.y != null) {
        return Vec2.of(elem.x, elem.y);
    }
    let left = (String)(elem.style.left);
    let top = (String)(elem.style.top);
    return new Vec2(parseFloat(left.substring(0, left.length - 2)), parseFloat(top.substring(0, top.length - 2)));
}

function setPos(elem, x, y) {
    elem.x = x;
    elem.style.left = elem.x + 'px';
    elem.y = y;
    elem.style.top = elem.y + 'px';
}

function shift(elem, vec2) {
    let pos = getPos(elem);
    elem.x = pos.x + vec2.x;
    elem.style.left = elem.x + 'px';
    elem.y = pos.y + vec2.y;
    elem.style.top = elem.y + 'px';
}

/**
 * 移动页面中的元素，支持缓动。
 * @param {Element} elem 要移动的DOM元素
 * @param {Vec2} vec2 总路程
 * @param {number} time 走多久 (毫秒)
 * @param {Function | null} func 缓动函数 见 {@link EaseInOutFunc} 不写默认 y=x 线性
 * @returns {Promise} 使用 .then(() => {...}) 执行动画结束后的代码
 */
function translate(elem, vec2, time, func) {
    func = func || ((x) => x);
    return new Promise((ok) => {
        let frames = time * FPM; // 一共多少帧
        let step = 1 / frames // 每一帧的移动距离所占百分比
        let stepped = 0; // 移动了百分之多少 (stepped == 1 则完成移动)
        let thisY, lastY = 0;
        let interval = setInterval(() => {
            thisY = func(stepped + step);
            shift(elem, vec2.clone().mul(thisY - lastY)); // thisY-lastY 为这一步占总步数的倍数
            lastY = thisY;
            if (stepped >= ALMOST_ONE) { clearInterval(interval); ok(); }
            stepped += step;
        }, MPF);
    });
}

class Floating {

    constructor(name, elem, height) {
        this.name = name;
        this.elem = elem;
        this.height = height;
        let prev = Floating.staticMap.get(name);
        if (prev != null) {
            prev.stop();
        }
        Floating.staticMap.set(name, this);
    }

    static staticMap = new Map();
    static get(name) {
        return this.animMap.get(name);
    }
    static stopAll() {
        this.staticMap.forEach((f) => f.stop());
    }

    playing = false;
    interval;
    i = 0;
    vec2 = new Vec2();

    stop() {
        clearInterval(this.interval);
    }

    start() {
        if (this.playing) return;
        this.playing = true;
        this.interval = setInterval(() => {
            this.vec2.y = Math.sin(this.i) * this.height;
            this.i += 0.1;
            shift(this.elem, this.vec2);
        }, 40);
    }

}

function getOpacity(elem) {
    let opacity = elem.style.opacity;
    if (opacity != '') return (Number)(opacity);
    opacity = getComputedStyle(elem).opacity;
    if (opacity != '' || opacity != 'none') return (Number)(opacity);
    else return 1;
}

function setOpacity(elem, opacity) {
    elem.style.opacity = opacity;
}

function addOpacity(elem, opacity) {
    elem.style.opacity = getOpacity(elem) + opacity;
}

/**
 * 淡入/淡出
 * @param {Element} elem DOM元素
 * @param {number} opacity 目标不透明度 不写默认1
 * @param {number} time 所耗时间 (微秒)
 * @param {Function | null} func 缓动函数 见 {@link EaseInOutFunc} 不写默认 y=x 线性
 * @returns {Promise} 使用 .then(() => {...}) 执行动画结束后的代码
 */
function fadeTo(elem, opacity, time, func) {
    func = func || ((x) => x);
    return new Promise((ok) => {
        let frames = time * FPM;
        let step = 1 / frames
        let stepped = 0;
        let thisY, lastY = 0;
        let dOpacity = opacity - getOpacity(elem);
        let interval = setInterval(() => {
            thisY = func(stepped + step);
            addOpacity(elem, dOpacity * (thisY - lastY)); // thisY-lastY 为这一步占总步数的倍数
            lastY = thisY;
            if (stepped + step >= ALMOST_ONE) { clearInterval(interval); ok(); }
            stepped += step;
        }, MPF);
    });
}

/**
 * @see {@link EaseInOutFunc} 
 */
function fadeIn(elem, time, func) {
    elem.style.opacity = 0;
    return fadeTo(elem, 1, time, func);
}

/**
 * @see {@link EaseInOutFunc} 
 */
function fadeOut(elem, time, func) {
    return fadeTo(elem, 0, time, func);
}

function getScale(elem) {
    let scale = elem.style.scale;
    if (scale != '') return (Number)(scale);
    scale = getComputedStyle(elem).scale;
    if (scale != '' && scale != 'none') return (Number)(scale);
    else return 1;
}

function setScale(elem, scale) {
    elem.style.scale = scale;
}

function addScale(elem, scale) {
    elem.style.scale = getScale(elem) + scale;
}

function scaleTo(elem, scale, time, func) {
    func = func || ((x) => x);
    return new Promise((ok) => {
        let frames = time * FPM;
        let step = 1 / frames
        let stepped = 0;
        let thisY, lastY = 0;
        let dScale = scale - getScale(elem);
        let interval = setInterval(() => {
            thisY = func(stepped + step);
            addScale(elem, dScale * (thisY - lastY)); // thisY-lastY 为这一步占总步数的倍数
            lastY = thisY;
            if (stepped + step >= ALMOST_ONE) { clearInterval(interval); ok(); }
            stepped += step;
        }, MPF);
    });
}

function clickPop(elem, scale, time) {
    let defaultScale = getScale(elem);
    log(defaultScale + "->" + scale)
    scaleTo(elem, scale, time/2).then(() => scaleTo(elem, defaultScale, time/2));
}