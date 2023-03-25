from django.urls import path
from .views import order, product, channel, customer, sign, count, account

urlpatterns = [
    path('gettoken', sign.getToken),
    path('signin', sign.signin),
    path('signout', sign.signout),
    path('register', sign.reg),

    path('account',account.define),
    path('products', product.define),
    path('customer', customer.define),
    path('channels', channel.define),
    path('orders', order.define),
    path('count', count.showcount),
]
