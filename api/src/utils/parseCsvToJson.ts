// utils/parseCsvToJson.ts

import { parse } from 'csv-parse/sync';
import { parseJSON } from 'libs';
import { AppError } from 'middlewares/error';

/**
 * Converts a Multer CSV file into a list of JSON objects.
 * @param file The Multer file object (single file).
 * @returns Array of JSON records
 */
export const parseCsvToJson = (file: Express.Multer.File,data:Record<string, any>): Record<string, any>[] => {
  if (!file) {
    throw new AppError('CSV file is required', 400);
  }

  const csvContent = file.buffer.toString('utf8');

  try {
    const records: Record<string, any>[] = parse(csvContent, {
      columns: true, // first row as keys
      skip_empty_lines: true,
      trim: true,
    });

    if (!Array.isArray(records) || records.length === 0) {
      throw new AppError('No data found in CSV', 400);
    }

    return records.map((record: Record<string, any>) => {
      return {
        ...record,
        ...data
      }
    });
  } catch (err) {
    throw new AppError(`Invalid CSV format`, 400,err as any);
  }
};
