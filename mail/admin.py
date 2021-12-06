from django.contrib import admin
from .models import User, Email

# Register your models here.
class Email_Admin(admin.ModelAdmin):
    list_display = ("id", "sender", "subject", "read")


admin.site.register(User)
admin.site.register(Email, Email_Admin)