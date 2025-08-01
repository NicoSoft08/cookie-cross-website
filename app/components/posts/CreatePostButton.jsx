import { PenLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ui/CreatePostButton.scss';
import { getCreatePostRedirectPath } from '../../utils/redirects/createPostRedirect';

export default function CreatePostButton({ currentUser }) {
    const navigate = useNavigate();

    const handleCreatePost = () => {
        const path = getCreatePostRedirectPath(currentUser);
        navigate(path);
    };

    return (
        <button
            title='Créer une annonce'
            onClick={handleCreatePost}
            className='create-post-button'
        >
            <PenLine size={24} className='icon' />
        </button>
    );
};
