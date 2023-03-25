function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function getOrderList(pagenum = 1, pagesize = 4, keywords = '') {
    document.querySelector(".main-list").innerHTML = ''
    var id_arr = new Array
    $.ajax({
        type: 'GET',
        url: `api/super/orders?action=showorder&pagesize=${pagesize}&pagenum=${pagenum}&keywords=${keywords}`,
        success: function (data, status, xhr) {
            sessionStorage.setItem('total', data.total)
            document.querySelector('#t-page').innerText = Math.ceil(data.total / 4)
            document.querySelector('#page-num').value = pagenum
            if (data.code !== 0) {
                alert("操作失败：" + data.info)
                return;
            }
            for (var item of data.list) {
                let str = JSON.parse(item.productlist)
                let p = `<div class='main-list-item'>
                            <p><span class='item-head'>创建时间</span><span>${item.time}</span><button class="del-btn">删除</button></p>
                            <p><span class='item-head'>客户名</span><span>${item.customer__name}</span></p>
                            <p><span class='item-head'>订单需求</span><span class='pstr'>${str}</span></p>
                            <p><span class='item-head'>备注</span><span>${item.describe}</span></p>
                        </div>`
                document.querySelector(".main-list").insertAdjacentHTML("beforeend", p)
                id_arr.push(item.id)
            }
            sessionStorage.setItem('aid', JSON.stringify(id_arr))
            regDel();
            fixInfo();
        },
        error: function (xhr, textStatus, errorThrown) {
            alert('操作失败：\n' + `${xhr.status} \n${textStatus} \n${errorThrown}`)
        }
    })

}

function regTime() {
    document.getElementById('add-time').value = ''
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    minute = minute < 10 ? "0" + minute : minute;
    second = second < 10 ? "0" + second : second;
    let currentTime = `${year}-${month}-${day} ${hour}:${minute}:${second}`
    document.getElementById('add-time').value = currentTime;
}

