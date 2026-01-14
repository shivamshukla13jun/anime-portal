
import { Colors } from "@/data/theme";
import {    IFile, Role, } from "@/types";
import moment from "moment";
import api from "./axiosInterceptor";
import { toast } from "react-toastify";
/**
 * @description max input allow
 * @param e event
 * @param n number
 */
const maxinputAllow = (e: React.ChangeEvent<HTMLInputElement>, n: number = 10): void => {
  if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
    e.target.value = '';
    return;
  } else {
    e.target.value = Math.max(0, parseInt(e.target.value)).toString().slice(0, n);
  }
};
const maxnumberInput = (e: React.ChangeEvent<HTMLInputElement>, max: number = 10): void => {
  const rawValue = e.target.value;
  // Allow empty string (user deleting)
  if (rawValue === '') {
    e.target.value = '';
    return;
  }
  const numericValue = parseInt(rawValue, 10);
  // If not a number, clear it
  if (isNaN(numericValue)) {
    e.target.value = '';
    return;
  }
  // Clamp value between 0 and max
  const clampedValue = Math.min(Math.max(numericValue, 0), max);
  e.target.value = clampedValue.toString();
};

/**
 * @description check expiry of  insurance
 * @param expiryDate expiry date
 */
const checkInsuranceExpiryDate = (
  commercialexpiryDate: string,
  automobileexpiryDate: string,
  cargoexpiryDate: string
): boolean => {
  const sevenDaysFromNow = moment().add(7, 'days'); // today + 7 days
  let isExpire = false;

  if (!commercialexpiryDate || !automobileexpiryDate || !cargoexpiryDate) {

    return true;
  }

  const expiryDates = [
    moment(commercialexpiryDate),
    moment(automobileexpiryDate),
    moment(cargoexpiryDate)
  ];

  expiryDates.forEach((expiry, index) => {
    console.info(`expiry${index + 1}:`, expiry.format("DD/MM/YYYY"));
  });

  console.info("Checking against date:", sevenDaysFromNow.format("DD/MM/YYYY"));

  // Check if any expiry is before or equal to 7 days from now
  isExpire = expiryDates.some(expiry => expiry.isSameOrBefore(sevenDaysFromNow));

  console.info("isExpire", isExpire);
  return isExpire;
};

/**
 * @description prevent string input
 * @param e event
 */
const preventStringInput = (e: React.KeyboardEvent<HTMLInputElement>): void => {
  const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'];
  if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
};

/**
 * @description prevent string input with minus
 * @param e event
 */
const preventStringInputWithMinus = (e: React.KeyboardEvent<HTMLInputElement>): void => {
  const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight'];
  if (e.key === '-') {
    const input = e.target as HTMLInputElement;
    if (input.selectionStart !== 0 || input.value.includes('-')) {
      e.preventDefault();
    }
    return;
  }

  if (!/^\d$/.test(e.key) && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
};
/**
 * @description get status color
 * @param status status
 * @returns 
 */
const getStatusColor = (status: string) => {

  switch (status) {
    case 'Pending':
      return Colors.Pending;
    case 'Delivered':
      return Colors.Delivered;
    case 'Cancelled':
      return Colors.Cancelled;
    case 'In Progress':
      return Colors.InProgress;

    case 'Dispatched':
      return Colors.Dispatched;
    case 'Picked Up':
      return Colors.PickedUp;
    case 'Claimed':
      return Colors.Claimed;
    case 'Claimed & Delivered':
      return Colors.ClaimedDelivered;
    case 'customer':
      return Colors.customer;
    case 'carrier':
      return Colors.carrier;
    case 'repair':
      return Colors.repair;
    default:
      return Colors.unknown;
  }
};
/**
 * @description is valid object id
 * @param id id
 * @returns 
 */
const isValidObjectId = (id: string): boolean => {
  return /^[a-f\d]{24}$/i.test(id);
};
// capitalize first letter and after space first letter also
const capitalizeFirstLetter = (str: string) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}
const parseJSON = (value: string | undefined) => {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Error parsing JSON:', error);
    return undefined;
  }
}
const handleFileDownload = async (file: IFile, dest: string) => {


  const fileUrl = `${dest}${file.filename}`;

  try {
    // Fetch the file from the server
    const response = await api.get(fileUrl, { responseType: 'blob' });
    if (!response) throw new Error(`Failed to fetch file`);

    // Get the file as a Blob
    const blob = response.data

    // Create a temporary URL for the Blob
    const blobUrl = URL.createObjectURL(blob);

    // Create and trigger an invisible download link
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = file.originalname; // Force download with filename
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    URL.revokeObjectURL(blobUrl);
    document.body.removeChild(link);
  } catch (error) {
    console.warn('Download error:', error);
    toast.error('Failed to download file');
  }
};

