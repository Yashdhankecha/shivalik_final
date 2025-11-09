/**
 * Format a date string to dd-mm-yyyy format
 * @param dateStr - The date string to format
 * @returns Formatted date string in dd-mm-yyyy format
 */
export const formatDateToDDMMYYYY = (dateStr: string): string => {
  if (!dateStr) return 'N/A';
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format a date to dd-mm-yyyy format
 * @param date - The Date object to format
 * @returns Formatted date string in dd-mm-yyyy format
 */
export const formatDate = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return 'Invalid Date';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};