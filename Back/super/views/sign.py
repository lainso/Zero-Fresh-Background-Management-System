# 2023-02-08
import uuid

from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.middleware.csrf import get_token

import zero_point.settings as zp_set


def getToken(request):
    return JsonResponse({'csrf_token': get_token(request) or 'NOTPROVIDED'})


def signin(request):
    uname = request.POST.get('username')
    upass = request.POST.get('password')

    user = authenticate(username=uname, password=upass)

    if user is not None:
        if user.is_active:
            if user.is_superuser:
                login(request, user)
                request.session['usertype'] = 'super'
                return JsonResponse({'code': 0, 'info': 'succeed'})
            else:
                return JsonResponse({'code': 1, 'info': '非管理员账号，请检查'})
        else:
            return JsonResponse({'code': 1, 'info': '用户未激活，请检查您的邮箱'})
    else:
        return JsonResponse({'code': 1, 'info': '用户名或密码错误，请检查'})


def signout(request):
    logout(request)
    return JsonResponse({'code': 0, 'info': 'succeed'})


def reg(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        password = request.POST.get('pass')
        email = request.POST.get('email')
        fname = request.POST.get('fname')
        new_user = User.objects.create_user(username=name, password=password,
                                            email=email, is_superuser=1,
                                            first_name=fname, is_active=0)

        token = str(uuid.uuid4()).replace('-', '')
        request.session[token] = new_user.username

        # 邮件激活
        sub = '【凌点生鲜】用户激活邮件'
        link = "http://" + zp_set.WEB_IP + "/active_done.html"
        msg = '''
        <div style="
        background-color: #f0fcff;
        margin: auto;
        text-align: center;
        border-radius: 20px;">
            <br>
            <div style="display: flex; justify-content: center;">
                <span style="font-size: 2.3rem; font-weight: bold;">凌 点 生 鲜</span>
            </div>
            <p style="font-weight: lighter; font-size: 15px;">🔑 用 户 激 活 </p>
            <p>尊敬的 {}<br>请点击下面的链接激活您的账户</p>
            <div>
                <a href="{}?token={}" target="_blank" style="text-decoration: none; color: rgb(59, 130, 246);
                ">👉 点击重置 👈</a>
            </div>
            <br>
        </div>
        '''.format(fname, link, token)
        send_mail(subject=sub, message=msg, from_email=zp_set.EMAIL_HOST_USER, recipient_list=[email,], html_message=msg)

        return JsonResponse({'code': 0, 'info': 'succeed'})
    else:
        return JsonResponse({'code': 1, 'info': '禁止使用此提交方法'})


def active(request):
    token = request.GET.get('token')
    username = request.session.get(token)
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'code': 1, 'info': f'用户不存在'})

    user.is_active = 1
    user.save()
    return JsonResponse({'code': 0, 'info': 'succeed'})

def reset(request):
    if request.method == 'POST':
        mail = request.POST.get('mail')
        try:
            user = User.objects.get(email=mail)
        except User.DoesNotExist:
            return JsonResponse({'code': 1, 'info': f'用户不存在'})

        token2 = str(uuid.uuid4()).replace('-', '')
        fname = user.first_name
        request.session[token2] = user.username

        # 密码重置邮件
        sub = '【凌点生鲜】用户密码重置邮件'
        link = "http://" + zp_set.WEB_IP + "/reset_done.html"
        msg = '''
        <div style="
        background-color: #f0fcff;
        margin: auto;
        text-align: center;
        border-radius: 20px;">
            <br>
            <div style="display: flex; justify-content: center;">
                <span style="font-size: 2.3rem; font-weight: bold;">凌 点 生 鲜</span>
            </div>
            <p style="font-weight: lighter; font-size: 15px;">🔑 密 码 重 置 </p>
            <p>尊敬的 {}<br>请点击下面的链接完成密码重置</p>
            <div>
                <a href="{}?token={}" target="_blank" style="text-decoration: none; color: rgb(59, 130, 246);
                ">👉 点击重置 👈</a>
            </div>
            <br>
        </div>
        '''.format(fname, link, token2)
        send_mail(subject=sub, message=msg, from_email=zp_set.EMAIL_HOST_USER, recipient_list=[mail,], html_message=msg)

        return JsonResponse({'code': 0, 'info': 'succeed'})
    else:
        return JsonResponse({'code': 1, 'info': '禁止使用此提交方法'})

def re_done(request):
    token = request.POST.get('token')
    username = request.session.get(token)
    passwd = request.POST.get('passwd')
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'code': 1, 'info': f'用户不存在'})

    user.set_password(passwd)
    user.save()
    return JsonResponse({'code': 0, 'info': 'succeed'})
