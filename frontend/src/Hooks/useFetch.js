import React from "react";

const useFetch = () => {
    const [data, setData] = React.useState(null);
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

    const request = React.useCallback(async (url, options) => {
        let response;
        let json;

        try {

            setError(null);
            setLoading(true);
            response = await fetch(url, options);
            json = await response.json();

            // if (response.ok === false) throw new Error(json.message);
            if (response.ok === false) throw new Error(json.error[0].message);

        } catch (err) {
            
            // setError(err.error);
            setError(err.message);

        } finally {
            setData(json);
            setLoading(false);
            return { response, json };
        }
    }, []);

    function clearError(){
        setError(null);
    }

    return { data, loading, error, request, clearError };
};

export default useFetch;