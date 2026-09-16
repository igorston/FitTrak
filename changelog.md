# Changelog

## [Unreleased]
- Criação dos arquivos `README.md`, `context.md` e `changelog.md` para documentar a aplicação e manter continuidade.
- Renomeado `ficha_de_treino_abc.html` para `index.html` para permitir o funcionamento imediato no GitHub Pages.
- Criação de testes unitários para avaliar a estrutura mínima requerida pelo HTML (`test_html.py`).
- Breve análise de segurança (pentest/avaliação) focada na injeção e estado do lado cliente.
- Adicionado botão e função lógica para resetar o timer das séries em execução (`resetTimer`).

*Nota de Segurança (Pentest)*: O projeto atual é puramente cliente (HTML/JS estático). Não possui integrações com backends, APIs expostas ou armazenamento de dados sensíveis além do `sessionStorage` local do próprio usuário. Sendo assim, a superfície de ataque é mínima, estando mitigados os principais riscos (como XSS via banco de dados ou SQL Injection). O uso da CDN para o Tailwind é confiável, mas seria ideal fixar versões ou usar Subresource Integrity (SRI) futuramente.
