import { useState } from "react";
import { api } from '../../services/api';

import { Button, ContainerInput, Input } from "./styles";


export const Upload = () => {
    const [file, setFile] = useState(null);

    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post('/content/uploads', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    }

    const handleUpload = async (e) => {
        e.preventDefault();

    }
    return(
        <ContainerInput>
            <Input type="file" accept=".pdf" onChange={handleFileChange}/>
            <Button onClick={handleUpload}>Enviar</Button>
        </ContainerInput>
    )
}