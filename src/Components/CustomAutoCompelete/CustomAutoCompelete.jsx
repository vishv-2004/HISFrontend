import { Autocomplete, CircularProgress, TextField } from '@mui/material'
import React, { memo, useEffect, useState } from 'react'
import APIManager from '../../utils/ApiManager';

const ApiManager = new APIManager();

function CustomAutoCompelete({url,disable=false,onChange,lable,value,getOptionLabel,readOnly=false,filterOnActive,options,saveData,inputRef,onInputChange,onBlur,hasError}) {
    const [Loading, setLoading] = useState(false);
    const [RealOptios, setRealOptios] = useState([]);

    useEffect(()=> {
    if(disable) return;
        if(options)
        {
            setRealOptios(options);
            setLoading(false);
        }
        else
        {
            setLoading(true);
            const getOptions = async () => {
                const data = await ApiManager.get(`${url}`);
                if(!data.error) {
                    saveData && saveData(data.data.data);
                    if(filterOnActive)
                    {
                        setRealOptios(data.data.data.filter(item=>item?.isActive));
                    } else {
                        setRealOptios(data.data.data);
                    }
                }
                setLoading(false);
            }
            getOptions();
        }
    },[disable]);

  return (
    <Autocomplete
    clearOnEscape
    autoComplete
    autoHighlight
    blurOnSelect
    clearOnBlur
    options={RealOptios}
    value={value} 
    loading={Loading}
    onBlur={onBlur}
    onChange={(event,newValue) => {
      onChange && onChange(newValue);
    }}
    onInputChange={(event,newValue) => {
      onInputChange && onInputChange(newValue);
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        sx={{  "& label.Mui-focused": {
          color: hasError ? '' : "#25396f"
        }, "& .MuiOutlinedInput-root": {
          "&.Mui-focused fieldset": {
            borderColor: hasError ? '' : "#25396f"
          }
        }}}
        label={lable}
        inputRef={inputRef}
        error={hasError}
        InputProps={{ 
          ...params.InputProps,
          endAdornment: (
            <React.Fragment>
              {Loading ? (
                <CircularProgress color="inherit" size={20} />
              ) : null}
              {params.InputProps.endAdornment}
            </React.Fragment>
          )
        }}
      />
    )}
    readOnly={readOnly}
    getOptionLabel={getOptionLabel || null}
    disabled={disable}
  />
  )
}

export default memo(CustomAutoCompelete);