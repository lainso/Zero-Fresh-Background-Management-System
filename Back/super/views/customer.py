# 2023-02-08
import traceback
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q
from django.http import JsonResponse
from common.models import Customer
from lib.handler import dispatcher

def showcustomer(request):
    try:
        qs = Customer.objects.values().order_by('-id')
        key = request.params.get('keywords', None)
        if key:
            conditions = [Q(name__contains=con) for con in key.split(' ') if con]
            query = Q()
            for condi in conditions:
                query &= condi
            qs = qs.filter(query)

        pagenum = request.params['pagenum']
        pagesize = request.params['pagesize']
        page = Paginator(qs, pagesize).page(pagenum)
        result = list(page)

        return JsonResponse({'code': 0, 'list': result, 'total': Paginator(qs, pagesize).count})
    except EmptyPage:
        return JsonResponse({'code': 0, 'list': [], 'total': 0})
    except:
        return JsonResponse({'code': 2, 'info': f'错误：\n{traceback.format_exc()}'})

def addcustomer(request):
    data = request.params['data']
    line = Customer.objects.create(name=data['name'], sex=data['sex'],tel=data['tel'], wechat=data['wechat'])
    return JsonResponse({'code':0, 'info':'succeed', 'id':line.id})

def fixcustomer(request):
    cid = request.params['id']
    cdata = request.params['cdata']

    try:
        customer = Customer.objects.get(id=cid)
    except Customer.DoesNotExist:
        return {'code':1, 'info':f'id为{cid}的客户不存在'}

    if 'name' in cdata:
        customer.name = cdata['name']
    if 'sex' in cdata:
        customer.sex = cdata['sex']
    if 'tel' in cdata:
        customer.tel = cdata['tel']
    if 'wechat' in cdata:
        customer.wechat = cdata['wechat']
    customer.save()

    return JsonResponse({'code':0, 'info':'succeed'})

def delcustomer(request):
    cid = request.params['id']

    try:
        customer = Customer.objects.get(id=cid)
    except Customer.DoesNotExist:
        return {'code': 1, 'info': f'id 为`{cid}`的客户不存在'}

    customer.delete()

    return JsonResponse({'code': 0, 'info':'succeed'})


given = {
    'showcustomer': showcustomer,
    'addcustomer': addcustomer,
    'fixcustomer': fixcustomer,
    'delcustomer': delcustomer,
}

def define(request):
    return dispatcher(request, given)
