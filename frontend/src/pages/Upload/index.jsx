import { useState } from "react";
import { api } from '../../services/api';

import { Button, ContainerInput, Input } from "./styles";


export const Upload = () => {
    const [file, setFile] = useState(null);
    const [neurons, setNeurons] = useState([]); 

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    }

    const handleUpload = async (e) => {
        try {
            e.preventDefault();
            const formData = new FormData();
            formData.append('file', file);

            const { data } = await api.post('/content/uploads', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setNeurons(data.neurons);
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <ContainerInput>
            <Input type="file" accept=".pdf" onChange={handleFileChange} />
            <Button onClick={handleUpload}>Enviar</Button>
            {neurons.map((neuron, index) => (
                <div key={index}>
                    {neuron.concept}
                </div>
            ))}
        </ContainerInput>
    )
}