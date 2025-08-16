import {FolderOpen} from "lucide-react"

interface props{
    message : string
}
export default function EmptyScreen({message} : props){

    return(
        <div className='h-[50vh] flex flex-col items-center justify-center'>
            <FolderOpen size={70} className='mb-4 text-gray-500'/>
            <h4 className='text-lg text-gray-600'>{message}</h4>
        </div>
    )

}