import ms from 'ms';

export const plusDate = (date: Date, value: ms.StringValue): Date => {
  const milliseconds = ms(value);

  return new Date(date.getTime() + milliseconds);
};
