from django.http import HttpResponse

# Create your views here.

def showcount(request):
    return HttpResponse('''
                <h1>统计页面</h1>
            ''')