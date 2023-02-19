import React from "react";
import { useLocation } from "react-router-dom";
import UserHeaderNav from './UserHeaderNav';
import styles from './UserHeader.module.css';

function UserHeader() {
	const [title, setTitle] = React.useState("");
  	const location = useLocation();

	React.useEffect(() => {
		const { pathname } = location;

		switch (pathname) {
			case "/conta/aluno":
				setTitle("Alunos");
			break;
			case "/conta/professor":
				setTitle("Professores");
			break;
			case "/conta/equipamento":
				setTitle("Equipamentos");
			break;
			case "/conta/ficha":
				setTitle("Fichas");
			break;
			case "/conta/exercicio":
				setTitle("Exercicios");
			break;
			default:
				setTitle("Minha conta");
		}
	}, [location]);

	return (
		<header className={styles.header}>
			<UserHeaderNav />
			<h1 className="title">{title}</h1>
		</header>
	);
}
  
  export default UserHeader;
  