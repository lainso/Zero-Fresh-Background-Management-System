# 2023-02-08
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.middleware.csrf import get_token

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
            return JsonResponse({'code': 1, 'info': '用户已被禁用，请联系工作人员'})
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
        User.objects.create_user(username=name, password=password,
                                 email=email, is_superuser=1,
                                 first_name=fname)
        return JsonResponse({'code': 0, 'info': 'succeed'})
