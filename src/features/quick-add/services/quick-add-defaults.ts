export type QuickAddTimeRange = {
  endTime: string
  startTime: string
}

function formatTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/** Returns a planner-compatible local time range for the Quick Add form. */
export function getQuickAddTimeRange(
  now: Date,
  timeIncrementMinutes: number,
  defaultBlockMinutes: number,
): QuickAddTimeRange {
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const roundedStart =
    Math.ceil(currentMinutes / timeIncrementMinutes) * timeIncrementMinutes
  const lastValidEnd =
    Math.floor((24 * 60 - 1) / timeIncrementMinutes) * timeIncrementMinutes
  const latestStart = lastValidEnd - defaultBlockMinutes
  const startMinutes = Math.min(roundedStart, latestStart)

  return {
    endTime: formatTime(startMinutes + defaultBlockMinutes),
    startTime: formatTime(startMinutes),
  }
}
