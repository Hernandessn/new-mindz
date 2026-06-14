import { useState } from "react";
import { api } from '../../services/api';
import { useNavigate } from "react-router-dom";


import { 
    Button, 
    ContainerInput, 
    Input 
} from "./styles";
import { toast } from "react-toastify";


export const Upload = () => {
    const [file, setFile] = useState(null);
    const [neurons, setNeurons] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const [title, setTitle] = useState('');

    const navigate = useNavigate();

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
            toast.success('Arquivo enviado com sucesso!');
            setNeurons(data.neurons);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao enviar o arquivo, tente novamente!');

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

    const handleConfirm = async () => {
        try {
            const { data } = await api.post('/content/confirm', { title, neurons });
            toast.success('Conteúdo confirmado com sucesso!');
            navigate(`/network/${data.contentId}`)
        } catch (error) {
            console.error(error);
            toast.error('Erro ao gerar conteúdo!');
        }
    }
    return (
        <ContainerInput>
            <Input
                type="text"
                placeholder="Título do Conteúdo"
                value={title}
                onChange={(e) => setTitle(e.target.value)} />
                <Button onClick={handleConfirm} disabled={neurons.length === 0}>Confirmar</Button>
            <Input type="file" accept=".pdf" onChange={handleFileChange} />
            <Button onClick={handleUpload}>Criar neurônios</Button>
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