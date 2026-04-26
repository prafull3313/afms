const FILE_NAME = "afms.xlsx";

export const handleExcel = async (entry) => {
    try {
        const response = await fetch("/api/excel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fileName: FILE_NAME,
                data: [entry]
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to update Excel file.");
        }

        return result;
    } catch (err) {
        console.error(`Error updating ${FILE_NAME}:`, err.message);
        throw err;
    }
};
