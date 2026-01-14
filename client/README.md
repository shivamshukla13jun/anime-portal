# Invoice Calculation Utilities

This module provides helper functions for calculating **invoice totals**, **tax amounts**, **discounts**, and **balance due** in a form-driven invoicing system built with [`react-hook-form`](https://react-hook-form.com/).

The functions work with `IInvoice` and `IAccountsInvoice` data structures and support:

- Product/Service account lookups
- Expense calculations with optional taxes
- Subtotal, discount, tax, and total computation
- Payment and balance tracking

---

## Functions Overview

### 1. `serviceGetQuery(service, form)`
Retrieves the `incomeAccount` for a given product/service in the form.

**Parameters**
- `service` – The `_id` of the selected product/service.
- `form` – `UseFormReturn<IAccountsInvoice | IInvoice>` instance.

**Returns**
- The `incomeAccount` string, or an empty string if not found.

---

### 2. `calculateexpenseAmount(expense, data)`
Calculates the total amount for a single expense, including tax if applicable.

**Parameters**
- `expense` – An `invoiceexpense` object.
- `data` – Current invoice data.

**Returns**
- The total amount (`rate * qty + taxAmount`).

---

### 3. `loadAmountWithTax(amount, data)`
Adds tax to a given amount based on the invoice's selected tax.

**Parameters**
- `amount` – Base amount.
- `data` – Current invoice data.

**Returns**
```ts
{
  totalAmount: number, // amount + tax
  taxAmount: number    // only the tax portion
}
```

---

### 4. `calculateExpenseTotalAmount(expenseArray, baseAmount)`
Sums up the total amount of all expenses without applying tax.

**Parameters**
- `expenseArray` – Array of `invoiceexpense` objects.
- `baseAmount` – Optional starting amount.

**Returns**
- Sum of all expense amounts plus the base amount.

---

### 5. `calculateExpenseTaxAmount(expense, data)`
Calculates the tax amount for a single expense, respecting whether its tax is editable.

**Parameters**
- `expense` – `invoiceexpense` object.
- `data` – Invoice data.

**Returns**
- The tax amount for that expense.

---

### 6. `calculateInvoiceSummary(form)`
Generates a full invoice summary for **sales invoices**.

**Process**
1. Gets the base amount from `getRateInvoiceData`.
2. Computes **SubTotal** by summing non-tax-editable expenses + base amount.
3. Calculates **Total Expenses** (without tax).
4. Applies **Discount** (percentage).
5. Adds **Tax Amount** (sum of all expense taxes).
6. Determines **Total** = After discount + Tax.
7. Calculates **Balance Due** = Total - Received Payment Amount.

**Updates Form Values**
- `subTotal`, `totalDiscount`, `taxAmount`, `total`, `balanceDue`, `totalExpenses`.

**Returns**
```ts
{
  subTotal,
  totalDiscount,
  taxAmount,
  totalExpenses,
  total,
  balanceDue
}
```

---

### 7. `calculateAccountsInvoiceSummary(form)`
Generates a full invoice summary for **account-based invoices** (no base product/service amount).

**Process**
- Similar to `calculateInvoiceSummary` but starts with a `baseAmount` of `0`.

**Returns**
- Same shape as `calculateInvoiceSummary`.

---

## Example Usage

```ts
import { useForm } from 'react-hook-form';
import { calculateInvoiceSummary } from './invoiceCalculations';
import { IInvoice } from '@/types';

const form = useForm<IInvoice>({
  defaultValues: {
    expense: [],
    discountPercent: 0,
    recievedPaymentAmount: []
  }
});

// Recalculate totals whenever form data changes
const summary = calculateInvoiceSummary(form);

console.log(summary.total, summary.balanceDue);
```

---

## Data Interfaces

### `invoiceexpense`
```ts
interface invoiceexpense {
  rate: number;
  qty: number;
  tax?: string;
  taxEditable?: boolean;
  amount?: number;
}
```

### `ITaxOption`
```ts
interface ITaxOption {
  _id: string;
  value: number; // Tax rate percentage
}
```

---

## Key Notes
- All calculations rely on **react-hook-form**’s `watch()` method for reactive form updates.
- Functions are split into **atomic utilities** (e.g., `calculateExpenseTaxAmount`) and **aggregators** (e.g., `calculateInvoiceSummary`).
- Ensure `taxArray` in invoice data contains the tax rates for correct tax calculations.
- Discounts are applied **before tax** in the summary.


# Invoice Calculation Logic

This document explains how the system calculates invoice totals, taxes, discounts, and balance due.

---

## 1. Get the Base Amount
- **Sales invoices:** Start with the base product/service amount using `getRateInvoiceData`.
- **Account invoices:** Start with `0` (no main service charge).

---

## 2. Calculate Subtotal
```
Subtotal = Base Amount + Sum of non-tax-editable expense amounts
```
- Expense Amount = `rate × quantity`
- Only expenses where **taxEditable = false** are included here.

---

## 3. Calculate Total Expenses
```
Total Expenses = Sum of all expense amounts (without tax)
```
- This is used to track pure operational costs before taxes are added.

---

## 4. Apply Discount
```
Total Discount = Subtotal × (Discount % / 100)
```
- The discount is always applied **before** adding taxes.

---

## 5. Calculate Tax Amount
For each expense:
1. Find the tax rate from `taxArray`.
2. If `taxEditable = true`, use the invoice’s default tax instead of the expense’s own tax.
3. Calculate:
```
Expense Tax = (rate × quantity) × (taxRate / 100)
```
- **Total Tax Amount** = sum of all expense taxes.

---

## 6. Calculate Total After Discount
```
Total After Discount = Subtotal − Total Discount
```

---

## 7. Add Taxes to Get Total Invoice Amount
```
Total Invoice Amount = Total After Discount + Total Tax Amount
```

---

## 8. Calculate Balance Due
1. Add up all `recievedPaymentAmount`.
2. Subtract from total invoice amount:
```
Balance Due = Total Invoice Amount − Total Received Amount
```
- If received amount > total invoice amount → Balance Due = `0`.

---

## 9. Update Form Values
After calculations, the form is updated with:
- `subTotal`
- `totalDiscount`
- `taxAmount`
- `total`
- `balanceDue`
- `totalExpenses`

---

## Summary Flow
1. **Start** with base amount.  
2. Add **non-tax-editable expenses** → **Subtotal**.  
3. Apply **discount**.  
4. Calculate **taxes**.  
5. Add taxes to get **Total**.  
6. Subtract received payments → **Balance Due**.
