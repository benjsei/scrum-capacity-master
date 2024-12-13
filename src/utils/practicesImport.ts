export const parsePracticesCSV = async (file: File): Promise<Array<{
  id: string;
  day: string;
  who: string;
  type: string;
  action: string;
  subActions: string;
  format: string;
  duration: string;
  isCompleted: boolean;
}>> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        const practices = lines.slice(1)
          .filter(line => line.trim() !== '')
          .map(line => {
            const values = line.split(',').map(v => v.trim());
            return {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              day: values[headers.indexOf('day')] || '',
              who: values[headers.indexOf('who')] || '',
              type: values[headers.indexOf('type')] || '',
              action: values[headers.indexOf('action')] || '',
              subActions: values[headers.indexOf('subActions')] || '',
              format: values[headers.indexOf('format')] || '',
              duration: values[headers.indexOf('duration')] || '',
              isCompleted: false
            };
          });
        
        resolve(practices);
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};