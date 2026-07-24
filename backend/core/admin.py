from django.contrib import admin
from .models import (
    User, Course, Module, Section,
    MCQ, Info_panel, Coding_problem, Video, Blank
)


# ── Inlines ──────────────────────────────────────────────────────────────────

class ModuleInline(admin.TabularInline):
    model = Module
    extra = 0
    fields = ['title']


class SectionInline(admin.TabularInline):
    model = Section
    extra = 0
    fields = ['type_of_section']


class MCQInline(admin.StackedInline):
    model = MCQ
    extra = 0


class InfoPanelInline(admin.StackedInline):
    model = Info_panel
    extra = 0


class CodingProblemInline(admin.StackedInline):
    model = Coding_problem
    extra = 0


class VideoInline(admin.StackedInline):
    model = Video
    extra = 0


class BlankInline(admin.StackedInline):
    model = Blank
    extra = 0


# ── Model Admins ──────────────────────────────────────────────────────────────

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['public_key', 'name', 'type_of_user']
    list_filter = ['type_of_user']
    search_fields = ['public_key', 'name']
    filter_horizontal = ['courses_in_progress']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['course_id', 'title', 'creator_id', 'is_complete']
    list_filter = ['is_complete']
    search_fields = ['title', 'description']
    filter_horizontal = ['companies_interested']
    inlines = [ModuleInline]


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ['module_id', 'title', 'course_id']
    search_fields = ['title']
    inlines = [SectionInline]


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['section_id', 'module_id', 'type_of_section']
    list_filter = ['type_of_section']
    inlines = [MCQInline, InfoPanelInline, CodingProblemInline, VideoInline, BlankInline]


@admin.register(MCQ)
class MCQAdmin(admin.ModelAdmin):
    list_display = ['mcq_id', 'section_id', 'question']
    search_fields = ['question']


@admin.register(Info_panel)
class InfoPanelAdmin(admin.ModelAdmin):
    list_display = ['info_panel_id', 'section_id']
    search_fields = ['content']


@admin.register(Coding_problem)
class CodingProblemAdmin(admin.ModelAdmin):
    list_display = ['coding_problem_id', 'section_id']
    search_fields = ['description']


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['video_id', 'section_id', 'url']


@admin.register(Blank)
class BlankAdmin(admin.ModelAdmin):
    list_display = ['blank_id', 'section_id']
    search_fields = ['content']
