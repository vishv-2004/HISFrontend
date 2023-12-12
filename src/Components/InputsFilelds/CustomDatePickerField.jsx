import React from 'react'
import { Controller } from "react-hook-form";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

function CustomDatePickerField({ name, control, label, required,rules,disable,focused,maxDate }) {
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({
        field: { onChange, value ,onBlur},
        fieldState: { error }
      }) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>

        <DatePicker 
        sx={{  "& label.Mui-focused": {
            color: error ? "" : "#25396f"
          }, "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": {
              borderColor: error ? "" : "#25396f"
            }
          }}}
        label={label}
        disabled={disable}
        autoFocus={focused}
        onChange={onChange}
        maxDate={dayjs(maxDate)}
        value={dayjs(value)}
        slotProps={{
            textField: {
                helperText: error?.message && error?.message ,
                error: !!error,
                onBlur: onBlur,
                required: required,
            },
        }}
        />
        </LocalizationProvider>

       )}
    /> 
  )
}

export default CustomDatePickerField


{/* <TextField
        sx={{
          "& label.Mui-focused": {
            color: ` ${error} ? "#d32f2f" : #25396f`
          },
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": {
              borderColor: `${error} ? "" : "#25396f"`
            }
          }
        }}
          type={ type || "text"}
          helperText={error?.message}
          onBlur={onBlur}
          autoFocus={focused}
          size="medium"
          error={!!error}
          onChange={onChange}
          value={value}
          fullWidth
          label={label}
          variant="outlined"
          required={required}
          disabled={disable}
          inputProps={{...inputPropsText}}
        /> */}