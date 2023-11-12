export const handleError = (error: Error) => {
  console.error(error.message);
  throw error;
};
