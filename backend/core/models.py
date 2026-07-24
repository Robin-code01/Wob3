from django.db import models

# Create your models here.
class User(models.Model):
    public_key = models.CharField(max_length=128, unique=True, primary_key=True, blank=False, null=False)
    courses_in_progress = models.ManyToManyField('Course', related_name='users_in_progress', blank=True)
    type_of_user = models.CharField(max_length=50, choices=[('Student'), ("Organization")], default='Student')
    name = models.CharField(max_length=100, blank=True, null=True)

class Course(models.Model):
    course_id = models.AutoField(primary_key=True, blank=False, null=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    outcomes = models.TextField()
    companies_interested = models.ManyToManyField('User', related_name='interested_courses', blank=True)
    creator_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_courses', blank=False, null=False)
    is_complete = models.BooleanField(default=False)

class Module(models.Model):
    module_id = models.AutoField(primary_key=True, blank=False, null=False)
    title = models.CharField(max_length=200)
    course_id = models.ForeignKey('Course', on_delete=models.CASCADE, related_name='modules', blank=True, null=True)
    
class Section(models.Model):
    section_id = models.AutoField(primary_key=True, blank=False, null=False)
    module_id = models.ForeignKey('Module', on_delete=models.CASCADE, related_name='sections', blank=True, null=True)
    type_of_section = models.CharField(max_length=50, choices=[('MCQ'), ("Info_panel"), ("Coding_problem")], default='MCQ')
    class Meta:
        order_with_respect_to = 'Module'

class MCQ(models.Model):
    mcq_id = models.AutoField(primary_key=True, blank=False, null=False)
    section_id = models.ForeignKey('Section', on_delete=models.CASCADE, related_name='mcqs', blank=True, null=True)
    question = models.TextField()
    options = models.JSONField()
    correct_answer = models.CharField(max_length=200)

class Info_panel(models.Model):
    info_panel_id = models.AutoField(primary_key=True, blank=False, null=False)
    section_id = models.ForeignKey('Section', on_delete=models.CASCADE, related_name='info_panels', blank=True, null=True)
    content = models.TextField()

class Coding_problem(models.Model):
    coding_problem_id = models.AutoField(primary_key=True, blank=False, null=False)
    section_id = models.ForeignKey('Section', on_delete=models.CASCADE, related_name='coding_problems', blank=True, null=True)
    description = models.TextField()
    test_cases = models.JSONField()