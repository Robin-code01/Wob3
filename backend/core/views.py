from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view
from django.core.cache import cache
from rest_framework.response import Response
from .models import Course, User
from .serializers import CourseSerializer, EnrollSerializer
from django.core.cache import cache

@api_view(['GET'])
def get_csrf_token(request):
    csrf_token = get_token(request)
    return Response({'csrf_token': csrf_token})

@api_view(['POST'])
def enroll(request):
    """
    POST /enroll/  — Enroll a user in a course.

    Body:
        course_id  (int): ID of the course.
        public_key (str): Wallet address of the user.
    """
    serializer = EnrollSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    course_id = serializer.validated_data['course_id']
    public_key = serializer.validated_data['public_key'].lower()

    try:
        user = User.objects.get(public_key=public_key)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    try:
        course = Course.objects.get(course_id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    # Check if already enrolled
    if user.courses_in_progress.filter(course_id=course_id).exists():
        return Response({'message': 'Already enrolled in this course'}, status=200)

    # Add the M2M relationship
    user.courses_in_progress.add(course)

    return Response({'message': f'Successfully enrolled in "{course.title}"'}, status=201)

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


@api_view(['GET'])
def user_courses(request, public_key):
    """
    GET /users/<public_key>/courses/  — List all courses a user is currently doing.

    Returns 404 if the user does not exist.
    """
    try:
        user = User.objects.get(public_key=public_key.lower())
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    courses_in_progress = user.courses_in_progress.all()
    serializer = CourseSerializer(courses_in_progress, many=True)
    return Response(serializer.data)