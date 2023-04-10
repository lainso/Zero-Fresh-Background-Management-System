# 2023-02-11
import json
import traceback
from django.core.paginator import Paginator, EmptyPage
from django.db import transaction
from django.db.models import F
from django.db.models import Q
from django.http import JsonResponse
from django_redis import get_redis_connection

from common.models import Order, OrderProduct, Products
from lib.handler import dispatcher
from zero_point import settings


def showorder(request):
    try:
        qs = Order.objects \
            .annotate(
            customer_name=F('customer__name')
        ) \
            .values(
            'id', 'time', 'customer__name', 'describe', 'productlist',
        ).order_by('-id')

        keywords = request.params.get('keywords',None)
        if keywords:
            conditions = [Q(time__contains=one) for one in keywords.split(' ') if one]
            query = Q()
            for condition in conditions:
                query &= condition
            qs = qs.filter(query)

        pagenum = request.params['pagenum']
        pagesize = request.params['pagesize']
        pgnt = Paginator(qs, pagesize)
        page = pgnt.page(pagenum)

        result = list(page)

        return JsonResponse({'code': 0, 'list': result, 'total': pgnt.count})

    except EmptyPage:
        return JsonResponse({'code': 0, 'list': [], 'total': 0})

    except:
        return JsonResponse({'code': 2, 'info': f'未知错误\n{traceback.format_exc()}'})


def addorder(request):
    data = request.params['data']

    with transaction.atomic():
        productlist = data['productlist']

        new_order = Order.objects.create(time=data['time'],
                                         customer_id=data['customerid'],
                                         describe=data['describe'],
                                         productlist=json.dumps(productlist, ensure_ascii=False),)

        batch = [OrderProduct(order_id=new_order.id,
                              products_id=product['id'],
                              amount=product['amount'])
                 for product in json.loads(productlist)]
        OrderProduct.objects.bulk_create(batch)

        for product in json.loads(productlist):
            fix_product = Products.objects.get(pk=product['id'])
            fix_product.num = int(fix_product.num) - int(product['amount'])
            if fix_product.num<0:
                return JsonResponse({'code': 1, 'info': '库存不够了！'})
            fix_product.save()
            get_redis_connection("default").delete(settings.CacheKey.ProductList)

    return JsonResponse({'code': 0, 'info':'succeed', 'id': new_order.id})


def delorder(request):
    oid = request.params['id']

    try:
        one = Order.objects.get(id=oid)
        with transaction.atomic():
            OrderProduct.objects.filter(order_id=oid).delete()
            one.delete()
        return JsonResponse({'code': 0, 'info':'succeed', 'id': oid})

    except Order.DoesNotExist:
        return JsonResponse({
            'code': 1,
            'info': f'id 为`{oid}`的订单不存在'
        })

    except:
        return JsonResponse({'code': 1, 'info':traceback.format_exc()})

given = {
    'showorder': showorder,
    'addorder': addorder,
    'delorder': delorder,
}

def define(request):
    return dispatcher(request, given)
