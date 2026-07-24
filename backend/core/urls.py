from django.urls import URLPattern, path
from . import views

urlpatterns = [
    path("get_csrf_token/", views.get_csrf_token, name="get_csrf_token"),
]