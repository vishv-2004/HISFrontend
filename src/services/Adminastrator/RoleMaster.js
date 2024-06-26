import toast from "react-hot-toast";
import APIManager from "../../utils/ApiManager";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setRoleCount, setRoleCountIncByOne, setRoleData, setRoleListLoading, setRoleLoading } from "../../slices/role.slice";

const ApiManager = new APIManager();


export const useRoleData = () => {

    const dispatch = useDispatch();
    const {roleLoading:Loading,roleData,rolePagination} = useSelector(state => state.role); 

    function setListLoading(value) {
        dispatch(setRoleListLoading(value));
    }

    const getRoleData = async (withLoading=false,page=rolePagination.page,pageSize=rolePagination.pageSize) => {
    if(withLoading)
        {
            
            setListLoading(true);
        }
        const data = await ApiManager.get(`admin/RoleMaster/getrole?page=${page}&pageSize=${pageSize}`);
        if(!data.error)
        {
            dispatch(setRoleCount(data?.data?.count))
            dispatch(setRoleData(data?.data?.data));
            withLoading && setListLoading(false);
            return true;
        }
        if(withLoading)
        {
            setListLoading(false);
        }
        return false;
    }

    const updateRole = async (data,resetAll) => {
        const toastId = toast.loading("Loading...");
        dispatch(setRoleLoading(true));
        const resData = await ApiManager.patch(`admin/RoleMaster/updaterole/${data._id}`,data);
        
        if(!resData.error)
        {
            resetAll();
            const temp = structuredClone(roleData); 
            temp[data?.id] = resData.data.data;
            dispatch(setRoleData(temp));
            toast.success(resData.message);
            toast.dismiss(toastId)
            dispatch(setRoleLoading(false));
            return true;
        }
        toast.dismiss(toastId)
        dispatch(setRoleLoading(false));
        return false;
    }


    const addRole = async (data,resetAll) => {
        dispatch(setRoleLoading(true));
        const resData = await ApiManager.post("admin/RoleMaster/addrole",data);

        if(!resData.error)
        {
            const { page,pageSize } = rolePagination;
            if(Number.isNaN(roleData?.length) || page*pageSize+pageSize > roleData?.length) {
                getRoleData(false,page,pageSize);
            } else { 
                dispatch(setRoleCountIncByOne())
            }
            resetAll();
            toast.success(resData.message);
            dispatch(setRoleLoading(false))
            return true;
        }
        dispatch(setRoleLoading(false));
        return false;
    }


    useEffect(()=>{
    if(!roleData)
        getRoleData(true);
    },[]);

    return {
        updateRole,
        addRole,
        Loading,
        getRoleData,
    }
}

