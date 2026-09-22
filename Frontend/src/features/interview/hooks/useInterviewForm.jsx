import { useMemo, useState } from "react";

const initialForm = {
    jobDescription: "",
    selfDescription: "",
    resumeFile: null,
};

export default function useInterviewForm() {
    const [form, setForm] = useState(initialForm);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState("");

    const canSubmit = useMemo(() => {
        return (
            form.jobDescription.trim().length > 20 && form.selfDescription.trim().length > 20 && !isLoading
        );
    }, [form, isLoading]);

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setError("");
    };

    const setResume = (file) => {
        setForm((prev) => ({ ...prev, resumeFile: file }));
        setError("");
    };

    const submit = async () => {
        if (!canSubmit) {
            setError("Please provide more details in both fields before generating the report.");
            return;
        }

        setIsLoading(true);
        setError("");
        setResult("");

        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            setResult("Great job! Your interview report is ready. Check your dashboard for detailed next steps.");
        } catch {
            setError("Unable to generate report. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return {
        form,
        isLoading,
        error,
        result,
        canSubmit,
        updateField,
        setResume,
        submit,
    };
}
