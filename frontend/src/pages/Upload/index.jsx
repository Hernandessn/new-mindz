import { useState } from "react";
import { api } from '../../services/api';

import { Button, ContainerInput, Input } from "./styles";


export const Upload = () => {
    const [file, setFile] = useState(null);
    const [neurons, setNeurons] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);

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

    const handleRemove = (index) => {
        const updated = neurons.filter((_, i) => i !== index);
        setNeurons(updated);
    }

    const handleEditConcept = (index, newValue) => {
        const updated = [...neurons];
        updated[index].concept = newValue;
        setNeurons(updated);
    }

    return (
        <ContainerInput>
            <Input type="file" accept=".pdf" onChange={handleFileChange} />
            <Button onClick={handleUpload}>Enviar</Button>
            {neurons.map((neuron, index) => (
                <div key={index}>
                    {editingIndex === index ? (
                        <Input
                            type="text"
                            value={neuron.concept}
                            onChange={(e) => handleEditConcept(index, e.target.value)}
                            onBlur={() => setEditingIndex(null)}
                            autoFocus
                        />
                    ) : (
                        <div>{neuron.concept}</div>
                    )}

                    <Button onClick={() => handleRemove(index)}>Remover</Button>
                    <Button onClick={() => setEditingIndex(index)}>Editar</Button>
                </div>
            ))}

        </ContainerInput>
    )
}