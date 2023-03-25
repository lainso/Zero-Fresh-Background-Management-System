# 2023-02-10
import traceback
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Q
from django.http import JsonResponse
from common.models import Channels
from lib.handler import dispatcher

def showchannel(request):
    try:
        qs = Channels.objects.values().order_by('-id')
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

        return JsonResponse({'code':0, 'list':result, 'total':Paginator(qs, pagesize).count})
    except EmptyPage:
        return JsonResponse({'code': 0, 'list':[], 'total':0})
    except:
        return JsonResponse({'code':2, 'info':f'错误：\n{traceback.format_exc()}'})

def addchannel(request):
    data = request.params['data']
    line = Channels.objects.create(name=data['name'], content=data['content'],describe=data['describe'])
    return JsonResponse({'code':0, 'info':'succeed', 'id':line.id})

def fixchannel(request):
    cid = request.params['id']
    cdata = request.params['cdata']

    try:
        channel = Channels.objects.get(id=cid)
    except Channels.DoesNotExist:
        return {'code':1, 'info':f'id为{cid}的渠道不存在'}

    if 'name' in cdata:
        channel.name = cdata['name']
    if 'content' in cdata:
        channel.content = cdata['content']
    if 'describe' in cdata:
        channel.describe = cdata['describe']

    channel.save()

    return JsonResponse({'code':0, 'info':'succeed'})

def delchannel(request):
    cid = request.params['id']

    try:
        channel = Channels.objects.get(id=cid)
    except Channels.DoesNotExist:
        return {'code': 1, 'info': f'id 为`{cid}`的渠道不存在'}

    channel.delete()

    return JsonResponse({'code': 0, 'info':'succeed'})


given = {
    'showchannel': showchannel,
    'addchannel': addchannel,
    'fixchannel': fixchannel,
    'delchannel': delchannel,
}
def define(request):
    return dispatcher(request, given)
