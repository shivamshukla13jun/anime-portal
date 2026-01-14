import { Request, Response, NextFunction } from "express";

import { ZodError } from "zod";
import mongoose from "mongoose";
import { capitalizeFirstLetter } from "libs";
import config from "config";
import logger from "utils/logger";
import fs from "fs"
import { IFile } from "types/file";
const duplicateKeyFieldUpdate = {
  companyId: "Company",
  name: "Name",
  email: "Email",
  phone: "Phone",
  type: "Invoice Type",
  invoiceNumber: "Invoice Number",
  loadNumber: "Load Number",
  loadId: "Load ID",
  customerId: "Customer ID",
  carrierId: "Carrier ID",
};

const collectionFileds = {
  accountsinvoices: "Invoice",
  accountscontactpeople: "Contact People",
  accountscustomers: "Customers",
  carriers: "Carriers",
  companies: "Companies",
  loads: "Load",
  users: "Users",
  contactpeople: "Contact People",
  customers: "Customers",
  drivers: "Drivers",
  expenses: "Expenses",
  invoices: "Invoices",
  itemservices: "Expense Service",
  paymentterms: "Payment Terms",
  productservices: "Product Services",
  taxservices: "Tax Services",
  chartofaccounts: "Chart of Accounts",
  journalentries: "Journal Entries",
  vendorbills: "Vendor Bills",
  vendorinvoices: "Vendor Invoices",
};

// Custom error class
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: Record<string, any>;

  constructor(message: string, statusCode: number, errors?: Record<string, any>) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Not Found middleware
const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

// Global error handler
const errorHandler = (
  err: Error | AppError | ZodError  | mongoose.Error.ValidationError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err);
  let error = { ...err };
  error.message = err.message;
  // check files are uploaded then remove them 
  if (req.file) {
    //  check esitst or not 
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
  if (req.files && Array.isArray(req.files)) {
    req.files.map((file: IFile) => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
  }

  // If error already is an AppError, use it directly
  if ('statusCode' in err && 'isOperational' in err) {
    return res.status((err as AppError).statusCode).json({
      success: false,
      message: err.message,
      errors: (err as AppError).errors,
      stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
  }

  if (err.message === 'Not allowed by CORS') {
    error = new AppError("You are not allowed to access this resource", 403);
  }

  // Handle MongoDB validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const errors: Record<string, string> = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
    error = new AppError(errors[Object.keys(errors)[0]], 400);
  }

  // Handle MongoDB unique constraint errors
  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    const errorMessage = err.message;
    const collectionMatch = errorMessage.match(/collection: (\w+\.)?(\w+)/);
    const collectionName = collectionMatch ? collectionMatch[2] : "unknown";

    // Get duplicate keys & values together, excluding companyId
    const keyPattern = (err as any).keyPattern || {};
    const keyValue = (err as any).keyValue || {};

    const duplicates = Object.keys(keyPattern)
      .filter((key) => key !== "companyId")
      .map((key) => ({
        key: duplicateKeyFieldUpdate[key as keyof typeof duplicateKeyFieldUpdate] || key,
        value: keyValue[key],
      }));

    const duplicateKey = duplicates.map((d) => d.key).join(" and ");
    const duplicateValue = duplicates.map((d) => `"${d.value}"`).join(" and ");

    error = new AppError(
      `${duplicateKey} ${duplicateValue} already exists in ${capitalizeFirstLetter(
        collectionFileds[collectionName as keyof typeof collectionFileds]
      )}`,
      409,
      {
        [duplicateKey]: `${duplicateKey} ${duplicateValue} already exists in ${capitalizeFirstLetter(
          collectionFileds[collectionName as keyof typeof collectionFileds]
        )}`,
      }
    );
  }

  // Handle MongoDB unique constraint MongoBulkWriteError errors
  if (err.name === "MongoBulkWriteError" && (err as any).code === 11000) {
    const writeError = (err as any).writeErrors?.[0]["err"] // Get the first write error for details
    console.log("writeError",writeError)
    if (writeError && writeError.errmsg) {
      const collectionMatch = writeError.errmsg.match(/collection: (\w+\.)?(\w+)/);
      const collectionName = collectionMatch ? collectionMatch[2] : "unknown";

      const keyMatch = writeError.errmsg.match(/dup key: { (\w+):/);
      const duplicateField = keyMatch ? keyMatch[1] : "unknown field";

      const valueMatch = writeError.errmsg.match(/dup key: { .*?: (.*) }/);
      const duplicateValue = valueMatch ? valueMatch[1] : "unknown value";

      const formattedField = duplicateKeyFieldUpdate[duplicateField as keyof typeof duplicateKeyFieldUpdate] || duplicateField;

      error = new AppError(
        `The value ${duplicateValue} already exists for the field '${formattedField}' in ${capitalizeFirstLetter(collectionFileds[collectionName as keyof typeof collectionFileds])}. Please use a unique value.`,
        409,
        {
          [formattedField]: `The value ${duplicateValue} is already in use.`
        }
      );
    } else {
      error = new AppError(
        'A bulk write operation failed due to a duplicate key error, but details could not be parsed.',
        409
      );
    }
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors: Record<string, string> = {};
    err.issues.forEach((issue) => {
      const path = issue.path.join('.');
      errors[path] = issue.message;
    });
    const messages = err.issues.map(e => e.message).join(", ");
    error = new AppError(messages, 400, errors);
  }

  // Add custom error fields from request if available
  const customErrorFields = (req as any).customErrorFields;
  if (customErrorFields && typeof customErrorFields === 'object') {
    const existingErrors = (error as AppError).errors || {};
    error = new AppError(
      'One or more errors occurred', 
      400, 
      { ...existingErrors, ...customErrorFields }
    );
  }

  // Fallback for other errors
  if (!(error instanceof AppError)) {
    error = new AppError(error.message || "Internal Server Error", 500, error as any);
  }

  res.status((error as AppError).statusCode).json({
    success: false,
    message: (error as AppError).message,
    errors: (error as AppError).errors,
    stack: config.isProduction ? undefined : err.stack,
    statusCode: (error as AppError).statusCode,
  });
};

export { notFound, errorHandler, AppError };
