let icon = document.querySelector(".menuIcon");
let menu = document.querySelector(".home .menuNav");
let flag = 0
icon.addEventListener("click",function () {
    if (flag==0) {
        menu.classList.add("effect2");
        icon.classList.add("effect");
        flag =1;
    }
    else{
        menu.classList.remove("effect2");
        icon.classList.remove("effect");
        flag=0;
    }
})
