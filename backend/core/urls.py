from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.courses, name='courses'),
    path('courses/<int:course_id>/', views.course_detail, name='course_detail'),
    path('courses/<int:course_id>/modules/', views.course_modules, name='course_modules'),
    path('modules/<int:module_id>/', views.module_detail, name='module_detail'),
    path('users/<str:public_key>/courses/', views.user_courses, name='user_courses'),
    path('enroll/', views.enroll, name='enroll'),
]