import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useNodesState, useEdgesState } from "@xyflow/react";
import { useParams } from "react-router-dom";
import { ReactFlow, MiniMap, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Link } from "react-router-dom";


export const Network = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [neurons, setNeurons] = useState([]);
    const { contentId } = useParams();

    const getNeurons = async () => {
        try {
            const { data } = await api.get(`/content/${contentId}`);
            setNeurons(data.neurons);
        } catch (error) {
            console.error(error);
        }
    }
    useEffect(() => {
        getNeurons();
    }, [contentId]);

    const transformToFlow = (neurons) => {
        const nodes = neurons.map((neuron, index) => {
            return {
                id: neuron._id,
                position: { x: index * 200, y: 100 },
                data: { label: neuron.concept }
            };
        });

        const edges = neurons.flatMap((neuron) => {
            return neuron.connections.map((connectionId) => {
                return {
                    id: `${neuron._id}-${connectionId}`,
                    source: neuron._id,
                    target: connectionId
                };
            });
        });

        return { nodes, edges };
    }

    useEffect(() => {
        const { nodes, edges } = transformToFlow(neurons);
        setNodes(nodes);
        setEdges(edges);
    }, [neurons]);

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <MiniMap />
                <Controls />
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
            <Link to={`/session/${contentId}`}>Estudar</Link>
        </div>
    );

}