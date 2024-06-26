import React, { useRef, useState, useMemo,useEffect } from 'react'
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Switch,
    Box,
    Typography,
    Button
  } from '@mui/material';
import { styled } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Unstable_Grid2';
import Webcam from "react-webcam";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useForm,Controller } from 'react-hook-form';
import { useFrontOfficeRegistration } from '../../services/FrontOffice/Registration';
import { setRegistrationEditData, setRegistrationPagination } from '../../slices/registration.slice';
import { CustomTextInputField } from '../../Components/InputsFilelds/CustomTextInputField';
import CustomDatePickerField from '../../Components/InputsFilelds/CustomDatePickerField';
import CustomAutoCompelete from '../../Components/CustomAutoCompelete/CustomAutoCompelete';
import TableMainBox from '../../Components/TableMainBox/TableMainBox';
import TableSkeleton from '../../Skeleton/TableSkeleton';
import CustomButton from '../../Components/Button/Button';
import AddEditModal from '../../Components/AddEditModal/AddEditModal';
import EmptyData from '../../Components/NoData/EmptyData';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CustomIconButton from '../../Components/CustomeIcons/CustomEditIcons';
import CommonTable from '../../Components/CommonTable/CommonTable';
import { getYearsOrBirthDate } from '../../utils/Common';


