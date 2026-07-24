from django.urls import URLPattern, path
from . import views

urlpatterns = [
    path("get_csrf_token/", views.get_csrf_token, name="get_csrf_token"),
    path("get_nonce/", views.get_nonce, name="get_nonce"),
    path("verify_signature/", views.verify_signature, name="verify_signature"),
]