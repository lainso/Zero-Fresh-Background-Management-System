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

function getCustomerList(pagenum = 1, pagesize = 4, keywords = '') {
    document.querySelector(".main-list").innerHTML = ''
    var id_arr = new Array
    $.ajax({
        type: 'GET',
        url: `api/super/customer?action=showcustomer&pagesize=${pagesize}&pagenum=${pagenum}&keywords=${keywords}`,
        success: function (data, status, xhr) {
            sessionStorage.setItem('total', data.total)
            document.querySelector('#t-page').innerText = Math.ceil(data.total / 4)
            document.querySelector('#page-num').value = pagenum
            if (data.code !== 0) {
                alert("操作失败：" + data.info)
                return;
            }
            for (let item of data.list) {
                let p = `<div class='main-list-item'>
                            <p><span class='item-head'>客户姓名</span><span>${item.name}</span><button class="fix-btn">修改</button></p>
                            <p><span class='item-head'>客户性别</span><span>${item.sex}</span><button class="del-btn">删除</button></p>
                            <p><span class='item-head'>客户电话</span><span>${item.tel}</span></p>
                            <p><span class='item-head'>备注</span><span>${item.wechat}</span></p>
                        </div>`
                document.querySelector(".main-list").insertAdjacentHTML("beforeend", p)
                id_arr.push(item.id)
            }
            sessionStorage.setItem('aid', JSON.stringify(id_arr))
            regDel();
            regFix();
        },
        error: function (xhr, textStatus, errorThrown) {
            alert('操作失败：\n' + `${xhr.status} \n${textStatus} \n${errorThrown}`)
        }
    })

}

function regAdd() {
    // 注册添加按钮
    let addBtn = document.querySelector('#add-btn')
    addBtn.addEventListener('click', () => {
        let form = document.querySelector('.add-form')
        if (form !== null) {
            if (form.classList.contains("hidden")) {
                addBtn.innerText = '隐藏添加功能块'
                form.classList.remove("hidden")
            } else {
                form.classList.add("hidden")
                addBtn.innerText = '展开添加功能块'
            }
        }
    })

    // 注册提交按钮
    document.querySelector('#add-submit').addEventListener('click', () => {
        let name = document.getElementById('add-name').value
        let sex = document.getElementById('add-sex').value
        let tel = document.getElementById('add-tel').value
        let wechat = document.getElementById('add-wechat').value
        $.ajax({
            url: 'api/super/customer',
            type: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            contentType: 'application/json',
            data: JSON.stringify({
                action: 'addcustomer',
                data: {
                    "name": name,
                    "sex": sex,
                    "tel": tel,
                    "wechat": wechat,
                }
            }),
            success: function (data, status, xhr) {
                if (data.code === 0) {
                    console.log('添加成功，新客户id：' + data.id)
                    document.querySelector(".main-list").innerHTML = ''
                    location.reload()
                } else {
                    alert('添加失败')
                }
                $('#add-name').val('')
                $('#add-sex').val('')
                $('#add-tel').val('')
                $('#add-wechat').val('')
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
        getCustomerList(1, 4, keys)
    })

    // 上一页
    document.querySelector('#up-page').addEventListener('click', () => {
        let tpage = Math.ceil(sessionStorage.getItem('total') / 4)
        let keys = document.querySelector('#sea-name').value
        if (num > 1 && num <= tpage) {
            num -= 1
            document.querySelector(".main-list").innerHTML = ''
            getCustomerList(num, 4, keys)
        }
    })

    // 下一页
    document.querySelector('#down-page').addEventListener('click', () => {
        let tpage = Math.ceil(sessionStorage.getItem('total') / 4)
        let keys = document.querySelector('#sea-name').value
        if (num >= 1 && num < tpage) {
            num += 1
            document.querySelector(".main-list").innerHTML = ''
            getCustomerList(num, 4, keys)
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
            getCustomerList(j_num, 4, keys)
        } else {
            alert('超出页码范围')
        }
    })
}

function regDel() {
    var aids = JSON.parse(sessionStorage.getItem('aid'))
    // 注册删除按钮
    for (let i = 0; i < (aids.length); i++) {
        document.querySelectorAll('.del-btn')[i].addEventListener('click', () => {
            let res = confirm('Warning：是否确认删除此条记录？')
            if (res == true) {
                $.ajax({
                    url: 'api/super/customer',
                    type: 'DELETE',
                    headers: {'X-CSRFToken': getCookie('csrftoken')},
                    contentType: 'application/json',
                    data: JSON.stringify({
                        action: 'delcustomer',
                        id: aids[i]
                    }),
                    success: function (data, status, xhr) {
                        if (data.code === 0) {
                            document.querySelector(".main-list").innerHTML = ''
                            location.reload()
                        } else {
                            alert('删除失败：' + data.info)
                        }
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        if (xhr.status == 500) {
                            alert('删除失败，请检查客户对应订单是否全部删除')
                        } else {
                            alert('删除失败：\n' + `${xhr.status} \n${textStatus} \n${errorThrown}`)
                        }
                    }
                })
            } else {
                console.log('用户取消删除操作')
            }
        })
    }
}

function regFix() {
    var aids = JSON.parse(sessionStorage.getItem('aid'))
    var win = document.querySelector('.fix-area')
    for (let i = 0; i < (aids.length); i++) {
        document.querySelectorAll('.fix-btn')[i].addEventListener('click', () => {
            sessionStorage.setItem('cid', aids[i])
            win.classList.remove("hidden")
            // 填数据
            var line = document.querySelectorAll('.main-list-item')[i]
            document.querySelector('#fix-name').value = line.querySelector('p:nth-child(1)>span:nth-child(2)').innerText
            document.querySelector('#fix-sex').value = line.querySelector('p:nth-child(2)>span:nth-child(2)').innerText
            document.querySelector('#fix-tel').value = line.querySelector('p:nth-child(3)>span:nth-child(2)').innerText
            document.querySelector('#fix-wechat').value = line.querySelector('p:nth-child(4)>span:nth-child(2)').innerText
        })
    }
    document.querySelector('#fix-cancel').addEventListener('click', () => {
        win.classList.add('hidden')
    })

    document.querySelector('#fix-submit').addEventListener('click', () => {
        let name = document.querySelector('#fix-name').value
        let sex = document.querySelector('#fix-sex').value
        let tel = document.querySelector('#fix-tel').value
        let wechat = document.querySelector('#fix-wechat').value
        $.ajax({
            url: 'api/super/customer',
            type: 'PUT',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            contentType: 'application/json',
            data: JSON.stringify({
                action: 'fixcustomer',
                id: sessionStorage.getItem('cid'),
                cdata: {
                    "name": name,
                    "sex": sex,
                    "tel": tel,
                    "wechat": wechat
                }
            }),
            success: function (data, status, xhr) {
                if (data.code === 0) {
                    document.querySelector(".main-list").innerHTML = ''
                    location.reload()
                } else {
                    alert('修改失败：' + data.info)
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                alert('修改失败：\n' + `${xhr.status} \n${textStatus} \n${errorThrown}`)
            }
        })
        win.classList.add('hidden')
    })

}

window.onload = () => {
    regClick();
    regMenu();
    getCustomerList();
    regAdd();
    regSea();
}