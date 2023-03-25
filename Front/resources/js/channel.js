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

function getChannelList(pagenum = 1, pagesize = 5, keywords = '') {
    document.querySelector(".main-list").innerHTML = ''
    var id_arr = new Array
    $.ajax({
        type: 'GET',
        url: `api/super/channels?action=showchannel&pagesize=${pagesize}&pagenum=${pagenum}&keywords=${keywords}`,
        success: function (data, status, xhr) {
            sessionStorage.setItem('total', data.total)
            document.querySelector('#t-page').innerText = Math.ceil(data.total / 5)
            document.querySelector('#page-num').value = pagenum
            if (data.code !== 0) {
                alert("操作失败：" + data.info)
                return;
            }
            for (let item of data.list) {
                let p = `<div class='main-list-item'>
                            <p><span class='item-head'>渠道名</span><span>${item.name}</span><button class="fix-btn">修改</button></p>
                            <p><span class='item-head'>地址</span><span>${item.content}</span><button class="del-btn">删除</button></p>
                            <p><span class='item-head'>备注</span><span>${item.describe}</span></p>
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
        let content = document.getElementById('add-content').value
        let des = document.getElementById('add-des').value
        $.ajax({
            url: 'api/super/channels',
            type: 'POST',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            contentType: 'application/json',
            data: JSON.stringify({
                action: 'addchannel',
                data: {
                    "name": name,
                    "content": content,
                    "describe": des,
                }
            }),
            success: function (data, status, xhr) {
                if (data.code === 0) {
                    console.log('添加成功，新渠道id：' + data.id)
                    document.querySelector(".main-list").innerHTML = ''
                    location.reload();
                } else {
                    alert('添加失败')
                }
                $('#add-name').val('')
                $('#add-content').val('')
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
        getChannelList(1, 5, keys)
    })

    // 上一页
    document.querySelector('#up-page').addEventListener('click', () => {
        let tpage = Math.ceil(sessionStorage.getItem('total') / 5)
        let keys = document.querySelector('#sea-name').value
        if (num > 1 && num <= tpage) {
            num -= 1
            document.querySelector(".main-list").innerHTML = ''
            getChannelList(num, 5, keys)
        }
    })

    // 下一页
    document.querySelector('#down-page').addEventListener('click', () => {
        let tpage = Math.ceil(sessionStorage.getItem('total') / 5)
        let keys = document.querySelector('#sea-name').value
        if (num >= 1 && num < tpage) {
            num += 1
            document.querySelector(".main-list").innerHTML = ''
            getChannelList(num, 5, keys)
        }
    })

    // 页码跳转按钮
    document.querySelector('#jump-btn').addEventListener('click', () => {
        let j_num = document.querySelector('#page-num').value
        let tpage = Math.ceil(sessionStorage.getItem('total') / 5)
        if (j_num > 0 && j_num <= tpage) {
            num = Number(j_num)
            let keys = document.querySelector('#sea-name').value
            document.querySelector(".main-list").innerHTML = ''
            getChannelList(j_num, 5, keys)
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
                    url: 'api/super/channels',
                    type: 'DELETE',
                    headers: {'X-CSRFToken': getCookie('csrftoken')},
                    contentType: 'application/json',
                    data: JSON.stringify({
                        action: 'delchannel',
                        id: aids[i]
                    }),
                    success: function (data, status, xhr) {
                        if (data.code === 0) {
                            document.querySelector(".main-list").innerHTML = ''
                            location.reload();
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
            document.querySelector('#fix-content').value = line.querySelector('p:nth-child(2)>span:nth-child(2)').innerText
            document.querySelector('#fix-des').value = line.querySelector('p:nth-child(3)>span:nth-child(2)').innerText
        })
    }
    document.querySelector('#fix-cancel').addEventListener('click', () => {
        win.classList.add('hidden')
    })

    document.querySelector('#fix-submit').addEventListener('click', () => {
        let name = document.querySelector('#fix-name').value
        let content = document.querySelector('#fix-content').value
        let des = document.querySelector('#fix-des').value
        $.ajax({
            url: 'api/super/channels',
            type: 'PUT',
            headers: {'X-CSRFToken': getCookie('csrftoken')},
            contentType: 'application/json',
            data: JSON.stringify({
                action: 'fixchannel',
                id: sessionStorage.getItem('cid'),
                cdata: {
                    "name": name,
                    "content": content,
                    "describe": des
                }
            }),
            success: function (data, status, xhr) {
                if (data.code === 0) {
                    document.querySelector(".main-list").innerHTML = ''
                    location.reload();
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
    getChannelList();
    regAdd();
    regSea();
}