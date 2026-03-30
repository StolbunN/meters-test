export function formatDate(date: string) {
  if (!date) return '-';
  return `${Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(date))}`;
}
