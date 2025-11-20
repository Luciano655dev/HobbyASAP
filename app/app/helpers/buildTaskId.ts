export default function buildTaskId(
  sectionId: string,
  index: number,
  label: string
) {
  return `${sectionId}::${index}::${label}`
}
