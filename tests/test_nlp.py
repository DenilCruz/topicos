import unittest
from sklearn.base import clone
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from src.nlp.pipeline import crear_pipeline_nlp, explicar_preprocesamiento
from src.nlp.N_gramas import generar_ngramas
from src.nlp.explicacion import explicar_pipeline_entrenado


class PruebasNlp(unittest.TestCase):
    def test_desglose_usa_configuracion_y_pesos_entrenados(self):
        pipeline = crear_pipeline_nlp(rango_ngramas=(1, 1))
        pipeline.fit(['falla red', 'puerto bloqueado'])
        pasos = explicar_pipeline_entrenado(pipeline, 'falla red')
        self.assertEqual(pasos['rango_ngramas'], [1, 1])
        self.assertTrue(all(' ' not in termino for termino in pasos['ngramas']))
        self.assertTrue(pasos['caracteristicas_tfidf'])
        self.assertEqual(explicar_pipeline_entrenado(pipeline, 'xyzdesconocido')['caracteristicas_tfidf'], [])

    def test_separacion_conserva_pesos_tfidf(self):
        textos = ['falla red red', 'puerto bloqueado red']
        pipeline = crear_pipeline_nlp()
        matriz = pipeline.fit_transform(textos)
        procesados = pipeline.named_steps['preprocesamiento'].transform(textos)
        referencia = TfidfVectorizer(tokenizer=str.split, token_pattern=None,
                                    lowercase=False, ngram_range=(1, 2))
        np.testing.assert_allclose(matriz.toarray(), referencia.fit_transform(procesados).toarray())
        self.assertEqual(generar_ngramas(['falla', 'red']), ['falla', 'red', 'falla red'])

    def test_conserva_negacion(self):
        pasos = explicar_preprocesamiento('El puerto 443 no funciona')
        self.assertIn('no', pasos['tokens_sin_palabras_vacias'])
        self.assertIn('443', pasos['tokens'])

    def test_ngramas_y_vocabulario(self):
        pipeline = crear_pipeline_nlp()
        pipeline.fit(['falla red', 'puerto bloqueado'])
        vectorizador = pipeline.named_steps['ngramas']
        self.assertTrue(any(' ' in n for n in vectorizador.get_feature_names_out()))
        pipeline.transform(['xyzdesconocido'])
        self.assertNotIn('xyzdesconocido', vectorizador.vocabulary_)
        self.assertEqual(clone(pipeline).get_params()['ngramas__ngram_range'], (1, 2))

    def test_metodo_invalido(self):
        with self.assertRaises(ValueError):
            explicar_preprocesamiento('falla red', metodo='otro')
