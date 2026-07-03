export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

export const toDateInputValue = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export const getTodayDateInput = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};