const validPhoneNumber = (value: string) => {
  try {
    // const parsedNumber = phoneUtil.parse(value); // You can pass a second arg like 'US' as default region
    // return phoneUtil.isValidNumber(parsedNumber);
    // check phone number is valid or not
    //check 10 digit number
    let check = value.length === 10;
    return !value ? false : check;
  } catch (error) {
    console.warn("error", error)
    return false;
  }
};
const preventInvalidPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value;

  // Optional: restrict to allowed characters (digits, spaces, dash, parentheses)
  //replace non numeric characters
  value = value.replace(/[^\d]/g, '');
  e.target.value = value;
}
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

const formatDate = (date: string | Date): string => {
  try {
    return moment(new Date(date)).format("MM/DD/YYYY")
  } catch (error) {
    console.warn('Error formatting date:', error);
    return '-';
  }
};

const truncateText = (text: string, maxLength: number = 15): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};
const getFullName = (data: Record<string, any>) => {
  let text = ''
  if(data){

  
  if (data?.title) {
    text += capitalizeFirstLetter(data.title) + ' '
  }
  if (data?.firstName) {
    text += capitalizeFirstLetter(data.firstName) + ' '
  }
  if (data?.lastName) {
    text += capitalizeFirstLetter(data.lastName)
  }
}
 
  return text
}

const downloadCSV = async ({filename="", mimeType="", base64=""}) => {

  const blob = new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
};
const handlePrint = (printRef: React.RefObject<HTMLDivElement>,title:string="") => {
  if (!printRef.current) return;

  // Clone the node so we don't mutate the live DOM
  const clone = printRef.current.cloneNode(true) as HTMLElement;

  // Remove all elements with class "no-print"
  clone.querySelectorAll('.no-print').forEach(el => el.remove());

  const printContents = clone.innerHTML;

  const printWindow = window.open('', '', 'width=1024,height=768');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #ccc;
              padding: 8px;
              font-size: 12px;
            }
            th {
              background: #f5f5f5;
              text-align: left;
            }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
};
const addressformat = ({
  billingAddress
}: {
  billingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}) => {
  let text = '';
  if (billingAddress?.address) {
    text += billingAddress?.address;
  }
  if (billingAddress?.city) {
    text += ', ' + billingAddress?.city;
  }
  if (billingAddress?.state) {
    text += ', ' + billingAddress?.state;
  }
  if (billingAddress?.zipCode) {
    text += ', ' + billingAddress?.zipCode;
  }
  if (billingAddress?.country) {
    text += ', ' + billingAddress?.country;
  }
  return text;
};
const isRole = {
  isSuperAdmin: (role: Role) => {
    return role === "superadmin"
  },
  isAdmin: (role: Role) => {
    return role === "admin"
  },
 
}


export { maxinputAllow,downloadCSV, validPhoneNumber, formatCurrency, formatDate, preventStringInput, capitalizeFirstLetter, getStatusColor, preventStringInputWithMinus, isValidObjectId, parseJSON, handleFileDownload, preventInvalidPhone, checkInsuranceExpiryDate, maxnumberInput, truncateText,isRole, getFullName,handlePrint,addressformat };