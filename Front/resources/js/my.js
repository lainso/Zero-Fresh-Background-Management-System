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

function regInfo() {
    let uname = localStorage.getItem('curr_user')
    $.ajax({
        url: `api/super/account?action=getuser&username=${uname}`,
        type: 'GET',
        success: function (data, status, xhr) {
            if (data.code === 0) {
                document.querySelector('#uaccount').innerHTML = data.list.username
                document.querySelector('#umail').innerHTML = data.list.email
                document.querySelector('#uname').innerHTML = data.list.first_name
                document.querySelector('#fix-name').value = data.list.first_name
                document.querySelector('#fix-mail').value = data.list.email
                document.querySelector('#fix-account').value = uname
            } else {
                alert('获取账号信息失败：' + data.info)
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            alert('获取账号信息失败：\n' + `${xhr.status} \n${textStatus} \n${errorThrown}`)
        }
    })
}

function regFix() {
    var win = document.querySelector('.my-fix-area')
    document.querySelector('.my-fix-btn').addEventListener('click', () => {
        win.classList.remove("hidden")
    })

    document.querySelector('#fix-cancel').addEventListener('click', () => {
        win.classList.add('hidden')
    })

    document.querySelector('#fix-submit').addEventListener('click', () => {
        let uname = document.querySelector('#fix-name').value
        let mail = document.querySelector('#fix-mail').value
        let pass = document.querySelector('#fix-pass').value
        let repass = document.querySelector('#fix-repass').value
        if (pass === repass) {
            if (uname !== '') {
                if (mail != '') {
                    if (pass != '') {
                        $.ajax({
                            url: 'api/super/account',
                            type: 'PUT',
                            headers: {'X-CSRFToken': getCookie('csrftoken')},
                            contentType: 'application/json',
                            data: JSON.stringify({
                                action: 'fixuser',
                                username: localStorage.getItem('curr_user'),
                                data: {
                                    "fname": uname,
                                    "email": mail,
                                    "password": pass,
                                }
                            }),
                            success: function (data, status, xhr) {
                                if (data.code === 0) {
                                    alert('用户信息修改成功！')
                                    location.reload()
                                } else {
                                    alert('修改失败：' + data.info)
                                }
                            },
                            error: function (xhr, textStatus, errorThrown) {
                                alert('修改失败：\n' + `${xhr.status} \n${textStatus} \n${errorThrown}`)
                            }
                        })
                    } else { alert('用户密码不能为空') }
                } else { alert('用户邮箱不能为空') }
            } else { alert('用户姓名不能为空') }
        } else { alert('两次输入的密码不一致，请检查') }
    })
}

function regDel() {
    let account = localStorage.getItem('curr_user')
    let del_btn = document.querySelector('.my-del-btn')
    if (account == 'lains') {
        del_btn.disabled = true
        document.querySelector('.my-fix-btn').disabled = true
    }
    del_btn.addEventListener('click', () => {
        let res = confirm('Warning：\n请问是否确定注销账号？\n您将无法再次使用此账号登录系统！\n此操作无法复原！')
        if (res == true) {
            $.ajax({
                url: 'api/super/account',
                type: 'DELETE',
                headers: {'X-CSRFToken': getCookie('csrftoken')},
                contentType: 'application/json',
                data: JSON.stringify({
                    action: 'deluser',
                    username: account,
                }),
                success: function (data, status, xhr) {
                    if (data.code === 0) {
                        alert('账户已注销，即将返回登录页！')
                        location.href = '/login.html'
                    } else {
                        alert('注销失败：' + data.info)
                    }
                },
                error: function (xhr, textStatus, errorThrown) {
                    alert('注销失败：\n' + `${xhr.status} \n${textStatus} \n${errorThrown}`)
                }
            })
        }
    })
}

window.onload = () => {
    regClick();
    regMenu();
    regInfo();
    regFix();
    regDel();
}