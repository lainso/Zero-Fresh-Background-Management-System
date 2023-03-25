// 首页日期时间获取函数
function regTime() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    minute = minute < 10 ? "0" + minute : minute;
    second = second < 10 ? "0" + second : second;
    let currentTime = `${year}年${month}月${day}日
    
    ${hour}:${minute}:${second}`
    document.querySelector('.time').innerText = currentTime;
}

window.onload = () => {
    regClick();
    regMenu();
    regTime();
    setInterval("regTime()", 1000);
}