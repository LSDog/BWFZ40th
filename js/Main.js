

let engClickable = false;
let engClicked = false;
let engAskClickTask;
let audio = new Audio('/audio/1.mp3');
audio.volume = 0.3;

do_test.addEventListener('click', () => {
    log('do_test');
});

// 让所有 bubble 缩放中心设为元素中点
document.getElementsByClassName('bubble');

setTimeout(() => {

    step1().then(() =>
        step2().then(() =>
            step3().then(() =>
                step4().then(() =>
                    step5().then(() =>
                        step6().then(() => {
                            alert('动画测试完毕')
                        }))))));

}, 1000);

function step1() {

    return new Promise((ok) => {
        /* English */
        fadeIn(bubble_english, 2000);
        translate(bubble_english, Vec2.of(510, 15), 2000, EaseInOutFunc.SQRT_EASEOUT).then(askClick);
        let floating = new Floating("bubble_english", bubble_english, 2);
        floating.start();

        // 添加点击引导 (复制元素后置底半透明缩放动画)
        function askClick() {
            bubble_english_bg = bubble_english.cloneNode(true);
            bubble_english_bg.id = 'bubble_english_bg';
            bubble_english_bg.style.opacity = 0;
            shift(bubble_english_bg, Vec2.of(-15, -30));
            bubble_english.style.zIndex = 0;
            bubble_english_bg.style.zIndex = -1;
            bubble_english.appendChild(bubble_english_bg);
            let bigScale = 1.4;
            let scale = bigScale;
            engAskClickTask = setInterval(() => { // scale = 1.4~0.7 更改大小
                if (scale == bigScale) {
                    fadeIn(bubble_english_bg, 250).then(() => fadeOut(bubble_english_bg, 750));
                }
                if (scale > 0.7) bubble_english_bg.style.scale = scale;
                scale -= 0.02;
                if (scale <= 0) {
                    scale = bigScale;
                }
            }, 35);
            engClickable = true;
        }

        // 点击事件
        bubble_english.addEventListener('click', () => {

            if (!engClickable) return;
            if (bubble_english.clicked) return;
            bubble_english.clicked = true;

            clickPop(bubble_english, 0.96, 400);

            clearInterval(engAskClickTask); // 停止引导动画
            fadeOut(bubble_english_bg, 4000).then(() => bubble_english_bg.remove()); // 淡出+删除引导动画元素

            audio.play(); // 放声音

            setTimeout(() => {
                audio.pause();
                ok(); // 回调
            }, 1000);

        });
    });

}

function bubble_clicked(elem, ok, audio) {
    elem.addEventListener('click', () => {
        if (elem.clicked) return;
        elem.clicked = true;
        clickPop(elem, 0.96, 400);
        audio.play();
        setTimeout(() => {
            audio.pause();
            ok();
        }, 1000);
    });
}

function step2() {
    return new Promise((ok) => {
        fadeIn(bubble_german, 1500);
        translate(bubble_german, Vec2.of(-510, -25), 1500, EaseInOutFunc.NORMAL_EASEOUT).then(bubble_clicked(bubble_german, ok, audio));
        let floating = new Floating("bubble_german", bubble_german, 2);
        floating.start();
    });
}

function step3() {
    return new Promise((ok) => {
        fadeIn(bubble_japan, 1500);
        translate(bubble_japan, Vec2.of(600, 200), 1500, EaseInOutFunc.NORMAL_EASEOUT).then(bubble_clicked(bubble_japan, ok, audio));
        let floating = new Floating("bubble_japan", bubble_japan, 2);
        floating.start();
    });
}

function step4() {
    return new Promise((ok) => {
        fadeIn(bubble_span, 1000);
        translate(bubble_span, Vec2.of(-500, -350), 1000, EaseInOutFunc.NORMAL_EASEOUT).then(bubble_clicked(bubble_span, ok, audio));
        let floating = new Floating("bubble_span", bubble_span, 2);
        floating.start();
    });
}

function step5() {
    return new Promise((ok) => {
        fadeIn(bubble_russia, 1000);
        translate(bubble_russia, Vec2.of(650, -200), 1000, EaseInOutFunc.NORMAL_EASEOUT).then(bubble_clicked(bubble_russia, ok, audio));
        let floating = new Floating("bubble_russia", bubble_russia, 2);
        floating.start();
    });
}

function step6() {
    return new Promise((ok) => {
        fadeIn(bubble_china, 1500);
        translate(bubble_china, Vec2.of(0, -400), 1500, EaseInOutFunc.SMALL_EASEOUT).then(() => {
            bubble_china.addEventListener('click', () => {
                if (bubble_china.clicked) return;
                bubble_china.clicked = true;
                audio.play();
                setTimeout(() => {
                    audio.pause();
                    ok();
                }, 4000);
            });
        });
    });
}