from rest_framework import serializers
from .models import Course, User, Module, Section, MCQ, Info_panel, Coding_problem, Video, Blank, Answer

class EnrollSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()
    public_key = serializers.CharField()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['public_key', 'is_staff', 'is_active', 'type_of_user', 'name']

class CourseSerializer(serializers.ModelSerializer):
    creator_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )
    creator_name = serializers.CharField(source='creator_id.name', read_only=True)
    companies_interested_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'course_id',
            'title',
            'description',
            'outcomes',
            'creator_id',
            'creator_name',
            'is_complete',
            'companies_interested_count',
        ]
        read_only_fields = ['course_id', 'is_complete', 'companies_interested_count', 'creator_name']

    def get_companies_interested_count(self, obj):
        return obj.companies_interested.count()

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['module_id', 'title', 'course_id']
        read_only_fields = ['module_id', 'course_id']


class MCQSerializer(serializers.ModelSerializer):
    class Meta:
        model = MCQ
        fields = ['mcq_id', 'section_id', 'question', 'options', 'correct_answer']
        read_only_fields = ['mcq_id', 'section_id']

class InfoPanelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Info_panel
        fields = ['info_panel_id', 'section_id', 'content']
        read_only_fields = ['info_panel_id', 'section_id']

class CodingProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coding_problem
        fields = ['coding_problem_id', 'section_id', 'description', 'test_cases']
        read_only_fields = ['coding_problem_id', 'section_id']

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['video_id', 'section_id', 'url']
        read_only_fields = ['video_id', 'section_id']

class BlankSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blank
        fields = ['blank_id', 'section_id', 'content', 'answers']
        read_only_fields = ['blank_id', 'section_id']


class SectionSerializer(serializers.ModelSerializer):
    content = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = ['section_id', 'module_id', 'type_of_section', 'content']
        read_only_fields = ['section_id', 'module_id', 'content']

    def get_content(self, obj):
        if obj.type_of_section == 'MCQ':
            child = obj.mcqs.first()
            if child: return MCQSerializer(child).data
        elif obj.type_of_section == 'Info_panel':
            child = obj.info_panels.first()
            if child: return InfoPanelSerializer(child).data
        elif obj.type_of_section == 'Coding_problem':
            child = obj.coding_problems.first()
            if child: return CodingProblemSerializer(child).data
        elif obj.type_of_section == 'Video':
            child = obj.videos.first()
            if child: return VideoSerializer(child).data
        elif obj.type_of_section == 'Blank':
            child = obj.blanks.first()
            if child: return BlankSerializer(child).data
        return None


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['answer_id', 'user_id', 'section_id', 'is_correct', 'user_answer', 'created_at']
        read_only_fields = ['answer_id', 'user_id', 'section_id', 'created_at']