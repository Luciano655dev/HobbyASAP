import buildTaskId from "./buildTaskId"

export default function buildLessonSectionTaskId(
  lessonIndex: number,
  sectionIndex: number,
  heading: string
) {
  return buildTaskId(`lesson-${lessonIndex}-section`, sectionIndex, heading)
}
