from rest_framework import serializers
from .models import Course, User


class CourseSerializer(serializers.ModelSerializer):
    # Return the creator's public key as a readable field
    creator_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all()
    )
    # Read-only count of companies interested
    companies_interested_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'course_id',
            'title',
            'description',
            'outcomes',
            'creator_id',
            'is_complete',
            'companies_interested_count',
        ]
        read_only_fields = ['course_id', 'is_complete', 'companies_interested_count']

    def get_companies_interested_count(self, obj):
        return obj.companies_interested.count()
