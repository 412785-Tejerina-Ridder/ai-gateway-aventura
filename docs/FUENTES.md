# Fuentes de Misión Gati

Revisión documental y de código realizada el 16 de octubre de 2026. Estas notas acompañan la entrega para el equipo; no forman parte de la narrativa del juego.

## Referencia fijada

- Repositorio: `2026-P4-BE/tpi-llm`.
- [PR #190](https://github.com/2026-P4-BE/tpi-llm/pull/190).
- Rama consultada: `feature/s03/llm-s03-ai-gateway-economia-durable`.
- SHA consultado: `b224179e498874c1197bffa1341475c0ad4038b6`.
- Configuración de modelos y credenciales por curso: antecedente [PR #182](https://github.com/2026-P4-BE/tpi-llm/pull/182).

Los enlaces siguientes fijan el contenido al SHA consultado, para evitar que la explicación cambie silenciosamente con la rama.

## Documentación principal

- `AGENTS.md` y `docs/00-gobierno-y-evolucion/`: límites del servicio y precedencia documental.
- [Arquitectura AI Gateway y economía durable](https://github.com/2026-P4-BE/tpi-llm/blob/b224179e498874c1197bffa1341475c0ad4038b6/docs/02-arquitectura-y-plataforma/15-ai-gateway-y-economia-durable.md).
- [Estado EP-02](https://github.com/2026-P4-BE/tpi-llm/blob/b224179e498874c1197bffa1341475c0ad4038b6/docs/06-operacion-calidad-y-pruebas/04-estado-de-implementacion/ep-02/README.md).
- [Runbook AI Gateway](https://github.com/2026-P4-BE/tpi-llm/blob/b224179e498874c1197bffa1341475c0ad4038b6/docs/06-operacion-calidad-y-pruebas/04-estado-de-implementacion/ep-02/runbook-ai-gateway.md).
- [Economía durable](https://github.com/2026-P4-BE/tpi-llm/blob/b224179e498874c1197bffa1341475c0ad4038b6/docs/06-operacion-calidad-y-pruebas/04-estado-de-implementacion/ep-02/economia-durable.md).
- [Matriz de pruebas económicas](https://github.com/2026-P4-BE/tpi-llm/blob/b224179e498874c1197bffa1341475c0ad4038b6/docs/06-operacion-calidad-y-pruebas/04-estado-de-implementacion/ep-02/economia-durable-pruebas.md).
- [ADR-027: llaves y configuración por curso](https://github.com/2026-P4-BE/tpi-llm/blob/b224179e498874c1197bffa1341475c0ad4038b6/docs/00-gobierno-y-evolucion/adr/ADR-027-api-keys-en-vault-y-configuracion-por-curso.md).

## Contraste con implementación

Prefijo de clases Java: `app/src/main/java/ar/edu/utn/frc/tup/piv/llm/`.

| Concepto mostrado | Evidencia consultada | Decisión narrativa |
|---|---|---|
| Coordinación interna y perfiles | `application/service/ModelInvocationService.java`, `application/service/gateway/GatewayExecutor.java` | AI Gateway dentro del servicio; no confundir con entrada de plataforma. |
| Failover y plazo de TUTOR | Orquestación y política de fallos del Gateway, runbook y pruebas de Sprint 2 | Solo candidatos configurados; hasta dos respaldos; tiempo compartido. Un error inválido o un límite no se evade. El 429 no equivale automáticamente a caída. |
| Evaluador | Perfil EVALUATOR de la orquestación | Un deployment; no hereda automáticamente la cadena de TUTOR. Rúbrica y consistencia pertenecen al Evaluador. |
| Circuit breaker | Acceso a proveedores y configuración de resiliencia | Descanso y prueba de recuperación, local por instancia y proveedor. Tres fallos y reloj de la escena son ficción didáctica. |
| RAG | `application/service/RagChatService.java`, puertos de documentos y embeddings | RAG selecciona evidencia y preserva la cohorte; embeddings organizan por significado. Su chat usa TUTOR. |
| Menciones | `application/service/agent/AgentMentionService.java` | Mención válida, emisor y fuentes son responsabilidad del agente; puede usar TUTOR. |
| Generación | `adapter/out/generator/GatewayQuestionModel.java` | Invocación GENERATOR; validación y revisión pertenecen al Generador. |
| Calibración | `adapter/out/ai/CalibrationProviderAdapter.java`, `adapter/out/ai/ProviderInvocationGateway.java` | Puerto y presupuesto específicos; comparar con referencias humanas no es entrenar pesos ni elegir al primero. |
| Moderación | `moderation/infrastructure/client/`, `moderation/infrastructure/resilience/` | Pipeline especializado; no afirmar que todos sus clasificadores atraviesan GatewayExecutor. |
| Modelos y credenciales | `application/service/CourseModelAssignmentService.java`, ADR-027 y plan de Vault | Configuración aplicable al curso, identidad de credencial sin secreto; una llave propia no vuelve gratuito el consumo. |
| Registro físico durable | `application/port/out/PhysicalAttemptPort.java`, persistencia económica y documentación de #190 | Ticket previo al adaptador, resultado y uso con calidad. No confundir intención persistida con recepción por el proveedor. |
| Reservas e idempotencia | `domain/ai/economy/LogicalOperation.java` y núcleo económico de #190 | Simulación del mecanismo interno; reserva, autorización única, confirmación, liberación previa y conservación ante incertidumbre. |

## Límites pedagógicos preservados

- Los recorridos reales difieren entre módulos. La misión final es un caso ilustrativo Tutor + evidencia RAG, no una afirmación de integración universal.
- La observación durable es optativa en la referencia, con flags deshabilitados por defecto. El núcleo lógico no implica un descuento real a alumnos. Por eso las escenas económicas y la final se presentan como simulaciones de mecanismos internos.
- Un timeout no prueba costo cero. Uso reportado más catálogo permite un costo calculable, no necesariamente una factura conciliada. La demostración distingue «uso informado · costo calculable», «estimado» y «desconocido», sin pedir al visitante que decida el sello.
- Un replay no concede otra autorización de envío. Esto no promete exactamente una request dentro de un SDK externo.
- Una operación posiblemente enviada conserva su reserva mientras falta evidencia; el tiempo transcurrido no autoriza liberar o reenviar automáticamente.
- Los modelos GPT-4.1 (OpenAI) y Claude Sonnet (Anthropic) usan nombres reales como ejemplos reconocibles. Las fichas, tickets, fallos y configuraciones son ficticios y no representan una activación del backend, precios, políticas de cobro ni datos del proyecto.
- No se incorporaron pendientes, backlog o propuestas de arquitectura a la experiencia.

Las fuentes quedan como trazabilidad para el equipo. La aplicación compilada no las solicita ni necesita conexión para consultarlas durante el juego.

## Nombres de modelos

Se verificó la nomenclatura con las páginas oficiales de [GPT-4.1 de OpenAI](https://developers.openai.com/api/docs/models/gpt-4.1) y de [modelos Claude de Anthropic](https://platform.claude.com/docs/en/about-claude/models/model-ids-and-versions). Se usan como ejemplos didácticos, sin comparar capacidades ni recomendar versiones o tarifas.
