from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view
from django.core.cache import cache
from rest_framework.response import Response
from .models import Course
from .serializers import CourseSerializer
from django.core.cache import cache

@api_view(['GET'])
def get_csrf_token(request):
    csrf_token = get_token(request)
    return Response({'csrf_token': csrf_token})

@api_view(['GET', 'POST'])
def courses(request):
    """
    GET  /courses/  — List all courses.
    POST /courses/  — Create a new course.

    POST body:
        title       (str): Course title.
        description (str): Course description.
        outcomes    (str): Learning outcomes.
        creator_id  (str): Public key of the creating user (must exist).
    """
    if request.method == 'GET':
        all_courses = Course.objects.all()
        serializer = CourseSerializer(all_courses, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)