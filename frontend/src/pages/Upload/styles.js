import styled from "styled-components";

export const ContainerInput = styled.div`
    padding: 5px;
`;
export const Input = styled.input`
    width: 350px;
    height: 35px;
    border-radius: 100px;
    border: none;
    background-color: #181b22;
    color: #fff;
    padding: 5px 15px;
    outline: none;

    &::placeholder {
        color: transparent;
    }

    &:focus + label,
    &:not(:placeholder-shown) + label {
        top: -8px;
        font-size: 12px;
        color: #ffffff;
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px #181b22 inset !important;
        -webkit-text-fill-color: #fff !important;
        transition: background-color 5000s ease-in-out 0s;
    }
`;

export const Button = styled.button`
    padding: 20px 40px;
    width: 350px;
    border-radius: 15px;
    font-size: 18px;
    background: #8a8a8a;
    background: linear-gradient(90deg, rgba(138, 138, 138, 1) 0%, rgba(130, 130, 130, 1) 5%, rgba(191, 191, 191, 1) 50%, rgba(255, 255, 255, 1) 99%);
`;