import unittest
import os
import re

class TestFitTrakHTML(unittest.TestCase):
    def setUp(self):
        self.filepath = os.path.join(os.path.dirname(__file__), 'index.html')
        with open(self.filepath, 'r', encoding='utf-8') as f:
            self.html_content = f.read()

    def test_file_exists(self):
        """Testa se o arquivo index.html existe"""
        self.assertTrue(os.path.exists(self.filepath))

    def test_has_title(self):
        """Testa se o HTML possui a tag de título correta"""
        self.assertIn('<title>Treino ABC Pro</title>', self.html_content)

    def test_has_workout_data(self):
        """Testa se a constante de treino foi definida no JS (edge case de carregamento)"""
        data_path = os.path.join(os.path.dirname(__file__), 'js', 'data.js')
        self.assertTrue(os.path.exists(data_path))
        with open(data_path, 'r', encoding='utf-8') as f:
            data_content = f.read()
        self.assertIn('const workoutData = {', data_content)
        self.assertIn("'a1'", data_content) # Verifica existencia de id


    def test_security_cdn(self):
        """Verifica se estamos carregando libs via https ou caminhos relativos seguros"""
        script_tags = re.findall(r'<script src="(.*?)"></script>', self.html_content)
        for src in script_tags:
            is_secure = src.startswith('https://') or not src.startswith('http')
            self.assertTrue(is_secure, f"Script não seguro carregado: {src}")

if __name__ == '__main__':
    unittest.main()
