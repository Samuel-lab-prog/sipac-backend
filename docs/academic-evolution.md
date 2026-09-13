# Evolução acadêmica

## Entrega inicial

- Navegação da secretaria e administração, identificação e perfil legível.
- Identificação institucional editável, com uma instituição e um campus
  operacional por instalação. Os registros existentes pertencem ao campus
  inicial, sem atribuir nomes ou identidade oficial a dados de desenvolvimento.
- Projetos de ensino, pesquisa e extensão: coordenação, participantes, planos,
  relatórios, avaliação e registro das transições.
- Declarações de vínculo e matrícula, com dados congelados, PDF, código de
  autenticidade e revogação; certificados de participação dependem de conclusão
  e validação de carga horária.

## Limites institucionais

Institution e Campus são entidades persistidas, e User, Department e
AcademicPeriod possuem campusId. A interface de configuração edita a identidade
do campus existente. Ela não cadastra campi adicionais. As APIs legadas ainda
precisam de uma revisão completa de escopo antes de permitir mais de um campus
ou instituição na instalação. Não há promessa de isolamento multitenant nesta
entrega.

## Próximas entregas e critérios

1. Multicampus: vínculos com funções por unidade, permissões por escopo em TODAS
   as rotas legadas, revisão de índices únicos, caches, uploads e consultas por
   ID. Testar acesso cruzado, inclusive usando IDs conhecidos.
2. Vida acadêmica: componentes, matrizes e ementas versionadas, turma de
   ingresso, vínculo ao curso, série/etapa e resultados homologados. Migrar
   dados existentes sem inferir aprovação, série ou carga horária a partir de
   matrícula ativa.
3. Resultados: regras institucionais de avaliação, recuperação, arredondamento,
   frequência por carga horária e fechamento/reabertura auditados.
4. Boletim e histórico: consumir resultados homologados e preservar o documento
   emitido mesmo após correções. Acrescentar equivalências e transferências.
5. Conclusão: verificação de integralização e homologação institucional,
   incluindo requisitos não representados por notas. Não equiparar
   enrollment.completed a conclusão de curso.
6. Projetos: editais, bolsas, anexos, avaliações especializadas e eventos
   científicos.

Assinatura digital e aceitação institucional dos documentos requerem
configuração do processo real da instituição. O código de autenticidade verifica
o registro no AGIAS e não representa uma assinatura digital.
