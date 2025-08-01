import { useCreatePost } from '../../../hooks/useCreatePost';
import '../../../styles/dashboard/CreatePostFlow.scss';


export default function CreatePostFlow({ currentUser, userData }) {
    return (
        <div className='create-post-flow'>
            {useCreatePost(currentUser, userData)}
        </div>
    )
}
