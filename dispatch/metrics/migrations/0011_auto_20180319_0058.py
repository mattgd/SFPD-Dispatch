# Generated by Django 2.0.3 on 2018-03-19 00:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('metrics', '0010_call_point'),
    ]

    operations = [
        migrations.AlterField(
            model_name='call',
            name='neighborhood_district',
            field=models.CharField(max_length=100, null=True),
        ),
    ]
