import datetime

from django.db import models

# Create your models here.
class Customer(models.Model):
    name = models.CharField(max_length=200)
    sex = models.CharField(max_length=10)
    tel = models.CharField(max_length=50)
    wechat = models.CharField(max_length=100, null=True, blank=True)

class Products(models.Model):
    name = models.CharField(max_length=200)
    date = models.CharField(max_length=50)
    price = models.CharField(max_length=20)
    num = models.CharField(max_length=10)
    describe = models.CharField(max_length=200, null=True, blank=True)

class Channels(models.Model):
    name = models.CharField(max_length=100)
    content = models.CharField(max_length=200)
    describe = models.CharField(max_length=200, null=True, blank=True)

class Order(models.Model):
    time = models.CharField(max_length=100)
    customer = models.ForeignKey(Customer,on_delete=models.PROTECT)
    products = models.ManyToManyField(Products, through='OrderProduct')
    productlist = models.CharField(max_length=2000, null=True, blank=True)
    describe = models.CharField(max_length=500, null=True, blank=True)

class OrderProduct(models.Model):
    order = models.ForeignKey(Order, on_delete=models.PROTECT)
    products = models.ForeignKey(Products,on_delete=models.PROTECT)
    amount = models.PositiveIntegerField()
