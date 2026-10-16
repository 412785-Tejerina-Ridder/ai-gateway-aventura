import type { Character } from "../types";
export interface ModuleStory {
  id: Character;
  title: string;
  place: string;
  line: string;
  job: string;
  gateway: string;
  own: string;
  win: string;
}
export const modules: ModuleStory[] = [
  {
    id: "tutor",
    title: "El Profe y las treinta manos levantadas",
    place: "AULA DE LAS BUENAS PISTAS",
    line: "«¡Mi principal se durmió justo en clase! ¿Me conseguís un respaldo, Gati?»",
    job: "Acompaño al alumno para que aprenda, con contexto y guardarraíles pedagógicos.",
    gateway:
      "Uso la función TUTOR: configuración aplicable, cadena de candidatos, plazo y fallos controlados.",
    own: "Yo preparo el contexto y cuido qué ayuda es apropiada. Gati no decide la respuesta pedagógica.",
    win: "A falla → Gati coordina B → el Profe entrega una pista.",
  },
  {
    id: "evaluator",
    title: "Eva no cambia la vara a mitad de camino",
    place: "OFICINA DE LA MISMA REGLA",
    line: "«Dos conversaciones con la misma evidencia merecen el mismo criterio. Mi sello no es una tómbola.»",
    job: "Analizo cómo se usó la IA con una rúbrica y un perfil de evaluación.",
    gateway:
      "Invoco EVALUATOR con un deployment resuelto. No uso automáticamente los respaldos de TUTOR.",
    own: "Yo preparo la evaluación, aplico su rúbrica y gestiono resultados o diferimientos.",
    win: "Eva estampa 4 / 4 con la misma regla. Un deployment, un perfil.",
  },
  {
    id: "rag",
    title: "Biblio encuentra la página que hacía falta",
    place: "BIBLIOTECA CON PATAS",
    line: "«Yo encuentro los apuntes. ¡Vos encargate de hablar con la IA!»",
    job: "Busco fragmentos relevantes del material del curso y mantengo el aislamiento entre cohortes.",
    gateway:
      "Uso invocaciones de embeddings y, en el chat RAG, TUTOR. Cada recorrido conserva su contexto.",
    own: "Yo selecciono las fuentes y decido si hay respaldo documental. Gati no elige páginas académicas.",
    win: "El fragmento correcto viaja con la consulta. Fuente elegida por RAG, invocación coordinada por Gati.",
  },
  {
    id: "moderation",
    title: "Mora y el silbato de las buenas conversaciones",
    place: "PUESTO DE CONVIVENCIA",
    line: "«Yo reviso el contenido. ¡No le pidan a Gati que escriba las reglas del recreo!»",
    job: "Clasifico situaciones según las reglas y clasificadores de moderación.",
    gateway:
      "Mi pipeline tiene caminos especializados de clasificadores y resiliencia; no lo confundas con el recorrido común del Tutor.",
    own: "Las decisiones de contenido, el circuito de revisión y la continuidad del chat son responsabilidad de Moderación.",
    win: "Mora clasifica y conserva sus reglas. La infraestructura de invocación no reemplaza su criterio.",
  },
  {
    id: "agent",
    title: "Ari solo atiende cuando lo llaman de verdad",
    place: "CORREO DE LAS MENCIONES",
    line: "«¿Alguien dijo @agente? ¡Tengo una entrega con fuentes!»",
    job: "Respondo a menciones válidas y preparo una respuesta citada y moderada.",
    gateway:
      "Puedo usar la función compartida TUTOR; el dominio de mi trabajo sigue siendo el agente.",
    own: "Yo valido la mención, el emisor, la cohorte y las fuentes. Un bot no puede llamarme en bucle.",
    win: "Persona → @agente → contexto con fuentes → función TUTOR. Cada uno conserva su trabajo.",
  },
  {
    id: "generator",
    title: "Geno inventa, pero también revisa",
    place: "TALLER DE IDEAS CON FUENTE",
    line: "«¡Una máquina de preguntas! Pero nada sale del taller sin revisión.»",
    job: "Preparo contenido educativo a partir de un pedido y del material correspondiente.",
    gateway:
      "Mi camino de generación usa la invocación configurada para GENERATOR y sus controles técnicos.",
    own: "Yo defino el pedido, valido el contenido y manejo el borrador y su revisión. Gati no aprueba preguntas.",
    win: "Pedido → Gati invoca → Geno valida → borrador para revisar. ¡No hay sello de aprobación automática!",
  },
  {
    id: "calibration",
    title: "Cali mide antes de confiar",
    place: "LABORATORIO DE CONSISTENCIA",
    line: "«Que responda rápido no significa que evalúe bien. ¡Traeme la regla!»",
    job: "Comparo resultados del modelo con referencias humanas sobre un conjunto de casos.",
    gateway:
      "Uso un puerto de calibración y el acceso a proveedores. Mi recorrido y presupuesto son propios; no soy otra escena de failover TUTOR.",
    own: "Yo preparo casos, perfiles, métricas y el proceso de aprobación de la calibración. No entreno los pesos del modelo.",
    win: "Referencia humana y salida del modelo, lado a lado. Calibrar es medir, no entrenar ni elegir al más rápido.",
  },
];
