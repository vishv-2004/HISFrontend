import { useDispatch, useSelector } from "react-redux";
import { setRegistrationCount, setRegistrationCountIncByOne, setRegistrationData, setRegistrationListLoading, setRegistrationLoading } from "../../slices/registration.slice";
import { useEffect } from "react";
import toast from "react-hot-toast";
import APIManager from "../../utils/ApiManager";

const ApiManager = new APIManager();

export const  useFrontOfficeRegistration = () => {

    const dispatch = useDispatch();
  const { registrationData,registrationPagination} = useSelector(State => State.registration);

  const getRegistrationData = async (withLoading=false,page=registrationPagination.page,pageSize=registrationPagination.pageSize) => {
        if(withLoading)
        {
            dispatch(setRegistrationListLoading(true));
        }
        const data = await ApiManager.get(`admin/frontOffice/registration?page=${page}&pageSize=${pageSize}`);
        if(!data.error)
        {
            dispatch(setRegistrationCount(data?.data?.count));
            dispatch(setRegistrationData(data?.data?.data));  
            withLoading && dispatch(setRegistrationListLoading(false));
            return true; 
        }
        if(withLoading)
        {
            dispatch(setRegistrationListLoading(false));
        }
        return false;
    }

    const getRegistrationFindById = async (id) => {
        const toastId = toast.loading("Loading...");    
        const data = await ApiManager.get(`admin/frontOffice/registration/${id}`);

        if(!data.error)
        {
            toast.dismiss(toastId);
            return data.data.data;
        }
        toast.dismiss(toastId);
        return false;   
    }

    const createRegistration = async (data) => {
        dispatch(setRegistrationLoading(true));

        // api calling
        if(data?.image)
        {
                const formData = new FormData();
                for(let i of Object.keys(data))
                {
                    formData.append(i,data[i]);   
                }
                const resData = await ApiManager.postForm(`admin/frontOffice/registration`,formData);

                if(!resData?.error)
                {
                    const { page,pageSize } = registrationPagination;
                    if(Number.isNaN(registrationData?.length) || page*pageSize+pageSize > registrationData?.length) {
                        getRegistrationData();
                    } else { 
                        dispatch(setRegistrationCountIncByOne())
                    }
                    toast.success(resData.message);
                    dispatch(setRegistrationLoading(false));
                    return true;
                } 
                dispatch(setRegistrationLoading(false));
                return false;
        }

         else
          {
            const resData = await ApiManager.post("admin/frontOffice/registration",data);

        if(!resData?.error)
        {
            getRegistrationData();
            toast.success(resData.message);   
            dispatch(setRegistrationLoading(false));
            return true;
        }

        // toast.error(resData?.message);
        dispatch(setRegistrationLoading(false));
        return false;
          }
        
    }


    const updateRegistration = async (data,image) => {
        if(image)
        {
            dispatch(setRegistrationLoading(true));
            try {
                const formData = new FormData();    
                for(let i of Object.keys(data))
                {   
                    formData.append(i,data[i]);   
                }
                formData.append('image',image);
                const resData = await ApiManager.patchForm(`admin/frontOffice/registration`,formData);

                if(!resData?.error)
                {
                    getRegistrationData();
                    toast.success('registration updated successfully');
                    return true;
                }
            } catch (error) {

                // toast.error(error?.message);
                dispatch(setRegistrationLoading(false));
                return false;

            } finally {

                dispatch(setRegistrationLoading(false));
            }

        } else 
        {
            dispatch(setRegistrationLoading(true));

            const resData = await ApiManager.patch(`admin/frontOffice/registration`,data);

            if(!resData?.error)
            {
                getRegistrationData();
                dispatch(setRegistrationLoading(false));
                toast.success("registration updated successfully");   
                return true;
            }
            // toast.error(resData?.message);
            dispatch(setRegistrationLoading(false));
            return false;
        }
        

    }

    const updateActiveStateAndAmount = async (tempData) => {
        dispatch(setRegistrationLoading(true));
        const data = await ApiManager.patch("admin/frontOffice/registration/active",{registrationId:tempData.id,isActive:tempData.value,availableAmount:tempData.availableAmount});

        if(!data.error)
        {
            getRegistrationData();
            toast.success('registration updated successfully');
            dispatch(setRegistrationLoading(false));
            return true;
        }

        // toast.error(data.message);
        dispatch(setRegistrationLoading(false));
        return false;
    }

    useEffect(() => {
        if(!registrationData) 
        {
            getRegistrationData(true);
        }
    },[]);


    return {
        getRegistrationData,
        getRegistrationFindById,
        createRegistration,
        updateRegistration,
        updateStateAndAmount: updateActiveStateAndAmount,
    }

}