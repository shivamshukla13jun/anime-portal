import fs from 'fs';
import moment from 'moment-timezone';
import { Request } from 'express';
import { AppError } from 'middlewares/error';
import CryptoJS from 'crypto-js';
export class encrypt {
  //  variables s and require uitlities function for middleares
  private static SECRET_KEY = process.env.CRYPTO_ENCRYPTION_KEY as string
  public static encryptData = (text: string): string => {
    try {
      const json = JSON.stringify(text);
      return CryptoJS.AES.encrypt(json, this.SECRET_KEY).toString();
    } catch (error) {
      console.warn('Encryption error:', error);
      throw new AppError('Failed to encrypt data', 400);
    }
  }
  public static decryptData = async (cipherText: string): Promise<any> => {
    try {
      if (!cipherText) {
        throw new AppError('No data to decrypt', 400);
      }
      const bytes = CryptoJS.AES.decrypt(cipherText, this.SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        throw new AppError('Decryption failed', 400);
      }
      return JSON.parse(decrypted);
    } catch (error) {
      console.warn('Decryption error:', error);
      throw new AppError('Failed to decrypt data', 400);
    }
  };
}
const createRegex = (value: string) =>
  new RegExp(value.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
const parseJSON = (value: string | undefined, IsReturnValue?: boolean) => {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Error parsing JSON:', error);
    return !IsReturnValue ? undefined : value;
  }
}
const parseReqBody = (req: Request) => {
  try {
    Object.keys(req.body).forEach(key => {
      req.body[key] = parseJSON(req.body[key])
    })
    return req.body
  } catch (error) {
    console.warn('Error parsing JSON:', error);
    return req.body;
  }
}

function generateNumber(length: number = 4): number {
  if (length !== 4) {
    throw new Error('Required 4 length');
  }
  return Math.floor(1000 + Math.random() * 9000);
}
// Ensure all required directories exist
const ensureDirectoryExists = (directory: string) => {
  if (!fs.existsSync(directory)) {
    try {
      fs.mkdirSync(directory, { recursive: true });
      console.info(`Created directory: ${directory}`);
    } catch (error) {
      console.warn(`Error creating directory ${directory}:`, error);
      throw new Error(`Failed to create upload directory: ${directory}`);
    }
  }
};
function isThirtyMinutesBefore(timeStr: string): boolean {
  const now = new Date();
  const [hours, minutes] = timeStr.split(":").map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  // Check if the target time is within the next 30 minutes
  const diffMs = target.getTime() - now.getTime();
  return diffMs > 0 && diffMs <= 30 * 60 * 1000;
}

/**
 * Combines a Date object and a time string (HH:mm) into a full Date in IST timezone.
 * @param date Date-only (no time)
 * @param time Time string in HH:mm format
 * @returns Date object representing IST datetime
 */
function combineDateAndTime(date: Date, time: string): Date | null {
  try {
    if (!date || !time) return null;

    // Format date to YYYY-MM-DD
    const dateStr = moment(date).format('YYYY-MM-DD');

    // Validate and parse time
    const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) return null;

    const [_, hours, minutes] = timeMatch;

    // Combine date and time in IST
    const combined = moment.tz(`${dateStr} ${hours}:${minutes}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');

    // Return as JS Date object (still representing IST time)
    return combined.toDate();
  } catch (error) {
    console.warn('Error combining date and time:', error);
    return null;
  }
}

// capitalize first letter and after space first letter also
const capitalizeFirstLetter = (str: string) => {
  return str ? str.replace(/\b\w/g, (char) => char.toUpperCase()) : "";
}

const convertToArray = (field: any) => typeof field === 'string' ? field.split(',').filter(Boolean) : field;
export { createRegex, parseJSON, generateNumber, convertToArray, ensureDirectoryExists, isThirtyMinutesBefore, combineDateAndTime, parseReqBody, capitalizeFirstLetter }