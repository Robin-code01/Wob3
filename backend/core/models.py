from django.db import models
from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, public_key, password=None, **extra_fields):
        if not public_key:
            raise ValueError("The public_key must be set")
        public_key = public_key.lower()
        user = self.model(public_key=public_key, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, public_key, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(public_key, password, **extra_fields)


# Create your models here.
class User(AbstractBaseUser, PermissionsMixin):
    public_key = models.CharField(max_length=128, unique=True, primary_key=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "public_key"
    REQUIRED_FIELDS = []

    objects = UserManager()

    courses_in_progress = models.ManyToManyField('Course', related_name='users_in_progress', blank=True)
    TYPE_CHOICES = [
        ('Student', 'Student'),
        ('Organization', 'Organization'),
    ]
    type_of_user = models.CharField(max_length=50, choices=TYPE_CHOICES, default='Student')
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
    SECTION_TYPES = [
        ('MCQ', 'Multiple Choice Question'),
        ('Info_panel', 'Information Panel'),
        ('Coding_problem', 'Coding Problem'),
        ('Video', 'Video'),
        ('Blank', 'Blank'),
    ]
    type_of_section = models.CharField(max_length=50, choices=SECTION_TYPES, default='MCQ')
    class Meta:
        order_with_respect_to = 'module_id'

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

class Video(models.Model):
    video_id = models.AutoField(primary_key=True, blank=False, null=False)
    section_id = models.ForeignKey('Section', on_delete=models.CASCADE, related_name='videos', blank=True, null=True)
    url = models.URLField()

class Blank(models.Model):
    blank_id = models.AutoField(primary_key=True, blank=False, null=False)
    section_id = models.ForeignKey('Section', on_delete=models.CASCADE, related_name='blanks', blank=True, null=True)
    content = models.TextField()
    answers = models.TextField()


class Answer(models.Model):
    answer_id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name='answers')
    section_id = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='answers')
    is_correct = models.IntegerField(choices=[(0, 'Incorrect'), (1, 'Correct')], default=0)
    user_answer = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # A user can only have one active answer per section
        unique_together = ('user_id', 'section_id')
