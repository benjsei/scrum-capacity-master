import { AgilePractice } from '../types/agilePractice';
import Papa from 'papaparse';

export const parsePracticesCSV = async (file: File): Promise<AgilePractice[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const practices: AgilePractice[] = results.data.map((row: any, index) => ({
            id: (index + 1).toString(),
            day: row.day?.trim() || '',
            who: row.who?.trim() || '',
            type: row.type?.trim() || '',
            action: row.action?.trim() || '',
            subActions: row.subActions?.trim() || '',
            format: row.format?.trim() || '',
            duration: row.duration?.trim() || '',
            isCompleted: false
          }));

          console.log('Parsed practices:', practices);
          resolve(practices);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          reject(new Error('Format de fichier CSV invalide'));
        }
      },
      error: (error) => {
        console.error('Papa Parse error:', error);
        reject(new Error('Erreur lors de la lecture du fichier CSV'));
      }
    });
  });
};