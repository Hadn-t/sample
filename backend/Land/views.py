from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .models import Land
from .serializers import LandSerializer


@api_view(['POST'])
def create_land(request):
    serializer = LandSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_lands(request):
    lands = Land.objects.all()
    serializer = LandSerializer(lands, many=True)
    return Response(serializer.data)
