# Turmas e matrículas — primeira entrega do staff

A interface está em `/staff/classes`, com criação em `/staff/classes/new` e
gestão de cada oferta em `/staff/classes/:classId`. Usa os registros reais dos
mesmos cursos, períodos, turmas e matrículas consumidos pelo dashboard do aluno.

## Permissões e regras

| Ação                                             | Staff ativo | Admin ativo | Professor / aluno |
| ------------------------------------------------ | ----------- | ----------- | ----------------- |
| Consultar gestão de turmas, alunos e professores | Sim         | Sim         | Não               |
| Criar/editar turma e vincular professores        | Sim         | Sim         | Não               |
| Matricular e alterar situação                    | Sim         | Sim         | Não               |

A autorização consulta a conta autenticada no backend. Contas administrativas
pendentes, bloqueadas ou suspensas não podem executar as operações. A identidade
de autenticação é isolada por requisição, inclusive sob concorrência.

- Ano e semestre são derivados do período letivo selecionado.
- Curso e período são fixos após a criação; a edição altera nome, código e
  turno.
- Matrículas são únicas por aluno e turma. Um vínculo existente deve ser
  atualizado.
- Alunos com perfil acadêmico ativo e conta ativa ou pendente podem ser
  matriculados.
- Um aluno sem curso recebe o curso da turma na mesma transação da matrícula; um
  aluno de outro curso é rejeitado. O formulário informa esse comportamento.
- Cancelamentos e inativações preservam a matrícula e os demais registros
  acadêmicos.
- Matrículas `active` e `completed` aparecem no dashboard do aluno; `cancelled`
  e `inactive` não aparecem. A reativação preserva o identificador da matrícula.
- Listas de turmas, candidatos e matrículas têm páginas de 25 registros e busca
  no servidor.
- Consultas administrativas resumidas não enviam documentos pessoais, entregas
  ou planos completos.

## Rotas

Prefixo `/api/v1/curriculum`:

| Método     | Rota                                                  | Uso                                          |
| ---------- | ----------------------------------------------------- | -------------------------------------------- |
| GET        | `/courses`                                            | Cursos para seleção                          |
| GET / POST | `/class-offerings`                                    | Listar / criar turmas                        |
| GET / PUT  | `/class-offerings/:classId`                           | Consultar / editar turma                     |
| GET        | `/students`                                           | Buscar candidatos por nome/matrícula e curso |
| GET        | `/professors`                                         | Buscar professores ativos                    |
| GET / POST | `/class-offerings/:classId/enrollments`               | Listar / matricular                          |
| PATCH      | `/class-offerings/:classId/enrollments/:enrollmentId` | Atualizar situação                           |
| POST       | `/class-offerings/:classId/professors`                | Vincular professor                           |
| DELETE     | `/class-offerings/:classId/professors/:professorId`   | Desvincular professor                        |

## Verificação

No backend: `bun run test:staff`. No frontend: `bun run test:e2e:staff`. Os
testes cobrem autorização, criação seguida de consulta, matrícula duplicada,
visibilidade no dashboard do aluno, isolamento da matrícula por turma,
preservação do identificador, navegação, formulário com erro recuperável e
layout móvel.

Em 11/09/2026 também foi executado o fluxo pelo navegador contra a API e o banco
de desenvolvimento, sem interceptar respostas: criar turma, matricular o aluno
de referência, consultar como aluno e cancelar. A turma temporária foi removida
ao final.

Esta entrega reutiliza os cursos e períodos existentes. Cadastro completo de
cursos, gestão de períodos pela interface, operações de matrícula em lote e
auditoria detalhada ficam para as próximas entregas. Planejamento, aulas e
lançamento de notas continuam separados das operações administrativas desta
tela.
