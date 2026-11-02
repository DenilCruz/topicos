from django.db import migrations, models


class Migration(migrations.Migration):
    # Esta migración estaba pendiente: registra el mapeo sin crear audit_logs.
    # La tabla ya existe en Supabase y se administra fuera de Django.
    dependencies = [('autenticacion', '0001_initial')]

    operations = [
        migrations.CreateModel(
            name='AuditLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('usuario', models.CharField(max_length=100, null=True, blank=True)),
                ('ip_origen', models.CharField(max_length=45, null=True, blank=True)),
                ('metodo_accion', models.CharField(max_length=100, null=True, blank=True)),
                ('parametros_entrada', models.TextField(null=True, blank=True)),
                ('texto_analizado', models.TextField(null=True, blank=True)),
                ('prediccion_emitida', models.CharField(max_length=100, null=True, blank=True)),
                ('tiempo_ejecucion_ms', models.IntegerField(null=True, blank=True)),
                ('fecha_registro', models.DateTimeField(auto_now_add=True, null=True, blank=True)),
            ],
            options={'managed': False, 'db_table': 'audit_logs', 'ordering': ['-fecha_registro']},
        ),
    ]
