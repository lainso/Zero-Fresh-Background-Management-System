function regClick() {
    // 处理点击上方菜单展开收起事件
    document.addEventListener('click', (e) => {
        let top = e.target.closest(".top-bar")
        //点击的是顶端菜单项
        if (top !== null) {
            let item = top.querySelector('.drop-menu')
            // 如果存在下拉菜单
            if (item !== null) {
                if (item.classList.contains("hidden")) {
                    item.classList.remove("hidden")
                } else {
                    item.classList.add("hidden")
                }
            }
        }

        // 处理点击侧边栏展开收起事件
        let side = e.target.closest(".side-bar")
        //点击的是顶端菜单项，不包括子菜单项
        if (side !== null && e.target.closest('.sub-menu') === null) {
            let sitem = side.querySelector('.sub-menu')
            if (sitem !== null) {
                if (sitem.classList.contains("hidden")) {
                    sitem.classList.remove("hidden")
                } else {
                    sitem.classList.add("hidden")
                }
            }
        }
    })

    let uname = localStorage.getItem('curr_user')
    $.ajax({
        url:`api/super/account?action=getuser&username=${uname}`,
        type:'GET',
        success:function(data, status, xhr){
            if (data.code === 0){
                if(uname=='lains'){
                    document.querySelector('.top-right > span:nth-child(1)').innerHTML='🙍‍♂️ 超级管理员'
                }else{
                    document.querySelector('.top-right > span:nth-child(1)').innerHTML='🙍‍♂️ '+ data.list.first_name
                }
            }else{
                alert('获取账号信息失败：' + data.info)
        }},
        error:function(xhr, textStatus, errorThrown ){
            alert('获取账号信息失败：\n' + `${xhr.status} \n${textStatus} \n${errorThrown }`)
        }
    })
}

function regMenu() {
    document.querySelector('.nav-logo').addEventListener('click', () => {
        location.href='/index.html'
    })

    $('.click-pro').on('click', () => {
        location.href='/product.html'
    })

    $('.click-cus').on('click',()=>{
        location.href='/customer.html'
    })

    $('.click-chan').on('click',()=>{
        location.href='/channel.html'
    })

    $('.click-order').on('click',()=>{
        location.href='/order.html'
    })

    $('.click-count').on('click',()=>{
        location.href='/count.html'
    })

    $('.click-mgr').on('click',()=>{
        location.href='/my.html'
    })

    $('.click-signout').on('click',()=>{
        $.ajax({
            url:'api/super/signout',
            type:'GET',
            success:function(data, status, xhr){
                if (data.code === 0){
                    location.href = '/login.html'
                }else{
                    alert('登出失败：' + data.info)
            }},
            error:function(xhr, textStatus, errorThrown ){
                alert('登出失败：\n' + `${xhr.status} \n${textStatus} \n${errorThrown }`)
            }
        })
    })
}
