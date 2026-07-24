from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.courses, name='courses'),
    path('users/<str:public_key>/courses/', views.user_courses, name='user_courses'),
    path('enroll/', views.enroll, name='enroll'),
]