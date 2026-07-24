from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view
from django.core.cache import cache
@api_view(['GET'])
def get_csrf_token(request):
    csrf_token = get_token(request)
    return render(request, 'csrf_token.html', {'csrf_token': csrf_token})

