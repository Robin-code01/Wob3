from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.courses, name='courses'),
    path('courses/<int:course_id>/', views.course_detail, name='course_detail'),
    path('courses/<int:course_id>/modules/', views.course_modules, name='course_modules'),
    path('modules/<int:module_id>/', views.module_detail, name='module_detail'),
    path('modules/<int:module_id>/sections/', views.module_sections, name='module_sections'),
    path('sections/<int:section_id>/', views.section_detail, name='section_detail'),
    path('sections/<int:section_id>/answer/', views.submit_answer, name='submit_answer'),
    path('users/<str:public_key>/courses/', views.user_courses, name='user_courses'),
    path('enroll/', views.enroll, name='enroll'),
]