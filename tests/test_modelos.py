"""Prueba de integración con ejemplos sintéticos, sin valor de evaluación real."""
import csv
import tempfile
import unittest
from pathlib import Path
import joblib
from src.models.entrenar import ejecutar_entrenamiento, cargar_dataset


class PruebasModelos(unittest.TestCase):
    def test_entrenamiento_guardado_y_prediccion(self):
        with tempfile.TemporaryDirectory() as temporal:
            ruta = Path(temporal) / 'datos.csv'
            with ruta.open('w', encoding='utf-8', newline='') as archivo:
                escritor = csv.writer(archivo)
                escritor.writerow(['texto', 'categoria'])
                for numero in range(12):
                    escritor.writerow([f'cable desconectado equipo {numero}', 'cable'])
                    escritor.writerow([f'nombre dominio no resuelve equipo {numero}', 'dns'])
            salida = Path(temporal) / 'artifacts'
            informe = ejecutar_entrenamiento(ruta, salida, metodos=('stemming',))
            self.assertEqual(set(informe['modelos']), {'regresion_logistica', 'naive_bayes'})
            self.assertFalse(set(informe['indices_entrenamiento']) & set(informe['indices_prueba']))
            modelo = joblib.load(salida / 'pipeline.joblib')
            self.assertEqual(modelo.predict_proba(['cable desconectado']).shape, (1, 2))
            self.assertAlmostEqual(modelo.predict_proba(['cable desconectado']).sum(), 1.0)
            self.assertTrue((salida / 'metricas.json').exists())

    def test_rechaza_duplicados(self):
        with tempfile.TemporaryDirectory() as temporal:
            ruta = Path(temporal) / 'datos.csv'
            ruta.write_text('texto,categoria\nFalla red,a\nfalla red!,b\n', encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'duplicado'):
                cargar_dataset(ruta)