function regAdd() {
    var plist = []

    // 注册添加按钮
    let addBtn = document.querySelector('#add-btn')
    addBtn.addEventListener('click', () => {
        let form = document.querySelector('.add-form')
        if (form !== null) {
            if (form.classList.contains("hidden")) {
                addBtn.innerText = '隐藏添加功能块'
                form.classList.remove("hidden")
                regTime()
            } else {
                form.classList.add("hidden")
                addBtn.innerText = '展开添加功能块'
            }
        }
    })

    // 添加产品按钮
    var win = document.querySelector('.fix-area')
    document.querySelector('#add-pro').addEventListener('click', () => {
        document.querySelector('.fix-area').classList.remove("hidden")
    })
    document.querySelector('#fix-cancel').addEventListener('click', () => {
        win.classList.add('hidden')
    })
    document.querySelector('#fix-submit').addEventListener('click', () => {
        let pname = document.querySelector('#fix-name').value
        let pnum = document.querySelector('#fix-num').value
        let ccid = -1
        $.ajax({
            type: 'GET',
            url: `api/super/products?action=showproducts&pagesize=1&pagenum=1&keywords=${pname}`,
            success: function (data, status, xhr) {
                if (data.code !== 0) {
                    alert("获取产品信息失败，请检查产品名\n" + data.info)
                    return;
                } else {
                    if (data.total == 1) {
                        ccid = data.list[0].id
                        plist.push({
                            'id': ccid,
                            'amount': pnum,
                        })
                        alert('产品信息添加成功，可继续添加或提交订单')
                    } else {
                        alert('获取产品信息失败，请检查产品名')
                    }
                }
                win.classList.add('hidden')
                sessionStorage.setItem('pdlist', JSON.stringify(plist))
            },
            error: function (xhr, textStatus, errorThrown) {
                alert('获取产品信息失败，请检查产品名：\n' + `${xhr.status} \n${textStatus} \n${errorThrown}`)
            }
        })

        // 获取客户id
        let cname = document.querySelector('#add-cname').value
        $.ajax({
            type: 'GET',
            url: `api/super/customer?action=showcustomer&pagesize=1&pagenum=1&keywords=${cname}`,
            success: function (data, status, xhr) {
                if (data.code !== 0) {
                    alert("获取客户列表失败，请检查客户名：" + data.info)
                    return;
                } else {
                    sessionStorage.setItem('cusid', data.list[0].id)
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                alert('获取客户列表失败，请检查客户名：\n' + `${xhr.status} \n${textStatus} \n${errorThrown}`)
            }
        })
    })

    // 注册提交按钮
    document.querySelector('#add-submit').addEventListener('click', () => {
        let time = document.getElementById('add-time').value
        let des = document.querySelector('#add-des').value

        // 发送添加请求
        $.ajax({
            url: 'api/super/orders',
            type: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            contentType: 'application/json',
            data: JSON.stringify({
                action: 'addorder',
                data: {
                    time: time,
                    customerid: sessionStorage.getItem('cusid'),
                    productlist: sessionStorage.getItem('pdlist'),
                    describe: des,
                }
            }),
            success: function (data, status, xhr) {
                if (data.code === 0) {
                    console.log('添加成功，新订单id：' + data.id)
                    document.querySelector(".main-list").innerHTML = ''
                    getOrderList();
                } else {
                    alert('添加失败')
                }
                regTime();
                $('#add-cname').val('')
                $('#add-des').val('')
            },
            error: function (xhr, textStatus, errorThrown) {
                alert('添加失败：\n' + `${xhr.status} \n${textStatus} \n${errorThrown}`)
            }
        })
    })
}

function regSea() {
    var num = 1
    let seaBtn = document.querySelector('#sea-btn')
    seaBtn.addEventListener('click', () => {
        let form = document.querySelector('.sea-text')
        if (form !== null) {
            if (form.classList.contains("hidden")) {
                seaBtn.innerText = '隐藏搜索功能块'
                form.classList.remove("hidden")
            } else {
                form.classList.add("hidden")
                seaBtn.innerText = '展开搜索功能块'
            }
        }
    })

    document.querySelector('#search').addEventListener('click', () => {
        var keys = document.querySelector('#sea-name').value
        document.querySelector(".main-list").innerHTML = ''
        getOrderList(1, 4, keys)
    })

    // 上一页
    document.querySelector('#up-page').addEventListener('click', () => {
        let tpage = Math.ceil(sessionStorage.getItem('total') / 4)
        let keys = document.querySelector('#sea-name').value
        if (num > 1 && num <= tpage) {
            num -= 1
            document.querySelector(".main-list").innerHTML = ''
            getOrderList(num, 4, keys)
        }
    })

    // 下一页
    document.querySelector('#down-page').addEventListener('click', () => {
        let tpage = Math.ceil(sessionStorage.getItem('total') / 4)
        let keys = document.querySelector('#sea-name').value
        if (num >= 1 && num < tpage) {
            num += 1
            document.querySelector(".main-list").innerHTML = ''
            getOrderList(num, 4, keys)
        }
    })

    // 页码跳转按钮
    document.querySelector('#jump-btn').addEventListener('click', () => {
        let j_num = document.querySelector('#page-num').value
        let tpage = Math.ceil(sessionStorage.getItem('total') / 4)
        if (j_num > 0 && j_num <= tpage) {
            num = Number(j_num)
            let keys = document.querySelector('#sea-name').value
            document.querySelector(".main-list").innerHTML = ''
            getOrderList(j_num, 4, keys)
        } else {
            alert('超出页码范围')
        }
    })
}

function fixInfo() {
    var aids = JSON.parse(sessionStorage.getItem('aid'))
    for (var i = 0; i < (aids.length); i++) {
        let obj = JSON.parse(document.querySelectorAll('.pstr')[i].innerText)
        document.querySelectorAll('.pstr')[i].innerHTML=''
        for (let j = 0; j < obj.length; j++) {
            $.ajax({
                url: `api/super/products?action=getPname&pid=${obj[j].id}`,
                type: 'GET',
                async: false,
                success: function (data, status, xhr) {
                    if (data.code === 0) {
                        let p = `<span class='list-info'>${data.list.name}x${obj[j].amount}</span>`
                        console.log(i)
                        document.querySelectorAll('.pstr')[i].insertAdjacentHTML("beforeend", p)
                    } else {
                        alert('获取产品信息失败：' + data.info)
                    }
                },
                error: function (xhr, textStatus, errorThrown) {
                    alert('操作失败：\n' + `${xhr.status} \n${textStatus} \n${errorThrown}`)
                }
            })
        }
    }
}

function regDel() {
    var aids = JSON.parse(sessionStorage.getItem('aid'))
    // 注册删除按钮
    for (let i = 0; i < (aids.length); i++) {
        document.querySelectorAll('.del-btn')[i].addEventListener('click', () => {
            let res = confirm('Warning：是否确认删除此条记录？')
            if (res == true) {
                $.ajax({
                    url: 'api/super/orders',
                    type: 'DELETE',
                    headers: {'X-CSRFToken': getCookie('csrftoken')},
                    contentType: 'application/json',
                    data: JSON.stringify({
                        action: 'delorder',
                        id: aids[i]
                    }),
                    success: function (data, status, xhr) {
                        if (data.code === 0) {
                            document.querySelector(".main-list").innerHTML = ''
                            getOrderList();
                        } else {
                            alert('删除失败：' + data.info)
                        }
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        alert('删除失败：\n' + `${xhr.status} \n${textStatus} \n${errorThrown}`)
                    }
                })
            } else {
                console.log('用户取消删除操作')
            }
        })
    }
}

window.onload = () => {
    regClick();
    regMenu();
    getOrderList();
    regAdd();
    regSea();
}