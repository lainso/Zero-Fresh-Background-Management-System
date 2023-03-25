# 2023-02-10
import json
import traceback
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q
from django.forms import model_to_dict
from django.http import JsonResponse
from django_redis import get_redis_connection
from common.models import Products
from zero_point import settings
from lib.handler import dispatcher

rcon = get_redis_connection("default")

def getPname(request):
    try:
        pid = request.params.get('pid', None)
        qs = Products.objects.get(pk=pid)
        res = model_to_dict(qs)
        return JsonResponse({'code': 0, 'list': res, 'info': 'succeed!'})
    except:
        return JsonResponse({'code': 1, 'info': f'获取产品失败，请检查请求id'})

def showproducts(request):
    try:
        search_words = request.params.get('keywords', None)
        pagenum = request.params['pagenum']
        pagesize = request.params['pagesize']

        cacheField = f"{pagesize}|{pagenum}|{search_words}"
        cacheObj = rcon.hget(settings.CacheKey.ProductList, cacheField)
        if cacheObj:
            obj = json.loads(cacheObj)
        else:
            qs = Products.objects.values().order_by('-id')

            if search_words:
                conditions = [Q(name__contains=con) for con in search_words.split(' ') if con]
                query = Q()
                for condition in conditions:
                    query &= condition
                qs = qs.filter(query)

            pgnt = Paginator(qs, pagesize)
            page = pgnt.page(pagenum)
            result = list(page)

            obj = {'code': 0, 'list': result, 'total': pgnt.count}
            rcon.hset(settings.CacheKey.ProductList,
                      cacheField,
                      json.dumps(obj))

        return JsonResponse(obj)

    except EmptyPage:
        return JsonResponse({'code': 0, 'list': [], 'total': 0})

    except:
        print(traceback.format_exc())
        return JsonResponse({'code': 2, 'info': f'未知错误\n{traceback.format_exc()}'})


def addproduct(request):
    data = request.params['data']

    product = Products.objects.create(name=data['name'], date=data['date'],
                                      price=data['price'], num=data['num'], describe=data['describe'])
    rcon.delete(settings.CacheKey.ProductList)

    return JsonResponse({'code': 0, 'info': 'succeed', 'id': product.id})


def fixproduct(request):
    pid = request.params['id']
    pdata = request.params['pdata']

    try:
        product = Products.objects.get(id=pid)
    except Products.DoesNotExist:
        return {'code': 1, 'info': f'id 为`{pid}`的商品不存在'}

    if 'name' in pdata:
        product.name = pdata['name']
    if 'date' in pdata:
        product.date = pdata['date']
    if 'price' in pdata:
        product.price = pdata['price']
    if 'num' in pdata:
        product.num = pdata['num']
    if 'describe' in pdata:
        product.describe = pdata['describe']

    product.save()
    rcon.delete(settings.CacheKey.ProductList)

    return JsonResponse({'code': 0, 'info': 'succeed'})


def delprodduct(request):
    pid = request.params['id']

    try:
        pro = Products.objects.get(id=pid)
    except Products.DoesNotExist:
        return {'code': 1, 'info': f'id 为`{pid}`的商品不存在'}

    pro.delete()

    rcon.delete(settings.CacheKey.ProductList)

    return JsonResponse({'code': 0, 'info': 'succeed'})


given = {
    'getPname': getPname,
    'showproducts': showproducts,
    'addproduct': addproduct,
    'fixproduct': fixproduct,
    'delprodduct': delprodduct,
}


def define(request):
    return dispatcher(request, given)
