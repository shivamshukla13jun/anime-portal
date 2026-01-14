import React from "react";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import moment, { Moment } from "moment";

interface CommonDatePickerProps {
  name: string;
  value?: string | Date | null;
  readOnly?: boolean;
  onChange: any;
  required?: boolean;
  placeholder?: string;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  isTimePicker?: boolean;
  className?: string;
  error?: boolean;
  helperText?: string;
  size?: "small" | "medium";
}

const CommonDatePicker: React.FC<CommonDatePickerProps> = ({
  name,
  value = null,
  readOnly = false,
  onChange,
  required = false,
  placeholder = "Select Date/Time",
  label = "Date/Time",
  minDate,
  maxDate,
  isTimePicker = false,
  className = "form-control",
  error = false,
  helperText = "",
  size = "medium",
}) => {
  const handleChange = (newValue: Moment | null) => {
    if (!newValue) {
      onChange({ target: { name, value: "" } });
      return;
    }

    const formattedValue = isTimePicker
      ? newValue.format("HH:mm")
      : newValue.format("YYYY-MM-DD");

    onChange({
      target: {
        name,
        value: formattedValue,
      },
    });
  };

  const parseValue = (val: string | Date | Moment | null) => {
    if (!val || val === "") return null;
    if (moment.isMoment(val)) return val;
    if (isTimePicker && typeof val === "string") {
      // For time picker, base date with only time
      return val ? moment(`1970-01-01T${val}`) : null;
    }
    return moment(val);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      {isTimePicker ? (
        <TimePicker
          label={label}
          value={parseValue(value)}
          onChange={handleChange}
          disabled={readOnly}
          slotProps={{
            textField: {
              required,
              className,
              placeholder,
              fullWidth: true,
              error,
              helperText,
              size,
            },
          }}
        />
      ) : (
        <DatePicker
          label={label}
          value={parseValue(value) || undefined}
          onChange={handleChange}
          format="DD-MM-YYYY"
          disabled={readOnly}
          minDate={minDate ? parseValue(minDate) || undefined : undefined}
          maxDate={maxDate ? parseValue(maxDate) || undefined : undefined}
          slotProps={{
            textField: {
              required,
              className,
              placeholder,
              fullWidth: true,
              error,
              helperText,
              size,
            },
          }}
        />
      )}
    </LocalizationProvider>
  );
};

export default CommonDatePicker;
