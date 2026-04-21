function FormLabel({ children, required = false, htmlFor }) {
    return (
        <label htmlFor={htmlFor} className="form-label">
        {children} {required && <span className="text-danger">*</span>}
        </label>
    );
}

export default FormLabel;