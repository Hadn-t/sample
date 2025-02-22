from django.urls import path
from .views import get_lands, create_land

urlpatterns = [
    path('lands/', get_lands, name='get_lands'), # This is the endpoint to get all lands
    path('lands/create/', create_land, name='create_land'), # This is the endpoint to create a new land
]