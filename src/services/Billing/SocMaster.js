import APIManager from "../../utils/ApiManager";
import { useEffect } from "react";
import { useDispatch,useSelector } from "react-redux";
import { setBedTypeData, setSocCount, setSocCountIncByOne, setSocData, setSocListLoading, setSocLoading } from "../../slices/soc.slice";
import toast from 'react-hot-toast';

const ApiManager = new APIManager();

export const useSocMasterData = () => {
    const { socData,socPagination:paginationModal } = useSelector(state => state.soc)   
    const dispatch = useDispatch();

    async function getSocMasterData(withLoading=false,page=paginationModal.page,pageSize=paginationModal.pageSize) {
        withLoading && dispatch(setSocListLoading(true));

        const promiseResData = ApiManager.get(`admin/billing/soc?page=${page}&pageSize=${pageSize}`);
        const promiseBedTypeData = ApiManager.get("admin/addMaster/bedtype");

        const temp =await Promise.all([promiseResData,promiseBedTypeData]);

        if(!Array.isArray(temp)) return; 

        const [ resData, bedTypeData ] = temp;  

        if(!bedTypeData.error){
            dispatch(setBedTypeData(bedTypeData.data.data));
        }

        if(!resData.error){
            dispatch(setSocData(resData.data.data));
            dispatch(setSocCount(resData.data.count));
            withLoading && dispatch(setSocListLoading(false));
            return true;
        }

        withLoading && dispatch(setSocListLoading(false));
        return false;
    }


    async function getSocMasterDataById(id) {
        const toastId = toast.loading("Loading...")
        const resData = await ApiManager.get(`admin/billing/soc/${id}`);

        if(!resData.error){
            toast.dismiss(toastId);
            return resData.data.data;
        }
        toast.dismiss(toastId);
        return null;
    }

    async function createSocMaster(data)  {
        const toastId = toast.loading("Loading...");
        dispatch(setSocLoading(true));

        const resData = await ApiManager.post("admin/billing/soc",data);

        if(!resData.error){
            const { page,pageSize } = paginationModal;

            if(Number.isNaN(socData?.length) || page*pageSize+pageSize > socData?.length) {
                getSocMasterData(false,page,pageSize);
            } else {
                dispatch(setSocCountIncByOne());
            }

            toast.dismiss(toastId);
            toast.success(resData.message);
            dispatch(setSocLoading(false))
            return true;
        }

        toast.dismiss(toastId);
        dispatch(setSocLoading(false))
        return false;
    }

    async function updateSocMaster(data) {
        const toastId = toast.loading("Loading...");
        dispatch(setSocLoading(true));

        const resData = await ApiManager.patch(`admin/billing/soc/${data._id}`,data);

        if(!resData.error){
            const tempData = structuredClone(socData);
            tempData[data.id] = resData.data.data;
            dispatch(setSocData(tempData));
            toast.dismiss(toastId);
            toast.success(resData.message);
            dispatch(setSocLoading(false));
            return true;
        }

        toast.dismiss(toastId);
        dispatch(setSocLoading(false));
        return false;
    };


    useEffect(() => {
        !socData && getSocMasterData(true); 
    },[]);

    return {
        getSocMasterData,
        createSocMaster,
        updateSocMaster,
        getSocMasterDataById
    }
}

