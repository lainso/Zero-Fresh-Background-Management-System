# 2023-03-17
import traceback
from django.contrib.auth.models import User
from django.forms import model_to_dict
from django.http import JsonResponse
from lib.handler import dispatcher

def getuser(request):
    try:
        username = request.params.get('username', None)
        qs = User.objects.get(username=username)
        res = model_to_dict(qs)
        return JsonResponse({'code':0, 'list':res})
    except:
        return JsonResponse({'code':1, 'info':f'错误：\n{traceback.format_exc()}'})

def fixuser(request):
    uname = request.params['username']
    data = request.params['data']
    try:
        user = User.objects.get(username=uname)
    except User.DoesNotExist:
        return {'code':1, 'info':f'用户名为{uname}的用户不存在'}

    if 'password' in data:
        user.set_password(data['password'])
    if 'fname' in data:
        user.first_name = data['fname']
    if 'email' in data:
        user.email = data['email']

    user.save()

    return JsonResponse({'code':0, 'info':'succeed'})

def deluser(request):
    uname = request.params['username']

    try:
        user = User.objects.get(username=uname)
    except User.DoesNotExist:
        return {'code': 1, 'info': f'用户名为`{uname}`的用户不存在'}

    user.delete()

    return JsonResponse({'code': 0, 'info':'succeed'})


given = {
    'getuser': getuser,
    'fixuser': fixuser,
    'deluser': deluser,
}
def define(request):
    return dispatcher(request, given)
