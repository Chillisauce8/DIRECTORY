export function checkCurrentTimeIsSuitableForTaskProcessing(): boolean {
  const possibleHourRangeStart = 0;
  const possibleHourRangeEnd = 6;

  const currentHour = new Date().getUTCHours();

  return currentHour >= possibleHourRangeStart && currentHour <= possibleHourRangeEnd;
}