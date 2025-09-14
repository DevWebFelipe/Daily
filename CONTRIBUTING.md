# Contribuindo para o Daily 🚀

Obrigado por considerar contribuir para o **Daily**! 🎉

Este documento descreve as diretrizes para contribuir com o projeto.

---

## 📚 Sumário

- [Como posso contribuir?](#-como-posso-contribuir)
- [Reportando problemas (Issues)](#-reportando-problemas-issues)
- [Sugestões de melhorias](#-sugestões-de-melhorias)
- [Padrão de commits](#-padrão-de-commits)
- [Abrindo um Pull Request](#-abrindo-um-pull-request)
- [Estilo de código](#-estilo-de-código)
- [Checklist antes de enviar PR](#-checklist-antes-de-enviar-pr)

---

## 🙋 Como posso contribuir?

Existem várias formas:

1. Reportando _bugs_ 🐞
2. Sugerindo novas funcionalidades ✨
3. Melhorando a documentação 📖
4. Implementando código/testes 🛠️
5. Criando exemplos e tutoriais 🎬

---

## 🐛 Reportando problemas (Issues)

- Antes de abrir uma _issue_, verifique se já não existe uma semelhante.
- Ao reportar:

  - Descreva o problema de forma clara;
  - Inclua **passos para reproduzir**;
  - Informe **qual navegador e versão** você está usando;
  - Inclua **prints/gifs** se possível.

Exemplo de título:

```
[BUG] Erro ao salvar tarefa quando horário final < inicial
```

---

## 💡 Sugestões de melhorias

- Use o prefixo `[FEATURE]` no título da issue.
- Explique o que gostaria de ver implementado.
- Justifique o benefício para os usuários.

Exemplo:

```
[FEATURE] Exportar tarefas do dia em JSON
```

---

## 📝 Padrão de commits

Utilize commits claros, preferencialmente no formato **Conventional Commits**:

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação/indentação (sem alteração de lógica)
- `refactor:` refatoração de código
- `test:` testes
- `chore:` tarefas administrativas

Exemplo:

```
feat: adiciona gráfico de distribuição das tarefas
fix: validação de sobreposição não considerava horários iguais
```

---

## 🔀 Abrindo um Pull Request

1. **Fork** o repositório e crie uma branch:

   ```bash
   git checkout -b feat/nome-descritivo
   ```

2. Faça commits claros seguindo o padrão acima.

3. Atualize a documentação se necessário (README, comentários, exemplos).

4. Abra o PR descrevendo:

   - O que foi alterado;
   - Por que foi necessário;
   - Como testar.

Exemplo de título de PR:

```
feat: adiciona opção de limpar anotações rápidas
```

---

## 🎨 Estilo de código

- JavaScript Vanilla (sem frameworks obrigatórios).
- Organização de arquivos dentro de `assets/` (`css/`, `js/`, `img/`).
- Use nomes de variáveis e funções **em inglês**.
- Prefira `const`/`let` em vez de `var`.
- Indentação de 2 espaços.
- Comentários claros para funções complexas.

---

## ✅ Checklist antes de enviar PR

- [ ] O código roda corretamente no navegador sem erros no console;
- [ ] O comportamento esperado foi testado (tarefas diárias, semanais, quick notes);
- [ ] Não quebrei compatibilidade com dados existentes no `localStorage`;
- [ ] Atualizei a documentação (se aplicável);
- [ ] Incluí prints/gifs (se houver alteração visual).

---

## ❤️ Agradecimento

Toda contribuição é bem-vinda, seja um pequeno ajuste ou uma grande funcionalidade. Obrigado por ajudar a melhorar o **Daily**! 🙌
