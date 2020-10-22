import React, { InputHTMLAttributes } from 'react';
import { Field, useField } from 'formik';
import { FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/core';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    name: string,
    label: string,
    placeholder: string,
    noInputError?: boolean,
    textarea?: boolean
};

// "" => false
// error message stuff => true

export const InputField: React.FC<InputFieldProps> = ({ label, placeholder, noInputError, textarea, size: _, ...props }) =>
{
    let InputOrTextarea = Input;
    if (textarea)
    {
        InputOrTextarea = Textarea
    }

    const [field, { error }] = useField(props);

    if (!noInputError)
    {
        return (
            <FormControl isInvalid={!!error}>
                <FormLabel htmlFor={field.name}>{label}</FormLabel>
                <InputOrTextarea {...field} id={Field.name} placeholder={placeholder} type={props.type} {...props} />
                { error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>
        );
    } else
    {
        return (
            <FormControl>
                <FormLabel htmlFor={field.name}>{label}</FormLabel>
                <Input {...field} id={Field.name} placeholder={placeholder} type={props.type} {...props} />
            </FormControl>
        );
    }


}