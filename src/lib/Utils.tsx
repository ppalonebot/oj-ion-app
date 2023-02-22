export function FormatDate(isoDateTime: string): { date: string, time: string, isToday: boolean  } {
  const date = new Date(isoDateTime);
  const localDate = date.toLocaleDateString(undefined, { year: '2-digit', month: '2-digit', day: '2-digit' })
  const localTime = date.toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit', hour12:false});
  const isToday = date.toDateString() === new Date().toDateString();
  
  return {
    date: localDate,
    time: localTime,
    isToday: isToday
  };
}