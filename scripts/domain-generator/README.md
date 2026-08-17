# Domain Generator

CLI para gerar a estrutura inicial de um novo domain em `src/domains`.

## Uso

```bash
bun run create:domain <domain-name>
```

## Opcoes

- `--dry-run`: apenas mostra os arquivos que seriam gerados.
- `--force`: sobrescreve arquivos de um domain existente.

## Exemplo

```bash
bun run create:domain billing-engine --dry-run
```
