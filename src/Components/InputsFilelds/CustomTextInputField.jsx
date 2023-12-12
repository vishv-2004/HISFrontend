import { Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";

export const CustomTextInputField = ({ name, control, label, required,rules,disable,type,focused,inputPropsText={} }) => {
  return (
    <Controller
      name={name}
      rules={rules}
      control={control}
      render={({
        field: { onChange, value ,onBlur},
        fieldState: { error }
      }) => (
        <TextField
        // sx={{
        //   "& label.Mui-focused": {
        //     color: ` ${error} ? "#d32f2f" : #25396f`
        //   },
        //   "& .MuiOutlinedInput-root": {
        //     "&.Mui-focused fieldset": {
        //       borderColor: `${error} ? "" : "#25396f"`
        //     }
        //   }
        // }}
        sx={{  "& label.Mui-focused": {
          color: error ? "" : "#25396f"
        }, "& .MuiOutlinedInput-root": {
          "&.Mui-focused fieldset": {
            borderColor: error ? "" : "#25396f"
          }
        }}}
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
        />
      )}
    />
  );
};