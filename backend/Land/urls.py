from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from Land.views import create_land, get_lands

urlpatterns = [
    path('create/', create_land, name='create_land'),
    path('list/', get_lands, name='get_lands'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)