import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { UserContext } from "../../UserContext";
import { ReactComponent as MinhasFotos } from "../../Assets/feed.svg";
import { ReactComponent as AdicionarFoto } from "../../Assets/adicionar.svg";
import { ReactComponent as Sair } from "../../Assets/sair.svg";
import useMedia from "../../Hooks/useMedia";
import styles from "./UserHeaderNav.module.css";

const UserHeaderNav = () => {
	const {userLogout} = React.useContext(UserContext);
	const [mobileMenu, setMobileMenu] = React.useState(false);
	const mobile = useMedia("(max-width: 40rem");

	const { pathname } = useLocation();
	React.useEffect(() => {
		setMobileMenu(false);
	}, [pathname]);

	return (
		<>
		
			{mobile && (
				<button
				aria-label="Menu"
				className={`${styles.mobileButton} ${
					mobileMenu && styles.mobileButtonActive
				}`}
				onClick={() => setMobileMenu(!mobileMenu)}
				></button>
			)}

			<nav className={`${mobile ? styles.navMobile : styles.nav} ${
				mobileMenu && styles.navMobileActive
			}`}>
				<NavLink to="/conta" end >
					<MinhasFotos />
					{mobile && "Consultar"}
				</NavLink>
				<NavLink to="/conta/aluno" end >
					<AdicionarFoto />
					{mobile && "Aluno"}
				</NavLink>
				<NavLink to="/conta/professor" end >
					<AdicionarFoto />
					{mobile && "Professor"}
				</NavLink>
				<NavLink to="/conta/equipamento" end >
					<AdicionarFoto />
					{mobile && "Equipamento"}
				</NavLink>
				<NavLink to="/conta/ficha" end >
					<AdicionarFoto />
					{mobile && "Ficha"}
				</NavLink>
				<NavLink to="/conta/exercicio" end >
					<AdicionarFoto />
					{mobile && "Exercicio"}
				</NavLink>
				<button onClick={userLogout}>
					<Sair />
					{mobile && "Sair"}
				</button>
			</nav>

		</>
	);
}
  
  export default UserHeaderNav;
  