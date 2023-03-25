# 2023-02-08
import json
from django.http import JsonResponse

def dispatcher(request, given):
    if 'usertype' not in request.session:
        return JsonResponse({
            'code': 302,
            'info': '未登录，请检查',
            'redirect': '/super/signin'},
            status=302
        )
    if request.session['usertype'] != 'super':
        return JsonResponse({
            'code': 302,
            'info': '非超级管理员账号，请检查',
            'redirect': '/super/signin'},
            status=302
        )

    if request.method == 'GET':
        request.params = request.GET

    elif request.method in ['POST','PUT','DELETE']:
        request.params = json.loads(request.body)

    action = request.params['action']

    if action in given:
        function = given[action]
        return function(request)
    else:
        return JsonResponse({'code':1, 'info':'未正确发送请求，请检查请求url'})
