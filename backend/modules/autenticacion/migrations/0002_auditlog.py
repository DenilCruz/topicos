from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('autenticacion', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='AuditLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('user_identifier', models.CharField(blank=True, db_index=True, max_length=150, null=True)),
                ('method', models.CharField(default='AUDIT', max_length=10)),
                ('path', models.CharField(db_index=True, max_length=500)),
                ('status_code', models.IntegerField(default=200)),
                ('duration_ms', models.FloatField(default=0.0)),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('severity', models.CharField(default='INFO', max_length=15)),
                ('message', models.TextField(blank=True, default='')),
            ],
            options={
                'db_table': 'audit_logs',
                'ordering': ['-timestamp'],
            },
        ),
    ]