function RegistrationMaster() {
    const [ModalOpen, setModalOpen] = useState(false);
    const [DFile, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [webCamOpen,setWebCamOpen] = useState(false);
    const [addAmountModal, setAddAmountModal] = useState(false);
    const webcamRef = useRef(null);

    const { registrationData,registrationLoading,registrationEditData,registrationPagination:paginationModel,registrationCount,registrationListLoading:ListLoading } = useSelector(State => State.registration);
    const dispatch = useDispatch();
    const { handleSubmit, formState: { errors },reset,control,clearErrors,setValue,watch} = useForm({
      defaultValues:{
        branch: null,
        title:null,
        doctor:null,
        age:"",
        email:"",
        passportNo:"",
        pincode:"",
        otherRemarks:"",
        pationName:"",
        guardianName:"",
        gender:null,
        adharCard:"",
        address:"",
        refDoctore:null,
        isActive:"true",
        spouseName:"",
        dob:"",
        mobileNo:"",
        panNo:"",
        city:null,
        bloodGroup:null,
        pationType:null,
        availableAmount:"",
        newAvailableAmount:""
      },
      mode:"onTouched"
    });


    const  { getRegistrationData,createRegistration,updateRegistration,updateStateAndAmount,getRegistrationFindById } = useFrontOfficeRegistration();

    function setRowDataRegistration(data){
        var id = paginationModel.page * paginationModel.pageSize;
        var array = [];
        data?.forEach((element) => {
          let thisData = {
            id: ++id,
            _id: element?._id,
            image:element?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${element?.pationName || 'Guest'}`,
            title:element?.title?.userTitle,
            pationName:element?.pationName,
            doctor:element?.doctor?.userName,
            age:element?.age,
            gender:element?.gender,
            mobileNo:element?.mobileNo,
            email:element?.email,
            city:element?.city?.cityName,
            state:element?.city?.stateId?.stateName,
            bloodGroup:element?.bloodGroup,
            regDateTime:element?.regDateTime,
            isActive:element?.isActive,
            pincode:element?.pincode,
            address:element?.address,
            availableAmount:element?.availableAmount
          };
          array.push(thisData);
        });
    
        return array;
      }

  let TodayDate = new Date().toLocaleDateString('en-CA').toString();


      const CourseImageFile = (e) => {
        const selectedFile = e.target.files[0];
        if(!selectedFile)
        {
          setPreviewUrl(null);
          return;
        }
        setFile(selectedFile);
        
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      };

      const onPaginationChange = async({page,pageSize}) => {
        if(page!==paginationModel.page || pageSize !== paginationModel.pageSize )
        {
          const recentData = structuredClone(paginationModel);
          dispatch(setRegistrationPagination({page,pageSize}));
          if(page!==recentData.page)
          {
              // change the page
                const resData = await getRegistrationData(true,page,pageSize);
                if(!resData)
                {
                  dispatch(setRegistrationPagination(recentData));
                }
    
          } else {
              // change the pageSize
              const resData = await getRegistrationData(true,0,pageSize);
              
              if(resData)
              {
                dispatch(setRegistrationPagination(recentData))
              }
              
          }
        }
    }

      function closeTheModal() {
        setModalOpen(false);
        dispatch(setRegistrationEditData(null));
        reset({
           title:null,
        doctor:null,
        age:"",
        email:"",
        passportNo:"",
        pincode:"",
        otherRemarks:"",
        pationName:"",
        guardianName:"",
        gender:null,
        adharCard:"",
        address:"",
        refDoctore:null,
        isActive:"true",
        spouseName:"",
        dob:"",
        mobileNo:"",
        panNo:"",
        city:null,
        bloodGroup:null,
        pationType:null,
        branch: null,
        });
        setFile(undefined);
        setPreviewUrl(null);
      }

      async function submitData(data) {
 
        let newData = { ...data,bloodGroup:data?.bloodGroup?.value,city:data?.city?._id,gender:data?.gender?.gender,pationType:data?.pationType?.value,title:data?.title?._id,doctor:data?.doctor?._id,refDoctore:data?.refDoctore?._id,dob:data.dob}

        delete newData?.regDateTime;

        if(registrationEditData)
        {
          delete newData.branch; 
          newData={...newData,registrationId:data?._id}
            const temp = await updateRegistration(newData,DFile);
    
            if(temp) {
              closeTheModal();
            } 
    
        } else {

          newData["branchCode"] = newData["branch"].locationCode;
          delete newData._id;
          delete newData.branch; 
          newData = {...newData,image:DFile};
          const temp = await createRegistration(newData);
    
          if(temp) {
            closeTheModal();
          }
        }
    
      }

      function dataURLtoFile(dataurl, filename) {
        var arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[arr.length - 1]), 
            n = bstr.length, 
            u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    }

    const rowData = useMemo(()=> {
        if( Array.isArray(registrationData) && !ListLoading ){
            return setRowDataRegistration(registrationData);
        }
      },[registrationData,ListLoading]);

      useEffect(() => {
          async function GetdataById()
          {
            const data = await getRegistrationFindById(registrationEditData);

            if(data)
            {
              setPreviewUrl(data?.image);
              let newData = { ...data,bloodGroup:data?.bloodGroup ? {value:data?.bloodGroup } : null,gender:{gender:data?.gender},pationType:{value:data?.pationType},dob:new Date(data?.dob).toISOString().split('T')[0],isActive:data?.isActive?.toString()}
              reset(newData);
              setModalOpen(true);
            } else { 
              toast.error("Something went wrong");
            }
          }
        if(registrationEditData)
        {
          GetdataById();
        }
    },[registrationEditData]);

    useEffect(() => {
    },[registrationCount])

    const IOSSwitch = styled((props) => (
        <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
      ))(({ theme }) => ({
        width: 42,
        height: 26,
        padding: 0,
        "& .MuiSwitch-switchBase": {
          padding: 0,
          margin: 2,
          transitionDuration: "300ms",
          "&.Mui-checked": {
            transform: "translateX(16px)",
            color: "#fff",
            "& + .MuiSwitch-track": {
              backgroundColor: theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
              opacity: 1,
              border: 0
            },
            "&.Mui-disabled + .MuiSwitch-track": {
              opacity: 0.5
            }
          },
          "&.Mui-focusVisible .MuiSwitch-thumb": {
            color: "#33cf4d",
            border: "6px solid #fff"
          },
          "&.Mui-disabled .MuiSwitch-thumb": {
            color:
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[600]
          },
          "&.Mui-disabled + .MuiSwitch-track": {
            opacity: theme.palette.mode === "light" ? 0.7 : 0.3
          }
        },
        "& .MuiSwitch-thumb": {
          boxSizing: "border-box",
          width: 22,
          height: 22
        },
        "& .MuiSwitch-track": {
          borderRadius: 26 / 2,
          backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
          opacity: 1,
          transition: theme.transitions.create(["background-color"], {
            duration: 500
          })
        }
      }));

      const columns = [
        {
          field: "id",
          headerName: "ID",
          width:"20"
        },
        {
          field: "actions",
          headerName: "Actions",
          sortable:false,
          align:'center',
          width: 100,
          renderCell: (params) => (
            <div style={{cursor:"pointer",display:"flex",gap:14,marginRight:10}}>
              <div
                onClick={() => {
                  dispatch(setRegistrationEditData(params.row._id));
                }}
              >
               <CustomIconButton/>
              </div>

              <div
                onClick={() => {
                  reset({ availableAmount:params.row.availableAmount,id:params.row._id});
                  setAddAmountModal(true);
                }}
              >
               <CustomIconButton iconName='currency_rupee_outlined'/>
              </div>
            </div>
          ),
        },
        { field: "isActive", headerName: "Is Active", width: 80, 
        renderCell : (params)=>(
           <IOSSwitch checked={params.row.isActive} onChange={(e)=>updateStateAndAmount({ id: params.row._id,value:e.target.checked})}></IOSSwitch> 
          
        )
        },
        {field: "image",headerName: "Profile",rowHeight: 200, renderCell: (params) => (
          <img src={params.row.image} style={{width:"50px",borderRadius:999999999999999999999,height:"50px" }} alt='' />
        ), sortable: false, maxWidth:120,},
        { field: "_id", headerName: "", width: "0" },
        { field: "title", headerName: "userName",width:"130",renderCell:(params)=>`${params?.row?.title} ${params?.row?.pationName}` ,headerAlign: 'center'},
        {field:"doctor",headerName:"Doctor",width:"130",headerAlign: 'center',align: 'center'},
        {field:"age",headerName:"Age",flex:1,headerAlign: 'center',}, 
        {field:"gender",headerName:"Gender",width:100,headerAlign: 'center',align: 'center'},
        { field: "mobileNo", headerName: "Phone Number", width: 150,headerAlign: 'center',align:'center' },
        { field: "email", headerName: "Email", width: 180,headerAlign: 'center',align:'center'},
        {field:"city",headerName:"City",width:150,headerAlign:'center',align:"center"},
        {field:"state",headerName:"State",width:150,headerAlign: 'center',align:"center"},
        {field:"bloodGroup",headerName:"Blood Group",width:"100"},
        { field: "regDateTime", headerName: "Registration Date", width: 200 ,renderCell:(params)=>new Date(params?.row?.regDateTime).toLocaleString(),headerAlign:'center',align:"center"},
        { field: "address", headerName: "Address", width: 200,headerAlign:'center',align:"center" },
        { field: "pincode", headerName: "Code", width: 100 },
        
        
      ];

      const setImageOfWebcam = (image) => {
        setPreviewUrl(image);
        let temp = dataURLtoFile(image,"image.png");      
        setFile(temp);
        setWebCamOpen(false);
      }
    
      useEffect(() =>{ 
          if(webCamOpen==="snapsort")
          {
            setTimeout(() => {
              try { 
                let temp=webcamRef.current.getScreenshot();
                setImageOfWebcam(temp);
              } catch (error) {
    
              }
            }, 800);
          }
      },[webCamOpen])
    
      const onCloseWebCam = () => {
        setWebCamOpen(false);
      }

     async function submitAvailableAmount(data)
     {
        data.availableAmount += Number(data.newAvailableAmount)
        const resData = await updateStateAndAmount(data);
        if(resData) {
          closeTheAvailbleAmountModal();
        }
     }

     function closeTheAvailbleAmountModal(){
        setAddAmountModal(false);
        reset({
          availableAmount:"",
          newAvailableAmount:"",
          id:"" 
        });
     }

     function onDobValueChange(val){
      let year = getYearsOrBirthDate(val?.$d);
      setValue("age",year);
     }

     function  onAgeValueChange(val){
      if(!Number.isInteger(parseInt(val))) return;
      let date = getYearsOrBirthDate(val);
      setValue("dob",date);
     }

  return (
    <>
    <Dialog maxWidth={"md"} fullWidth open={webCamOpen} onClose={onCloseWebCam}>
      <DialogTitle>Take a picture</DialogTitle>
      <DialogContent>
        <div style={{display:"flex",justifyContent:"center"}}>
          
          <Webcam 
          minScreenshotHeight={400}
          minScreenshotWidth={500}
          ref={webcamRef}
          onUserMediaError={()=>{toast.error("Please give webcam permission");setWebCamOpen(false)}}
          />
        </div> 
          <DialogActions style={{marginTop:"1rem"}}>
            <CustomButton onClick={()=>setWebCamOpen(false)} buttonText={'Cancel'}></CustomButton>
            <CustomButton onClick={()=>{setImageOfWebcam(webcamRef.current.getScreenshot())}} buttonText={"Capture"}></CustomButton>
          </DialogActions>
      </DialogContent>
    </Dialog>


    <AddEditModal 
      maxWidth="lg"
      handleClose={closeTheAvailbleAmountModal}
      handleSubmit={handleSubmit(submitAvailableAmount)}
      open={addAmountModal}
      modalTitle={"Update Available Amount"}
      isEdit={false}
      Loading={registrationLoading} 
      > 
            <Box
            component="form"
            onSubmit={handleSubmit(submitAvailableAmount)}
            p={1}
            >
                <Grid 
                    container
                    spacing={{ md:3 ,xs:2 }}
                    // columns={{ xs: 4, sm: 8, md: 12 }}
                    justifyContent="space-between"
                    alignItems="center" 
                > 
                   <Grid xs={12} sm={6}>
                        <CustomTextInputField 
                            name={"availableAmount"}
                            disable={true}
                            type={"number"}
                            control={control}
                            label={"Available Amount"}
                            rules={{valueAsNumber: true,required:{value:true,message:"Please enter the amount to add"}}}
                        /> 
                    </Grid>
                   <Grid xs={12} sm={6}>
                        <CustomTextInputField 
                            name={"newAvailableAmount"}
                            type={"number"}
                            control={control}
                            label={"Add Amount"}
                            rules={{valueAsNumber: true,required:{value:true,message:"Please enter the amount to add",min:{value:1,message:"Please enter the amount to add"}}}}
                        /> 
                    </Grid>
                    
                </Grid>
              </Box>
          </AddEditModal>

    <AddEditModal 
      maxWidth="lg"
      handleClose={closeTheModal}
      handleSubmit={handleSubmit(submitData)}
      open={ModalOpen}
      modalTitle={registrationEditData ? "Update Registration" : "Add Registration"}
      isEdit={!!registrationEditData}
      Loading={registrationLoading} 
      >
            <Box
            component="form"
            onSubmit={handleSubmit(submitData)}
            p={1}
            >
                <Grid 
                    container
                    spacing={{ md:3 ,xs:2  }}
                    // columns={{ xs: 4, sm: 8, md: 12 }}
                    justifyContent="space-between"
                    alignItems="center" 
                > 
                    <Grid xs={12} sm={3}>
                        <Controller
                            name="title"
                            control={control}
                            rules={{ required:{value:true,message:"Patient Title is required"} }}
                            render={({ field,fieldState:{error} }) => {
                                const {onChange,value,ref} = field; 
                            return <CustomAutoCompelete 
                            onChange={onChange}
                            lable={"Select Patient Title"}
                            value={value}
                            getOptionLabel={(option)=>option?.userTitle}
                            url={"admin/addMaster/title"}
                            filterOnActive={true}
                            inputRef={ref}
                            hasError={error}
                            /> 
                            }}

                            > 
                            </Controller>

                            {
                                errors.title && <Typography variant="caption" color="error">Patient Title is required</Typography> 
                            }
                    </Grid>

                    <Grid xs={12} sm={3}>
                     <Controller
                        name="doctor"
                        control={control}
                        rules={{ required: 'Doctor is required' }}
                        render={({ field,fieldState:{error} }) => {
                            const {onChange,value,ref} = field; 
                        return <CustomAutoCompelete 
                        onChange={onChange}
                        lable={"Select Doctor"}
                        value={value}
                        getOptionLabel={(option)=>` ${option?.userName} / ${option?.speciality?.speciality}`}
                        url={"admin/userMaster/user/doctor"}
                        inputRef={ref}
                        hasError={error}
                        /> 
                        }}

                        > 
                        </Controller>

                        {
                            errors.doctor && <Typography variant="caption" color="error">{errors.doctor.message}</Typography> 
                        }
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <CustomTextInputField 
                            name={"age"}
                            type={"number"}
                            control={control}
                            label={"Age"}
                            onChange={(val) => onAgeValueChange(val)}
                            rules={{required:{value:true,message:"Please enter the age"}}}
                        /> 
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <CustomTextInputField 
                        key={"registration"}
                        name={"email"}
                        control={control}
                        label={"Email Address"}
                        rules={{required:{value:true,message:"Email is required"},pattern:{value:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
                        ,message:"Please enter the valid email address"}}}
                        /> 
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <CustomTextInputField 
                            name={"passportNo"}
                            control={control}
                            label={"Passport Number"}
                            rules={{pattern:{value:/^(?!^0+$)[a-zA-Z0-9]{3,20}$/,message:"Please enter valid passport number"}}}
                        /> 
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <CustomTextInputField 
                            name={"pincode"}
                            type={"number"}
                            control={control}
                            label={"Pincode"}
                            rules={{pattern:{value:/^[1-9][0-9]{5}$/,messablge:"Please enter valid pincode"}}}
                        /> 
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <CustomTextInputField 
                            name={"otherRemarks"}
                            control={control}
                            label={"Other Remarks"}
                        /> 
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <CustomTextInputField 
                            name={"pationName"}
                            control={control}
                            label={"Patient Name"}
                            rules={{required:{value:true,message:"Patient Name is required"}}}
                        /> 
                    </Grid>

                     { !registrationEditData &&
                      <Grid item xs={12} md={3}>
                      <Controller
                          name="branch"
                          control={control}
                          rules={{ required: {value: !!registrationEditData,message:'Branch is required'}}}
                          render={({ field,fieldState:{error} }) => {
                              const {onChange,value,ref,onBlur} = field; 
                          return <CustomAutoCompelete 
                          onChange={onChange}
                          lable={"Select current Branch"}
                          value={value}
                          hasError={error}
                          onBlur={onBlur}
                          getOptionLabel={(option)=>option?.location}
                          isOptionEqualToValue={(option, value) => option._id === value._id}
                          url={"admin/locationMaster/getlocation"}
                          filterOnActive={true}
                          inputRef={ref}
                          /> 
                          }}
                          > 
                      </Controller>

                          {
                              errors.branch && <Typography variant="caption" color="error">Branch is required</Typography> 
                          }
                      </Grid>
                    }

                    <Grid xs={12} sm={3}>
                        <CustomTextInputField 
                            name={"guardianName"}
                            control={control}
                            label={"Guardian Name"}
                        /> 
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <Controller
                            name="gender"
                            control={control}
                            rules={{ required: 'Gender is required' }}
                            render={({ field,fieldState:{error} }) => {
                                const {onChange,value,ref} = field; 
                            return <CustomAutoCompelete 
                            onChange={onChange}
                            lable={"Select Gender"}
                            value={value}
                            getOptionLabel={(option)=>option?.gender}
                            options={[
                                { gender: "male" },
                                { gender: "female" },
                                { gender: "other" },
                            ]
                            }
                            inputRef={ref}
                            hasError={error}
                            /> 
                            }}

                            > 
                            </Controller>

                            {
                                errors.gender && <Typography variant="caption" color="error">{errors.gender.message}</Typography> 
                            }
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <CustomTextInputField 
                            name={"adharCard"}
                            control={control}
                            label={"Aadhar Card No"}
                            rules={{pattern:{value:/^\d{12}$/
                            ,message:"Please enter the valid addhar card no"}}}
                        /> 
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <CustomTextInputField 
                            name={"address"}
                            control={control}
                            label={"Address"}
                            rules={{required:{value:true
                            ,message:"Please enter the address"}}}
                        /> 
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <Controller
                            name="refDoctore"
                            control={control}
                            render={({ field,fieldState:{error} }) => {
                                const {onChange,value,ref} = field; 
                            return <CustomAutoCompelete 
                            onChange={onChange}
                            lable={"Select Ref Doctore"}
                            value={value}
                            getOptionLabel={(option)=>` ${option?.userName} / ${option?.speciality?.speciality}`}
                            url={"admin/userMaster/user/refdoctor"}
                            inputRef={ref}
                            hasError={error}
                            /> 
                            }}

                            > 
                        </Controller>
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <Controller
                        name="isActive"
                        control={control}
                        rules={{ required: 'isActive is required' }}
                        render={({ field,fieldState: { error } }) => {
                            const {onChange,value,ref,onBlur} = field; 
                        return <CustomAutoCompelete 
                        onChange={onChange}
                        lable={"Select isActive"}
                        hasError={error}
                        value={value}
                        onBlur={onBlur}
                        inputRef={ref}
                        options={["true","false"]}
                        getOptionLabel={(option)=> option==="true" ? "yes" : "no" }
                        /> 
                        }}
                        />
                        {
                            errors.isActive && <Typography variant="caption" color="error">IsActive is required</Typography> 
                        }
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <CustomTextInputField 
                            name={"spouseName"}
                            control={control}
                            label={"Spouse Name"}
                        /> 
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <CustomDatePickerField 
                          key={"registration"}
                          name={"dob"}
                          control={control}
                          label={"Date of birth"}
                          rules={{valueAsDate:true,required:{value:true,message:"Please enter the dob"}}}
                          onChange={(val) => onDobValueChange(val)}
                          maxDate={TodayDate}
                          />
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <CustomTextInputField 
                            name={"mobileNo"}
                            type={"number"}
                            control={control}
                            label={"Mobile NO"}
                            rules={{required:{value:true,message:"Please enter the mobile number"},minLength:{value:10,message:"Please enter the min length 10"},maxLength:{value:10,message:"Please enter the max length 10"},pattern:{value:/^[0-9]*$/,message:"Please enter the valid mobile number"}}}
                        /> 
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <CustomTextInputField 
                            name={"panNo"}
                            control={control}
                            label={"Enter Pan No"}
                            rules={{minLength:{value:10 , message:"Please enter the valid pan no"},pattern:{
                                value:/[A-Z]{5}[0-9]{4}[A-Z]{1}/ , message:"Please enter the valid pan no"
                            }}}
                        /> 
                    </Grid>

                    <Grid xs={12} sm={3}>
                     <Controller
                        name="city"
                        control={control}
                        rules={{ required: 'City is required' }}
                        render={({ field,fieldState:{error} }) => {
                            const {onChange,value,ref} = field; 
                        return <CustomAutoCompelete 
                        onChange={onChange}
                        lable={"Select City"}
                        value={value}
                        getOptionLabel={(option)=>option?.cityName}
                        url={"admin/regionMaster/city"}
                        filterOnActive={true}
                        inputRef={ref}
                        hasError={!!error}
                        /> 
                        }}

                        > 
                        </Controller>
                        {
                            errors.city && <Typography variant="caption" color="error">City is required</Typography> 
                        }
                    </Grid>

                    <Grid xs={12} sm={3}>
                       <Controller
                            name="bloodGroup"
                            control={control}
                            render={({ field,fieldState:{error} }) => {
                                const {onChange,value,ref} = field; 
                            return <CustomAutoCompelete 
                            onChange={onChange}
                            lable={"Select Blood Group"}
                            value={value}
                            getOptionLabel={(option)=>option?.value}
                            options={[
                                { value: "A +Ve" },
                                { value: "A -Ve" },
                                { value: "AB +Ve" },
                                { value: "AB -Ve" },
                                { value: "B +Ve" },
                                { value: "B -Ve" },
                                { value: "Not Known" },
                                { value: "O +Ve" },
                                { value: "O -Ve" }
                            ]
                            }
                            inputRef={ref}
                            hasError={!!error}
                            /> 
                            }}

                            > 
                            </Controller> 
                    </Grid>

                    <Grid xs={12} sm={3}>
                        <Controller
                            name="pationType"
                            control={control}
                            rules={{ required: 'Patient Type is required' }}
                            render={({ field,fieldState:{error} }) => {
                                const {onChange,value,ref} = field; 
                            return <CustomAutoCompelete 
                            onChange={onChange}
                            lable={"Select Patient Type"}
                            value={value}
                            getOptionLabel={(option)=>option?.value}
                            inputRef={ref}
                            options={[{value:"NORMAL"},{value:"STAFF"},{value:"STAFF DEPEDNET"},{value:"VIP"}]}
                            hasError={!!error}
                            /> 
                            }}

                            > 
                            </Controller>

                            {
                                errors.pationType && <Typography variant="caption" color="error">Patient Type is required</Typography> 
                            }
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <label htmlFor="image">
                            <Button component="label" variant="contained" fullWidth startIcon={<CloudUploadIcon />} style={{
                                background: "#25396f",
                                textTransform: 'none',
                                letterSpacing: "1px",
                                transition: "background 0.3s ease",
                                padding:"0.5rem 0.5rem",
                                '&:hover': {
                                background: 'rgba(37, 57, 111, 0.85)',
                                },}} >
                            <input
                              type="file"
                              className="form-control"
                              style={{ display: "none" }}
                              id="image"
                              accept=".png, .jpg, .jpeg"
                              onChange={CourseImageFile}
                            />
                            Upload Image
                            </Button>
                        </label>
                    </Grid>

                    <Grid xs={12} md={3}>
                    {previewUrl ? (
                      <>
                          <img
                            src={previewUrl}
                            alt="Preview"
                            style={{ width: "100%", height: "100%",maxWidth:'300px',objectFit:"contain" }}
                          />
                          <Button style={{color:"#25396f",cursor:"pointer",margin:'0 auto'}} fullWidth onClick={()=>{setFile(null);setPreviewUrl(null)}} variant={"text"} >Cancle</Button>
                      </>
                        ) : <Typography style={{color:"#25396f"}} textAlign={"center"}>No Image Uploaded</Typography>}
                    </Grid>

                    <Grid xs={12} md={3}>
                        <CustomButton buttonText={'Open WebCam'} fullWidth onClick={()=>setWebCamOpen(true)}></CustomButton>
                    </Grid>

                    <Grid xs={12} md={3}>
                        <CustomButton buttonText={'Take SnapShot'} fullWidth  onClick={()=>setWebCamOpen('snapsort')}></CustomButton>
                    </Grid>

                    <Grid xs={12} md={3}>

                    </Grid>

                </Grid>
            </Box>
    </AddEditModal>

    <TableMainBox
        title={"Registration List"}
        buttonText={"Add Registration"}
        onClick={() => {setModalOpen(true);clearErrors();}}
        >
            {
                ListLoading ? <><LinearProgress /><TableSkeleton /></> : Array.isArray(rowData) && rowData.length !== 0 ? ( 
                <CommonTable columns={columns} count={registrationCount} paginationModel={paginationModel} rowData={rowData} onPaginationChange={onPaginationChange} />) : (<EmptyData />)
            }
        </TableMainBox>                        
    
    </>
  )
}

export default RegistrationMaster