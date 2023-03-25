from django.contrib import admin
# Register your models here.

from .models import Customer,Products,Channels,Order

admin.site.register(Customer)
admin.site.register(Products)
admin.site.register(Channels)
admin.site.register(Order)

