from django.urls import URLPattern, path
from . import views

urlpatterns = [
    path("get_nonce/", views.get_nonce, name="get_nonce"),
    path("verify_signature/", views.verify_signature, name="verify_signature"),
    path("mint_module_completion/", views.mint_module_completion, name="mint_module_completion"),
    path("mint_module_completion_by_id/", views.mint_module_completion_by_id, name="mint_module_completion_by_id"),
    path("register_course/", views.register_course, name="register_course"),
    path("mint_course_completion/", views.mint_course_completion, name="mint_course_completion"),
]