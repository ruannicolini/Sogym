import { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { USER_GET, TOKEN_POST, TOKEN_VALIDATE_POST } from "./api";

export const UserContext = createContext();

export const UserStorageProvider = ({children}) => {

    const [data, setData] = useState(null);
    const [login, setLogin] = useState(null);
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);
	const navigate = useNavigate();

	async function getUser(token) {
		const { url, options } = USER_GET(token);
		const response = await fetch(url, options);
		const json = await response.json();
		setData(json);
		setLogin(true);
	}

    async function userLogin(username, password) {
        try {
			setError(null);
			setLoading(true);
			const { url, options } = TOKEN_POST({ email: username, password });
			// const { url, options } = TOKEN_POST({ username, password });
			const tokenRes = await fetch(url, options);
			if (!tokenRes.ok) throw new Error(`Error: Usuário ou senha inválido.`);
			const { token } = await tokenRes.json();
			window.localStorage.setItem("token", token);
			await getUser(token);
			navigate("/conta");
        } catch (err) {
          	setError(err.message);
          	setLogin(false);
        } finally {
          	setLoading(false);
        }
    }

	const userLogout = useCallback(
		async function () {
		  setData(null);
		  setError(null);
		  setLoading(false);
		  setLogin(false);
		  window.localStorage.removeItem("token");
		  navigate("/login");
		},
		[navigate]
	);

	useEffect(() => {
		async function autoLogin() {
		 	const token = window.localStorage.getItem("token");
	
			if (token) {
				try {
					setError(null);
					setLoading(true);
					const { url, options } = TOKEN_VALIDATE_POST(token);
					const response = await fetch(url, options);
					if (!response.ok) throw new Error("Token inválido.");
					await getUser(token);
				} catch (err) {
					userLogout();
				} finally {
					setLoading(false);
				}
			} else {
				setLogin(false);
		  	}
		}
		autoLogin();
	}, [userLogout]);

    return(
        <UserContext.Provider value={{userLogin, userLogout, data, error, loading, login}}>
            {children}
        </UserContext.Provider>
    );
}