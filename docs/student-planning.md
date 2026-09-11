# Planejamento acadêmico — fase do aluno

A experiência usa o backend real. Fixtures tipadas são usadas somente pelos testes; não substituem respostas da API em produção.

## Telas

- /student/schedule: filtros por período, disciplina e tipo; mês/semana; aulas canceladas e reposições; avaliações, prazos e eventos acadêmicos.
- /student/classes: disciplinas das matrículas ativas e concluídas, professor(es), período e progresso.
- /student/classes/:classOfferingId: resumo da turma, planejamento, aulas, conteúdos ministrados, atividades e avaliações.
- /student/classes/:classOfferingId/plan: planejamento publicado, unidades, tópicos e aulas associadas.
- /student/classes/:classOfferingId/activities: atividades e sua situação.
- /student/classes/:classOfferingId/assessments: tipo, aplicação, valor, peso, nota e materiais.
- /student/materials: materiais publicados nas aulas e atividades.
- Os caminhos antigos /student/subjects/:enrollmentId continuam funcionando. IDs de turma e matrícula são resolvidos separadamente.

O parâmetro ?period=2026.2 preserva a seleção entre agenda e disciplina. O início mostra próxima aula, conteúdo recente, atividades pendentes e próxima avaliação.

## Contrato e regras

O endpoint GET /academic/students/dashboard/me reúne os dados da própria pessoa autenticada. GET /curriculum/academic-periods fornece os períodos. GET /academic-calendar/students/me/events?from=...&to=... fornece eventos dos períodos em que há matrícula ativa ou concluída. Eventos que começam antes da janela mas terminam dentro dela também são retornados.

- classOffering.academicPeriod: id, code, year, term, startsAt, endsAt.
- classOffering.professors: lista de id/name; lista vazia significa professor não informado.
- sessions: campos anteriores e status, deliveredContent, room, publicNotes, replacesSessionId, materials.
- activities: campos anteriores e kind (activity/assessment), assessmentType, appliesAt, maxGrade, weight, vínculos opcionais com unidade/tópico/aula e attachments.
- plan: apenas CoursePlan publicado, ou null. Rascunhos não são enviados nem no perfil aninhado.
- Datas e horários são apresentados em pt-BR, America/Sao_Paulo. Para eventos de dia inteiro, a parte de data do contrato é preservada.
- Aula passada sem confirmação não é automaticamente realizada: a interface mostra “Realização não informada”.
- Um tópico é concluído quando tem ao menos uma aula válida associada e todas estão completed. Canceladas/remarcadas não contam; uma reposição ainda prevista mantém o tópico em andamento. O progresso conta tópicos únicos, entre 0 e 100%.
- Uma aula nova pode apontar para a cancelada por replacesSessionId. A original continua no histórico.
- Avaliação sem nota exibe “Nota não publicada”. Nota zero é uma nota válida.
- Materiais são links HTTP(S). Uma URL de outro protocolo não é renderizada como link.

Os campos opcionais no frontend permitem ler respostas anteriores durante uma atualização do backend. As telas não criam nem editam planejamento. O fluxo de entrega de atividades que já existia continua disponível.

A entidade de avaliação nesta fase reutiliza AcademicActivity com kind=assessment e as notas existentes de AcademicActivitySubmission. Não há um segundo cadastro independente de avaliações.

## Banco e dados de demonstração

A migração 20260911003000_student_learning_read_model é aditiva. Ela não apaga aulas nem converte texto antigo em confirmação de realização. As migrações anteriores do planejamento devem ser aplicadas primeiro.

No diretório backend:

```powershell
bun run db:generate
bun x prisma migrate deploy
bun run db:seed:students
```

O comando db:seed existente também passa a executar os novos cenários após seus dados anteriores.

| Cenário | CPF de acesso | E-mail de identificação |
|---|---|---|
| Completo | 99000000001 | student.complete@dev.agias.example |
| Sem aulas | 99000000002 | student.empty@dev.agias.example |
| Dois períodos | 99000000003 | student.semester@dev.agias.example |
| Dados incompletos | 99000000004 | student.exceptions@dev.agias.example |

Senha de demonstração: **student-demo-2026**. A tela de login usa CPF, não e-mail. Datas de referência dos cenários: **10/09/2026**, com períodos 2026.1 e 2026.2; as datas não mudam a cada execução.

Cenários isolados e limpeza:

```powershell
bun run db:seed:students --scenario=complete
bun run db:seed:students --scenario=empty
bun run db:seed:students --scenario=semester
bun run db:seed:students --scenario=exceptions
bun run db:seed:students --scenario=complete --clean
```

--clean remove apenas turmas, relações e aluno do cenário selecionado com identificadores DEV-AGIAS. Sem --scenario, limpa os quatro cenários. Períodos institucionais e as bases compartilhadas de demonstração (curso, departamento, professor e eventos) são preservados. Os seeds recusam ambientes diferentes de development/test e verificam a identidade do banco. Não use db:reset para trocar cenários.

Estrutura: config.ts define cenários, credenciais e ambiente; catalogs contém disciplinas e eventos; factories cria cada dependência; scenarios/student.scenarios.ts compõe os quatro casos; utils/dates.ts gera datas semanais fixas; index.ts executa a transação e controla limpeza; cli.ts é o ponto de entrada. A rotina anterior de demonstração e planning.ts foram preservados.

Execuções são idempotentes por chaves naturais. Novas execuções atualizam os dados do cenário, preservam aulas adicionais e não recriam registros. Os cenários são executados em transação. Eventos institucionais já existentes no mesmo dia são reaproveitados. Os seeds não oferecem execução concorrente.

## Validação

Backend:

```powershell
bun run typecheck
bun run db:migrate:test
bun run test:student-planning
bun run build
```

O banco de testes local configurado deve existir e ter identidade de test. Os testes usam o Prisma real para validar contrato, rascunhos, histórico, idempotência, períodos concluídos e sobreposição de eventos.

Frontend:

```powershell
bun run typecheck
bun run test:run
bun x playwright install chromium --only-shell
bun run test:e2e e2e/student-planning.spec.ts
```

Os testes de navegador usam fixtures do mesmo contrato e relógio fixo para cobrir troca de período, filtros, navegação, cancelamento/reposição, datas brasileiras, eventos de vários dias, dados incompletos, estados vazios, erro/retentativa, materiais, teclado e largura de celular.

## Evolução futura

As consultas podem ser separadas em GET /students/me/classes e GET /class-offerings/:id, /plan, /sessions, /activities, /assessments mantendo os mesmos objetos de resposta e a verificação de matrícula. Esses endpoints separados não foram criados nesta fase.

A gestão de professor/staff, ClassSchedule persistido, geração de aulas em produção, edição/publicação de planejamento, diário, fechamento de aulas e relatórios avançados pertencem às próximas fases. A recorrência atual existe apenas nas factories dos seeds. Não há novas telas administrativas.
