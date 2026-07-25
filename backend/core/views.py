from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from rest_framework.decorators import api_view
from django.core.cache import cache
from rest_framework.response import Response
from .models import Course, User, Module, Section, MCQ, Info_panel, Coding_problem, Video, Blank, Answer
from .serializers import (
    CourseSerializer, EnrollSerializer, ModuleSerializer,
    SectionSerializer, MCQSerializer, InfoPanelSerializer,
    CodingProblemSerializer, VideoSerializer, BlankSerializer,
    AnswerSerializer
)
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

@api_view(['GET', 'PATCH', 'DELETE'])
def course_detail(request, course_id):
    """
    GET    /courses/<course_id>/  — Retrieve a single course.
    PATCH  /courses/<course_id>/  — Partially update a course.
    DELETE /courses/<course_id>/  — Delete a course.

    PATCH body (all fields optional):
        title       (str)
        description (str)
        outcomes    (str)
        is_complete (bool)
    """
    try:
        course = Course.objects.get(course_id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    if request.method == 'GET':
        serializer = CourseSerializer(course)
        return Response(serializer.data)

    if request.method == 'PATCH':
        # partial=True means only the fields you send will be updated
        serializer = CourseSerializer(course, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    if request.method == 'DELETE':
        course.delete()
        return Response({'message': 'Course deleted'}, status=204)

@api_view(['GET', 'POST'])
def course_modules(request, course_id):
    """
    GET  /courses/<course_id>/modules/  — List all modules for a course.
    POST /courses/<course_id>/modules/  — Create a new module.

    POST body:
        title (str): Title of the module.
    """
    try:
        course = Course.objects.get(course_id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=404)

    if request.method == 'GET':
        modules = course.modules.all()
        serializer = ModuleSerializer(modules, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = ModuleSerializer(data=request.data)
        if serializer.is_valid():
            # Save with the specific course linked automatically
            serializer.save(course_id=course)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['PATCH', 'DELETE'])
def module_detail(request, module_id):
    """
    PATCH  /modules/<module_id>/  — Edit a module's title.
    DELETE /modules/<module_id>/  — Delete a module.

    PATCH body:
        title (str): New title for the module.
    """
    try:
        module = Module.objects.get(module_id=module_id)
    except Module.DoesNotExist:
        return Response({'error': 'Module not found'}, status=404)

    if request.method == 'PATCH':
        serializer = ModuleSerializer(module, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    if request.method == 'DELETE':
        module.delete()
        return Response({'message': 'Module deleted'}, status=204)


@api_view(['GET', 'POST'])
def module_sections(request, module_id):
    """
    GET  /modules/<module_id>/sections/  — List all sections in a module.
    POST /modules/<module_id>/sections/  — Create a new section and its content.

    POST body:
        type_of_section (str): e.g., 'MCQ', 'Info_panel', 'Video', 'Coding_problem', 'Blank'
        + all fields required for that specific type (e.g., 'question', 'options', 'correct_answer' for MCQ)
    """
    try:
        module = Module.objects.get(module_id=module_id)
    except Module.DoesNotExist:
        return Response({'error': 'Module not found'}, status=404)

    if request.method == 'GET':
        sections = module.sections.all()
        serializer = SectionSerializer(sections, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        section_type = request.data.get('type_of_section')
        if section_type not in dict(Section.SECTION_TYPES):
            return Response({'error': 'Invalid or missing type_of_section'}, status=400)

        # Create the section shell
        section = Section.objects.create(module_id=module, type_of_section=section_type)

        # Dispatch to the correct serializer for the content
        serializer_map = {
            'MCQ': MCQSerializer,
            'Info_panel': InfoPanelSerializer,
            'Coding_problem': CodingProblemSerializer,
            'Video': VideoSerializer,
            'Blank': BlankSerializer
        }
        
        content_serializer_class = serializer_map[section_type]
        content_serializer = content_serializer_class(data=request.data)
        
        if content_serializer.is_valid():
            content_serializer.save(section_id=section)
            # Return the combined section object
            return Response(SectionSerializer(section).data, status=201)
        
        # If content validation fails, delete the section shell to avoid orphans
        section.delete()
        return Response(content_serializer.errors, status=400)


@api_view(['GET', 'PATCH', 'DELETE'])
def section_detail(request, section_id):
    """
    GET    /sections/<section_id>/  — Get a single section.
    PATCH  /sections/<section_id>/  — Edit a section's content.
    DELETE /sections/<section_id>/  — Delete a section.
    """
    try:
        section = Section.objects.get(section_id=section_id)
    except Section.DoesNotExist:
        return Response({'error': 'Section not found'}, status=404)

    if request.method == 'GET':
        return Response(SectionSerializer(section).data)

    if request.method == 'DELETE':
        section.delete()
        return Response({'message': 'Section deleted'}, status=204)

    if request.method == 'PATCH':
        # Retrieve the specific child object
        child = None
        serializer_class = None
        
        if section.type_of_section == 'MCQ':
            child = section.mcqs.first()
            serializer_class = MCQSerializer
        elif section.type_of_section == 'Info_panel':
            child = section.info_panels.first()
            serializer_class = InfoPanelSerializer
        elif section.type_of_section == 'Coding_problem':
            child = section.coding_problems.first()
            serializer_class = CodingProblemSerializer
        elif section.type_of_section == 'Video':
            child = section.videos.first()
            serializer_class = VideoSerializer
        elif section.type_of_section == 'Blank':
            child = section.blanks.first()
            serializer_class = BlankSerializer
            
        if not child:
            return Response({'error': 'Section content not found'}, status=404)
            
        content_serializer = serializer_class(child, data=request.data, partial=True)
        if content_serializer.is_valid():
            content_serializer.save()
            return Response(SectionSerializer(section).data)
            
        return Response(content_serializer.errors, status=400)


@api_view(['POST'])
def submit_answer(request, section_id):
    """
    POST /sections/<section_id>/answer/  — Submit an answer for a section.

    POST body:
        public_key  (str): The user's public key.
        user_answer (str): The answer provided by the user.
        is_correct  (int): Only used as a fallback for Coding_problem.
    """
    public_key = request.data.get('public_key')
    user_answer = request.data.get('user_answer')

    if not public_key or user_answer is None:
        return Response({'error': 'public_key and user_answer are required'}, status=400)

    try:
        user = User.objects.get(public_key=public_key.lower())
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    try:
        section = Section.objects.get(section_id=section_id)
    except Section.DoesNotExist:
        return Response({'error': 'Section not found'}, status=404)

    is_correct = 0

    # Backend verification
    if section.type_of_section == 'MCQ':
        mcq = section.mcqs.first()
        if mcq and str(user_answer).strip().lower() == str(mcq.correct_answer).strip().lower():
            is_correct = 1
    elif section.type_of_section == 'Blank':
        blank = section.blanks.first()
        if blank and str(user_answer).strip().lower() == str(blank.answers).strip().lower():
            is_correct = 1
    elif section.type_of_section == 'Coding_problem':
        # TODO: Implement a secure backend code execution engine to run test cases.
        # For now, we fallback to trusting the frontend for Coding Problems only.
        is_correct = int(request.data.get('is_correct', 0))
    else:
        # For Info_panel and Video, answering doesn't necessarily have a "correct" state,
        # but if we consider simply viewing it as correct:
        is_correct = 1

    # Upsert the answer
    answer, created = Answer.objects.update_or_create(
        user_id=user,
        section_id=section,
        defaults={
            'user_answer': str(user_answer),
            'is_correct': is_correct
        }
    )

    return Response(AnswerSerializer(answer).data, status=201 if created else 200)


@api_view(['POST'])
def check_module_completion(request, module_id):
    """
    POST /modules/<module_id>/check_completion/
    Checks whether the user has successfully answered all sections in this module.
    Will eventually mint a partial soulbound token.

    Body:
        public_key (str): The user's public key.
    """
    public_key = request.data.get('public_key')
    if not public_key:
        return Response({'error': 'public_key is required'}, status=400)

    try:
        user = User.objects.get(public_key=public_key.lower())
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    try:
        module = Module.objects.get(module_id=module_id)
    except Module.DoesNotExist:
        return Response({'error': 'Module not found'}, status=404)

    # Get all sections in this module
    sections = module.sections.all()
    if not sections.exists():
        return Response({'error': 'Module has no sections'}, status=400)

    # Check if the user has a correct answer for every section
    for section in sections:
        has_correct_answer = Answer.objects.filter(
            user_id=user,
            section_id=section,
            is_correct=1
        ).exists()
        
        if not has_correct_answer:
            return Response({
                'is_complete': False, 
                'message': f'Incomplete or incorrect answer for section {section.section_id}'
            }, status=200)

    # All sections have correct answers
    # TODO: Mint partial soulbound token here
    return Response({
        'is_complete': True, 
        'message': 'Module complete. Token minting is a work in progress.'
    }, status=200)
# def get_certificate(request, course_id):
#     """
#     GET /courses/<course_id>/get_certificate/  — Check if the user has completed all modules and is eligible for a certificate.

#     Query params:
#         public_key (str): The user's public key.
#     """
#     public_key = request.GET.get('public_key')
#     if not public_key:
#         return Response({'error': 'public_key query parameter is required'}, status=400)

#     try:
#         user = User.objects.get(public_key=public_key.lower())
#     except User.DoesNotExist:
#         return Response({'error': 'User not found'}, status=404)

#     try:
#         course = Course.objects.get(course_id=course_id)
#     except Course.DoesNotExist:
#         return Response({'error': 'Course not found'}, status=404)

#     # Check if the user is enrolled in the course
#     if not user.courses_in_progress.filter(course_id=course_id).exists():
#         return Response({'error': 'User is not enrolled in this course'}, status=403)

#     # Check if the user has completed all modules
#     modules = course.modules.all()
#     for module in modules:
#         sections = module.sections.all()
#         for section in sections:
#             answer = Answer.objects.filter(user_id=user, section_id=section).first()
#             if not answer or answer.is_correct == 0:
#                 return Response({'eligible_for_certificate': False}, status=200)

#     # Mint the course completion certificate NFT to the user's wallet address
#     # (This would involve calling the smart contract's mint function, which is not shown here

#     return Response({'eligible_for_certificate': True}, status=200)