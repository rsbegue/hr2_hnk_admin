import React, { useEffect, useRef } from 'react';
import { useField } from '@unform/core';

export default function Input({ name, ...rest }){
    const inputRef = useRef(null);
    const { fieldName, registerField, defaultValue, error } = useField(name);

    useEffect(() => {
        registerField({
            name: fieldName,
            ref: inputRef.current,
            path: 'value'
        })
    }, [fieldName, registerField]);

    useEffect(() => {
        console.log(error);
        console.log(inputRef.current);
        inputRef.current.setAttribute('error', 'true')
    }, [error]);
    
    return (
        <div style={{ width: '100%' }}>
            <input ref={inputRef} {...rest} defaultValue={defaultValue}/>
            { error && <div><span style={{color: '#f00'}}>{error}</span></div> }
        </div>
    );
}